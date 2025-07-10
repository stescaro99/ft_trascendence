import { GameState } from "../common/types"; 
import { randomizePowerUp, update } from "./../common/GameUpdate";
import { drawBall, drawRect, drawScore, drawPowerUp, drawField } from "../common/Draw";
import { getBotActive, predictBallY, moveBot } from "../common/BotState";
import { User } from "../../../model/user.model";
import { UserService } from "../../../service/user.service";
import { GameService } from "../../../service/game.service";
import { Game } from "../../../model/game.model";

// Helper per ottenere canvas e ctx in modo sicuro
function getCanvasAndCtx() {
	const canvas = document.getElementById("pong") as HTMLCanvasElement | null;
	if (!canvas) throw new Error("Canvas not found!");
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
  return { canvas, ctx };
}
const user : User = localStorage.getItem('user') || JSON.parse(localStorage.getItem('user') || '{}');
const userService: UserService = new UserService();
let gameRoom : Game = new Game();
const gameService: GameService = new GameService();

function getPlayerNick(index: number, side: "left" | "right") {
  // Prova prima a prendere dall'utente loggato
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      if (side === "left" && index === 0 && user.nickname) {
        return user.nickname;
      }
    } catch (e) {
      console.error('Error parsing user data:', e);
    }
  }
  
  return window.localStorage.getItem(`${side}Player${index + 1}`) || 
         (side === "left" ? "Giocatore 1" : "Giocatore 2");
}

function createInitialGameState(canvas: HTMLCanvasElement): GameState {
  const paddleHeight = canvas.height / 5;
  const paddleWidth = 10;

  return {
	ball: {
	  x: canvas.width / 2,
	  y: canvas.height / 2,
	  dx: 5,
	  dy: 5,
	  radius: 10,
	  speed: 1.5
	},
	leftPaddle: [
	  {
		x: 30,
		y: canvas.height / 2 - paddleHeight / 2,
		dy: 0,
		speed: 6,
		height: paddleHeight,
		nickname: getPlayerNick(0, "left")
	  }
	],
	rightPaddle: [
	  {
		x: canvas.width - paddleWidth - 30,
		y: canvas.height / 2 - paddleHeight / 2,
		dy: 0,
		speed: 6,
		height: paddleHeight,
		nickname: getPlayerNick(0, "right")
	  }
	],
	powerUp: {
	  x: Math.random() * canvas.width / 2 + canvas.width / 4,
	  y: Math.random() * canvas.height / 2 + canvas.height / 4,
	  width: 20,
	  height: 20,
	  active: true,
	  type: "",
	  color: ""
	},
	scoreLeft: 0,
	scoreRight: 0,
	paddleHeight: paddleHeight,
	paddleWidth: paddleWidth,
	canvas: canvas,
	waitingForStart: false,
	maxScore: 5,
	paddleSpeed: 6
  };
}

// === Eventi tastiera ===

const keys: { [key: string]: boolean } = {};
let keyboardSetup = false;

// === Eventi tastiera ===
function setupKeyboard(game: GameState)
{
  if (keyboardSetup) return;
  
  document.addEventListener("keydown", (e) => {
	keys[e.key] = true;
	updatePaddleMovement(game);
  });

  document.addEventListener("keyup", (e) => {
	keys[e.key] = false;
	updatePaddleMovement(game);
  });
  
  keyboardSetup = true;
}

function updatePaddleMovement(game: GameState)
{
  if (keys["w"] && keys["s"]) {
	game.leftPaddle[0].dy = 0;
  } else if (keys["w"]) {
	game.leftPaddle[0].dy = -game.leftPaddle[0].speed;
  } else if (keys["s"]) {
	game.leftPaddle[0].dy = game.leftPaddle[0].speed;
  } else {
	game.leftPaddle[0].dy = 0;
  }

  if (!getBotActive(0)) {
	if (keys["ArrowUp"] && keys["ArrowDown"]) {
	  game.rightPaddle[0].dy = 0;
	} else if (keys["ArrowUp"]) {
	  game.rightPaddle[0].dy = -game.rightPaddle[0].speed;
	} else if (keys["ArrowDown"]) {
	  game.rightPaddle[0].dy = game.rightPaddle[0].speed;
	} else {
	  game.rightPaddle[0].dy = 0;
	}
  }
}

