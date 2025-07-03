import { GameState } from "./../common/types"; 
import { update, randomizePowerUp } from "./../common/GameUpdate";
import { drawBall, drawRect, drawScore, drawPowerUp, drawField } from "../common/Draw";
import { getBotActive, predictBallY, moveBot } from "../common/BotState";
// import { updateGameField, createGame } from "../services/gameService";
// import { addGameToStats } from "../services/statsService";

// Helper per ottenere canvas e ctx in modo sicuro
function getCanvasAndCtx() {
  const canvas = document.getElementById("pong") as HTMLCanvasElement | null;
  if (!canvas) throw new Error("Canvas not found!");
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
  return { canvas, ctx };
}

function getPlayerNick(index: number, side: "left" | "right") {
  return window.localStorage.getItem(`${side}Player${index + 1}`) || `${side === "left" ? "L" : "R"}${index + 1}`;
}

function createInitialGameState(canvas: HTMLCanvasElement): GameState {
  const paddleHeight = canvas.height / 6;
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
		speed: 4,
		height: paddleHeight,
		nickname: getPlayerNick(0, "left")
	  },
	  {
		x: canvas.width / 7,
		y: canvas.height / 2 - paddleHeight / 2,
		dy: 0,
		speed: 4,
		height: paddleHeight,
		nickname: getPlayerNick(1, "left")
	  }
	],
	rightPaddle: [
	  {
		x: canvas.width - paddleWidth - 30,
		y: canvas.height / 2 - paddleHeight / 2,
		dy: 0,
		speed: 4,
		height: paddleHeight,
		nickname: getPlayerNick(0, "right")
	  },
	  {
		x: canvas.width - canvas.width / 7 - paddleWidth,
		y: canvas.height / 2 - paddleHeight / 2,
		dy: 0,
		speed: 4,
		height: paddleHeight,
		nickname: getPlayerNick(1, "right")
	  }
	],
	powerUp: {
	  x: Math.random() * (canvas.width - 200) + 10,
	  y: Math.random() * (canvas.height - 200) + 10,
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
	paddleSpeed: 1.5
  };
}

// === Sistema di tracking dei tasti ===

const keys: { [key: string]: boolean } = {};
let keyboardSetup = false; // Flag per evitare duplicazioni degli event listener

