import { GameState } from "../common/types"; 
import { randomizePowerUp, update } from "./../common/GameUpdate";
import { drawBall, drawRect, drawScore, drawPowerUp, drawField } from "../common/Draw";
import { getBotActive, predictBallY, moveBot } from "../common/BotState";


// Helper per ottenere canvas e ctx in modo sicuro
function getCanvasAndCtx() {
  const canvas = document.getElementById("pong") as HTMLCanvasElement | null;
  if (!canvas) throw new Error("Canvas not found!");
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
  return { canvas, ctx };
}

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
	  x: Math.random() * (canvas.width - 200) + 100,
	  y: Math.random() * (canvas.height - 200) + 100,
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
let currentGameId: number | null = null;
let gameCreated = false;

// Sovrascrivi la funzione resetAfterPoint (o chiamala dove aggiorni i punteggi)
const originalResetAfterPoint = (window as any).resetAfterPoint;
(window as any).resetAfterPoint = async function(x: number, game: GameState) {
  if (x < game.canvas.width / 2) {
	// Segna la destra
	game.scoreRight++;
	// if (typeof currentGameId === "number")
	//   await updateGameField(currentGameId, "2_scores", game.scoreRight.toString());
  } else {
	// Segna la sinistra
	game.scoreLeft++;
	// if (typeof currentGameId === "number")
	//   await updateGameField(currentGameId, "1_scores", game.scoreLeft.toString());
  }
  if (originalResetAfterPoint) originalResetAfterPoint(x, game);
};

export async function TwoGameLoop(paddleColor1: string, paddleColor2: string) {
  const { canvas, ctx } = getCanvasAndCtx();
  // Crea stato di gioco solo la prima volta
  
  if (!(window as any).game || (window as any).game.canvas !== canvas) {
	(window as any).game = createInitialGameState(canvas);
	setupKeyboard((window as any).game);
	predictedY = predictBallY((window as any).game.ball, (window as any).game.rightPaddle[0].x, canvas);
	gameCreated = false;
	currentGameId = null;
  }
  const game: GameState = (window as any).game;

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
	// const res = await createGame(players);
	const res = { id: 123 }; // Simulazione risposta backend
	currentGameId = res.id;
	} catch (error) {
	  console.error("Failed to create game on backend:", error);
	  // Continua il gioco anche se il backend non risponde
	  currentGameId = null;
	}
	gameCreated = true;
  }

  // Fine partita
  if (game.scoreLeft >= game.maxScore || game.scoreRight >= game.maxScore) {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = "white";
	ctx.font = "40px Arial";
	const winner = game.scoreLeft > game.scoreRight ? "Giocatore 1" : "Giocatore 2";
	ctx.fillText(`${winner} ha vinto!`, canvas.width / 2, canvas.height / 2);

	if (currentGameId) {
	//   await updateGameField(currentGameId, "1_scores", game.scoreLeft.toString());
	//   await updateGameField(currentGameId, "2_scores", game.scoreRight.toString());
	//   await updateGameField(currentGameId, "status", "finished");
	  const players = [
		game.leftPaddle[0].nickname,
		game.rightPaddle[0].nickname
	  ];
	  players.forEach((nickname, idx) => {
		let result = 0;
		if (
		  (game.scoreLeft > game.scoreRight && idx === 0) ||
		  (game.scoreRight > game.scoreLeft && idx === 1)
		) result = 2;
		// else if (game.scoreLeft === game.scoreRight) result = 1;
		// addGameToStats(nickname, currentGameId!, result, 2);
	  });
	}

	if (botInterval) {
	  clearInterval(botInterval);
	  botInterval = undefined;
	}

	currentGameId = null;
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