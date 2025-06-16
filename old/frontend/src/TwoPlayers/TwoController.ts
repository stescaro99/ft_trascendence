import { GameState } from "../common/types"; 
import { randomizePowerUp, update } from "./../common/GameUpdate";
import { drawBall, drawRect, drawScore, drawPowerUp, drawField } from "../common/Draw";
import { getBotActive, predictBallY, moveBot} from "../common/BotState";

const canvas = document.getElementById("pong") as HTMLCanvasElement;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

const paddleHeight = canvas.height / 5;
const paddleWidth = 10;

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
      height: paddleHeight
    }
  ],

  rightPaddle: [
    {
      x: canvas.width - paddleWidth - 30,
      y: canvas.height / 2 - paddleHeight / 2,
      dy: 0,
      speed: 6,
      height: paddleHeight
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
  paddleSpeed: 6
};

randomizePowerUp(game);

// === Sistema di tracking dei tasti ===
const keys: { [key: string]: boolean } = {};

document.addEventListener("keydown", (e) => {
  keys[e.key] = true;
  updatePaddleMovement();
});

document.addEventListener("keyup", (e) => {
  keys[e.key] = false;
  updatePaddleMovement();
});

function updatePaddleMovement() {
  // Movimento paddle sinistro (Giocatore 1)
  if (keys["w"] && keys["s"]) {
    game.leftPaddle[0].dy = 0; // Se entrambi i tasti sono premuti, ferma
  } else if (keys["w"]) {
    game.leftPaddle[0].dy = -game.leftPaddle[0].speed;
  } else if (keys["s"]) {
    game.leftPaddle[0].dy = game.leftPaddle[0].speed;
  } else {
    game.leftPaddle[0].dy = 0;
  }

  // Movimento paddle destro (Giocatore 2) - solo se non è un bot
  if (!getBotActive(0)) {
    if (keys["ArrowUp"] && keys["ArrowDown"]) {
      game.rightPaddle[0].dy = 0; // Se entrambi i tasti sono premuti, ferma
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

function moveBotPaddle()
{
  if (!getBotActive(0)) return;
  const bot = game.rightPaddle[0];

  const randomOffset = (Math.random() - 0.5) * 200;

  predictedY = predictBallY(game.ball, bot.x) + randomOffset;
}

let predictedY: number | null = predictBallY(game.ball, game.rightPaddle[0].x);

export function TwoGameLoop(paddleColor1: string, paddleColor2: string)
{
  if (game.scoreLeft >= game.maxScore || game.scoreRight >= game.maxScore)
  {
      // Fine partita, aggiungere salvataggio statistiche backend
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "white";
      ctx.font = "40px Arial";
      const winner = game.scoreLeft > game.scoreRight ? "Giocatore 1" : "Giocatore 2";
      ctx.fillText(`${winner} ha vinto!`, canvas.width / 2, canvas.height / 2);

      if (botInterval) {
        clearInterval(botInterval);
        botInterval = undefined;
      }

      return;
  }
    if (getBotActive(0) && predictedY !== null) {
      moveBot(game.rightPaddle[0], predictedY);
  }

  // --- calcolo posizione pallina ogni 1s---
  if (!botInterval && getBotActive(0)) {
    botInterval = setInterval(moveBotPaddle, 1000);
  }

  update(game);
  render(paddleColor1, paddleColor2);
  requestAnimationFrame(() => TwoGameLoop(paddleColor1, paddleColor2));
}