// === Funzioni di disegno ===
function render(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, game: GameState, paddleColor1: string, paddleColor2: string) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawField(ctx, canvas);
  drawRect(ctx, game.leftPaddle[0].x, game.leftPaddle[0].y, game.paddleWidth, game.leftPaddle[0].height, paddleColor1);
  drawRect(ctx, game.rightPaddle[0].x, game.rightPaddle[0].y, game.paddleWidth, game.rightPaddle[0].height, paddleColor2);
  drawBall(ctx, game.ball);
  drawScore(ctx, canvas, game.scoreLeft, game.scoreRight);
  drawPowerUp(ctx, game.powerUp);
}

// === Game loop ===
let botInterval: number | undefined = undefined;
let predictedY: number | null = null;
let gameCreated = false;


// Sovrascrivi la funzione resetAfterPoint (o chiamala dove aggiorni i punteggi)
const originalResetAfterPoint = (window as any).resetAfterPoint;
(window as any).resetAfterPoint = async function(x: number, game: GameState) {
  if (x < game.canvas.width / 2) {
	// Segna la destra
	game.scoreRight++;
	gameRoom.scores = [game.scoreLeft, game.scoreRight++];
	 if (typeof gameRoom.game_id === "number")
		this.gameService.updateGame(gameRoom.game_id, "2_scores", game.scoreRight.toString());
  } else {
	// Segna la sinistra
	game.scoreLeft++;
	gameRoom.scores = [game.scoreLeft++, game.scoreRight];
	if (typeof gameRoom.game_id === "number")
		this.gameService.updateGame(gameRoom.game_id, "1_scores", game.scoreLeft.toString());
  }
  if (originalResetAfterPoint) originalResetAfterPoint(x, game);
};
let lastLogTime = 0;
const LOG_INTERVAL = 3000;
export async function TwoGameLoop(paddleColor1: string, paddleColor2: string) {
  
	
	const { canvas, ctx } = getCanvasAndCtx();

  // Crea stato di gioco solo la prima volta
  
  if (!(window as any).game || (window as any).game.canvas !== canvas) {
	(window as any).game = createInitialGameState(canvas);
	setupKeyboard((window as any).game);
	predictedY = predictBallY((window as any).game.ball, (window as any).game.rightPaddle[0].x, canvas);
	gameCreated = false;
	gameRoom.game_id = undefined;
  }
  const game: GameState = (window as any).game;
  const now = Date.now();
  if (now - lastLogTime > LOG_INTERVAL) {
    console.log("DEBUG Auto-log:", {
      scoreLeft: game.scoreLeft,
      scoreRight: game.scoreRight,
      gameId: gameRoom.game_id,
      gameCreated: gameCreated,
      timestamp: new Date().toLocaleTimeString()
    });
    lastLogTime = now;
  }
  
  // Crea partita su backend solo la prima volta
  if (!gameCreated)
  {
	randomizePowerUp(game);
	const players = [
	  game.leftPaddle[0].nickname,
	  game.rightPaddle[0].nickname
	];
	console.log("Players:", players);
	
	try {
	gameService.addGame([user.nickname, 'guest']
	).then((response) => {
		console.log("Game created on backend:", response);
		console.log("response.game:", response.game);
		console.log("response.game.game_id:", response.game.game_id);
		
		gameRoom = response.game;
		console.log("gameRoom after assignment:", gameRoom);
		console.log("gameRoom.game_id after assignment:", gameRoom.game_id);
	
		}).catch((error) => {
		console.error("DEBUG: Failed to create game:", error);
		gameRoom.game_id = undefined;
		});
	} catch (error) {
	  console.error("Failed to create game on backend:", error);
	  // Continua il gioco anche se il backend non risponde
	  gameRoom.game_id = undefined;
	}
	gameCreated = true;
  }

  // Fine partita
	if (game.scoreLeft >= game.maxScore || game.scoreRight >= game.maxScore) {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.fillStyle = "white";
		ctx.font = "40px Arial";
		const winner = game.scoreLeft > game.scoreRight ? localStorage.getItem("nickname") : "Giocatore 2";
		ctx.fillText(`${winner} ha vinto!`, canvas.width / 2, canvas.height / 2);

		if (gameRoom.game_id) {
			gameService.updateGame(gameRoom.game_id, "1_scores", game.scoreLeft.toString())
			.then(() => console.log("DEBUG: Successfully updated left score to:", game.scoreLeft))
			.catch((error) => console.error("DEBUG: Failed to update left score:", error));
			gameService.updateGame(gameRoom.game_id, "2_scores", game.scoreRight.toString())
			.then(() => console.log("DEBUG: Successfully updated right score to:", game.scoreRight))
			.catch((error) => console.error("DEBUG: Failed to update right score:", error));


		const players = [
		game.leftPaddle[0].nickname,   // idx = 0 (giocatore sinistro)
		game.rightPaddle[0].nickname   // idx = 1 (giocatore destro)
		];

		players.forEach((nickname, idx) => {
		let result = 0;
		
		if (game.scoreLeft === game.scoreRight) {
			result = 1; // pareggio per entrambi
		} else if (
			(game.scoreLeft > game.scoreRight && idx === 0) ||  // sinistro vince E sono il giocatore sinistro
			(game.scoreRight > game.scoreLeft && idx === 1)     // destro vince E sono il giocatore destro
		) {
			result = 2; // vittoria per questo giocatore
		} else {
			result = 0; // sconfitta per questo giocatore
		}
		if (idx === 0) {
			gameService.upDateStat(nickname, gameRoom.game_id!, result)
				.then(() => console.log(`DEBUG: Successfully updated stats for ${nickname} with result:`, result))
				.catch((error) => console.error(`DEBUG: Failed to update stats for ${nickname}:`, error));
			}
		});

		// Determina il vincitore e aggiorna una volta sola
		let winnerNickname = "";
		if (game.scoreLeft > game.scoreRight) {
		winnerNickname = game.leftPaddle[0].nickname;
		} else if (game.scoreRight > game.scoreLeft) {
		winnerNickname = game.rightPaddle[0].nickname;
		} else {
		winnerNickname = "Draw"; // o gestisci il pareggio come preferisci
		}

		gameService.updateGame(gameRoom.game_id, "winner_nickname", winnerNickname)
		.then(() => console.log("DEBUG: Successfully updated winner nickname to:", winnerNickname))
		.catch((error) => console.error("DEBUG: Failed to update winner nickname:", error));
	}

	if (botInterval) {
	  clearInterval(botInterval);
	  botInterval = undefined;
	}

	gameRoom.game_id = undefined;
	gameCreated = false;

	return;
  }

  // Bot logic
  function moveBotPaddle() {
	if (!getBotActive(0)) return;
	const bot = game.rightPaddle[0];
	const randomOffset = (Math.random() - 0.5) * 200;
	predictedY = predictBallY(game.ball, bot.x, canvas) + randomOffset;
  }

  if (getBotActive(0) && predictedY !== null) {
	moveBot(game.rightPaddle[0], predictedY);
  }

  if (!botInterval && getBotActive(0)) {
	botInterval = setInterval(moveBotPaddle, 1000);
  }

  update(game);
  render(ctx, canvas, game, paddleColor1, paddleColor2);
  requestAnimationFrame(() => TwoGameLoop(paddleColor1, paddleColor2));
}