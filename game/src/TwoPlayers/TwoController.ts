import { GameState, Paddle } from "../common/types"; 
import { update } from "./../common/GameUpdate";
import { drawBall, drawRect, drawScore, drawPowerUp, drawField } from "../common/Draw";
import { getBotActive, predictBallY, moveBot } from "../common/BotState";
import { updateGameField, createGame } from "../services/gameService";
import { addGameToStats } from "../services/statsService";

const canvas = document.getElementById("pong") as HTMLCanvasElement;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

const paddleHeight = canvas.height / 5;
const paddleWidth = 10;

const powerUpType = (() => {
  const types = ["IncreaseSize", "SpeedBoost"];
  return types[Math.floor(Math.random() * types.length)];
})();

const typeToColor: { [key: string]: string } = {
  IncreaseSize: "00ff00",
  DecreaseSize: "ff0000",
  SpeedBoost: "ffff00"
};

function getPlayerNick(index: number, side: "left" | "right") {
    return window.localStorage.getItem(`${side}Player${index + 1}`) || `${side === "left" ? "L" : "R"}${index + 1}`;
}

const game: GameState = {
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
    x: Math.random() * (canvas.width - 200) + 10,
    y: Math.random() * (canvas.height - 200) + 10,
    width: 20,
    height: 20,
    active: true,
    type: powerUpType,
    color: typeToColor[powerUpType]
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

// === Eventi tastiera ===

document.addEventListener("keydown", (e) => {
    if (e.key === "w") game.leftPaddle[0].dy = -game.leftPaddle[0].speed;
    if (e.key === "s") game.leftPaddle[0].dy = game.leftPaddle[0].speed;
    if (!getBotActive(0) && e.key === "ArrowUp") game.rightPaddle[0].dy = -game.rightPaddle[0].speed;
    if (!getBotActive(0) && e.key === "ArrowDown") game.rightPaddle[0].dy = game.rightPaddle[0].speed;
  });
  
document.addEventListener("keyup", (e) => {
    if (e.key === "w" || e.key === "s") game.leftPaddle[0].dy = 0;
    if (!getBotActive(0) && (e.key === "ArrowUp" || e.key === "ArrowDown")) game.rightPaddle[0].dy = 0;
  });

// === Funzioni di disegno ===

function render(paddleColor1: string, paddleColor2: string)
{
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

function moveBotPaddle() {
  if (!getBotActive(0)) return;
  const bot = game.rightPaddle[0];

  const randomOffset = (Math.random() - 0.5) * 200;

  predictedY = predictBallY(game.ball, bot.x) + randomOffset;
}

let predictedY: number | null = predictBallY(game.ball, game.rightPaddle[0].x);

let currentGameId: number | null = null;
let gameCreated = false;

// Funzione da chiamare ogni volta che una squadra segna
async function updateScoreOnBackend() {
  if (!currentGameId) return;
  await updateGameField(currentGameId, "1_scores", game.scoreLeft.toString());
  await updateGameField(currentGameId, "2_scores", game.scoreRight.toString());
}

// Sovrascrivi la funzione resetAfterPoint (o chiamala dove aggiorni i punteggi)
const originalResetAfterPoint = (window as any).resetAfterPoint;
(window as any).resetAfterPoint = async function(x: number, game: GameState) {
  if (x < game.canvas.width / 2) {
    // Segna la destra
    game.scoreRight++;
    if (typeof currentGameId === "number")
      await updateGameField(currentGameId, "2_scores", game.scoreRight.toString());
  } else {
    // Segna la sinistra
    game.scoreLeft++;
    if (typeof currentGameId === "number")
      await updateGameField(currentGameId, "1_scores", game.scoreLeft.toString());
  }
  if (originalResetAfterPoint) originalResetAfterPoint(x, game);
};

export async function TwoGameLoop(paddleColor1: string, paddleColor2: string)
{
  if (!gameCreated) {
    const players = [
      game.leftPaddle[0].nickname,
      game.rightPaddle[0].nickname
    ];
    const res = await createGame(players);
    currentGameId = res.id;
    gameCreated = true;
  }

  if (game.scoreLeft >= game.maxScore || game.scoreRight >= game.maxScore)
  {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "white";
      ctx.font = "40px Arial";
      const winner = game.scoreLeft > game.scoreRight ? "Giocatore 1" : "Giocatore 2";
      ctx.fillText(`${winner} ha vinto!`, canvas.width / 2, canvas.height / 2);

      if (currentGameId) {
        await updateGameField(currentGameId, "1_scores", game.scoreLeft.toString());
        await updateGameField(currentGameId, "2_scores", game.scoreRight.toString());
        await updateGameField(currentGameId, "status", "finished");
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
          else if (game.scoreLeft === game.scoreRight) result = 1;
          addGameToStats(nickname, currentGameId!, result, 2);
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

  if (getBotActive(0) && predictedY !== null) {
    moveBot(game.rightPaddle[0], predictedY);
  }

  if (!botInterval && getBotActive(0)) {
    botInterval = setInterval(moveBotPaddle, 1000);
  }

  update(game);
  render(paddleColor1, paddleColor2);
  requestAnimationFrame(() => TwoGameLoop(paddleColor1, paddleColor2));
}