// === Eventi tastiera ===
function setupKeyboard(game: GameState) {
  // Evita di aggiungere più volte gli stessi event listener
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

function updatePaddleMovement(game: GameState) {
  // Player 1 (leftPaddle[0]) - W/S keys
  if (keys["w"] && keys["s"]) {
	game.leftPaddle[0].dy = 0;
  } else if (keys["w"]) {
	game.leftPaddle[0].dy = -game.leftPaddle[0].speed;
  } else if (keys["s"]) {
	game.leftPaddle[0].dy = game.leftPaddle[0].speed;
  } else {
	game.leftPaddle[0].dy = 0;
  }

  // Player 2 (leftPaddle[1]) - A/Z keys
  if (!getBotActive(1)) {
	if (keys["a"] && keys["z"]) {
	  game.leftPaddle[1].dy = 0;
	} else if (keys["a"]) {
	  game.leftPaddle[1].dy = -game.leftPaddle[1].speed;
	} else if (keys["z"]) {
	  game.leftPaddle[1].dy = game.leftPaddle[1].speed;
	} else {
	  game.leftPaddle[1].dy = 0;
	}
  }

  // Player 3 (rightPaddle[0]) - Arrow keys
  if (!getBotActive(2)) {
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

  // Player 4 (rightPaddle[1]) - I/K keys
  if (!getBotActive(3)) {
	if (keys["i"] && keys["k"]) {
	  game.rightPaddle[1].dy = 0;
	} else if (keys["i"]) {
	  game.rightPaddle[1].dy = -game.rightPaddle[1].speed;
	} else if (keys["k"]) {
	  game.rightPaddle[1].dy = game.rightPaddle[1].speed;
	} else {
	  game.rightPaddle[1].dy = 0;
	}
  }
}

// === Funzioni di disegno ===
function render(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, game: GameState, TeamLeft: string, TeamRight: string) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawField(ctx, canvas);
  game.leftPaddle.forEach(p => {
	drawRect(ctx, p.x, p.y, game.paddleWidth, p.height, TeamLeft);
  });
  game.rightPaddle.forEach(p => {
	drawRect(ctx, p.x, p.y, game.paddleWidth, p.height, TeamRight);
  });
  drawBall(ctx, game.ball);
  drawScore(ctx, canvas, game.scoreLeft, game.scoreRight);
  drawPowerUp(ctx, game.powerUp);
}

// === Game loop ===
let botInterval: number | undefined = undefined;
let predictedY: (number | null)[] = [null, null, null, null];
let currentGameId: number | null = null;
let gameCreated = false;

// Funzione da chiamare ogni volta che una squadra segna
// async function updateScoreOnBackend(game: GameState) {
//   if (!currentGameId) return;
//   await updateGameField(currentGameId, "1_scores", game.scoreLeft.toString());
//   await updateGameField(currentGameId, "2_scores", game.scoreRight.toString());
// }

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

export async function FourGameLoop(TeamLeft: string, TeamRight: string)
{
  const { canvas, ctx } = getCanvasAndCtx();

  // Crea stato di gioco solo la prima volta
  if (!(window as any).game4 || (window as any).game4.canvas !== canvas) {
	(window as any).game4 = createInitialGameState(canvas);
	setupKeyboard((window as any).game4);
	predictedY = [
	  null,
	  predictBallY((window as any).game4.ball, (window as any).game4.leftPaddle[1].x, canvas),
	  predictBallY((window as any).game4.ball, (window as any).game4.rightPaddle[0].x, canvas),
	  predictBallY((window as any).game4.ball, (window as any).game4.rightPaddle[1].x, canvas),
	];
	gameCreated = false;
	currentGameId = null;
  }
  const game: GameState = (window as any).game4;

  // Crea partita su backend solo la prima volta
  if (!gameCreated)
  {
	randomizePowerUp(game);
	const players = [
	  game.leftPaddle[0].nickname,
	  game.leftPaddle[1].nickname,
	  game.rightPaddle[0].nickname,
	  game.rightPaddle[1].nickname
	];
	
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
	const winner = game.scoreLeft > game.scoreRight ? "Team 1" : "Team 2";
	ctx.fillText(`${winner} ha vinto!`, canvas.width / 2, canvas.height / 2);

	if (currentGameId) {
	//   await updateGameField(currentGameId, "1_scores", game.scoreLeft.toString());
	//   await updateGameField(currentGameId, "2_scores", game.scoreRight.toString());
	//   await updateGameField(currentGameId, "status", "finished");
	  const players = [
		game.leftPaddle[0].nickname,
		game.leftPaddle[1].nickname,
		game.rightPaddle[0].nickname,
		game.rightPaddle[1].nickname
	  ];
	  players.forEach((nickname, idx) => {
		let result = 0;
		if (
		  (game.scoreLeft > game.scoreRight && idx < 2) ||
		  (game.scoreRight > game.scoreLeft && idx >= 2)
		) result = 2;
		// else if (game.scoreLeft === game.scoreRight) result = 1;
		// addGameToStats(nickname, currentGameId!, result, 4);
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
	if (getBotActive(1)) {
	  const randomOffset = (Math.random() - 0.5) * 200;
	  predictedY[1] = predictBallY(game.ball, game.leftPaddle[1].x, canvas) + randomOffset;
	}
	if (getBotActive(2)) {
	  const randomOffset = (Math.random() - 0.5) * 200;
	  predictedY[2] = predictBallY(game.ball, game.rightPaddle[0].x, canvas) + randomOffset;
	}
	if (getBotActive(3)) {
	  const randomOffset = (Math.random() - 0.5) * 200;
	  predictedY[3] = predictBallY(game.ball, game.rightPaddle[1].x, canvas) + randomOffset;
	}
  }

  if (getBotActive(1) && predictedY[1] !== null) {
	moveBot(game.leftPaddle[1], predictedY[1]!);
  }
  if (getBotActive(2) && predictedY[2] !== null) {
	moveBot(game.rightPaddle[0], predictedY[2]!);
  }
  if (getBotActive(3) && predictedY[3] !== null) {
	moveBot(game.rightPaddle[1], predictedY[3]!);
  }

  if (!botInterval && (getBotActive(1) || getBotActive(2) || getBotActive(3))) {
	botInterval = setInterval(moveBotPaddle, 1000);
  }

  update(game);
  render(ctx, canvas, game, TeamLeft, TeamRight);
  requestAnimationFrame(() => FourGameLoop(TeamLeft, TeamRight));
}