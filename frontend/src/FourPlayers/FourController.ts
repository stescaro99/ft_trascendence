import { GameState } from "./../common/types"; 
import { update } from "./FourGameUpdate";
import { drawBall, drawRect, drawScore, drawPowerUp, drawField } from "./FourDraw";

const canvas = document.getElementById("pong") as HTMLCanvasElement;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

const paddleHeight = canvas.height / 6;
const paddleWidth = 10;

const isBotActive = false;

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
      x: 0,
      y: canvas.height / 2 - paddleHeight / 2,
      dy: 0,
      speed: 4,
      height: paddleHeight
    },
    {
      x: canvas.width / 10 - paddleWidth / 2,
      y: canvas.height / 2 - paddleHeight / 2,
      dy: 0,
      speed: 4,
      height: paddleHeight
    }
  ],

  rightPaddle: [
    {
      x: canvas.width - paddleWidth,
      y: canvas.height / 2 - paddleHeight / 2,
      dy: 0,
      speed: 4,
      height: paddleHeight
    },
    {
      x: canvas.width - canvas.width / 10 + paddleWidth / 2,
      y: canvas.height / 2 - paddleHeight / 2,
      dy: 0,
      speed: 4,
      height: paddleHeight
    }
  ],

  powerUp: {
    x: Math.random() * (canvas.width - 200) + 10,
    y: Math.random() * (canvas.height - 200) + 10,
    width: 20,
    height: 20,
    active: true
  },

  scoreLeft: 0,
  scoreRight: 0,
  paddleHeight: paddleHeight,
  paddleWidth: paddleWidth,
  canvas: canvas,
  waitingForStart: false,
  maxScore: 5
};

document.addEventListener("keydown", (e) => {
  switch (e.key) {
    case "w":
      game.leftPaddle[0].dy = -game.leftPaddle[0].speed;
      break;
    case "s":
      game.leftPaddle[0].dy = game.leftPaddle[0].speed;
      break;
    case "a":
      game.leftPaddle[1].dy = -game.leftPaddle[1].speed;
      break;
    case "z":
      game.leftPaddle[1].dy = game.leftPaddle[1].speed;
      break;

    case "ArrowUp":
      game.rightPaddle[0].dy = -game.rightPaddle[0].speed;
      break;
    case "ArrowDown":
      game.rightPaddle[0].dy = game.rightPaddle[0].speed;
      break;
    case "i":
      game.rightPaddle[1].dy = -game.rightPaddle[1].speed;
      break;
    case "k":
      game.rightPaddle[1].dy = game.rightPaddle[1].speed;
      break;
  }
});

document.addEventListener("keyup", (e) => {
  switch (e.key) {
    case "w":
    case "s":
      game.leftPaddle[0].dy = 0;
      break;
    case "a":
    case "z":
      game.leftPaddle[1].dy = 0;
      break;

    case "ArrowUp":
    case "ArrowDown":
      game.rightPaddle[0].dy = 0;
      break;
    case "i":
    case "k":
      game.rightPaddle[1].dy = 0;
      break;
  }
});

function render(TeamLeft: string, TeamRight: string)
{
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawField(ctx, canvas);
  game.leftPaddle.forEach(p => {
    drawRect(ctx, p.x, p.y, paddleWidth, p.height, TeamLeft);
  });
  
  game.rightPaddle.forEach(p => {
    drawRect(ctx, p.x, p.y, paddleWidth, p.height, TeamRight);
  });
  drawBall(ctx, game.ball);
  drawScore(ctx, canvas, game.scoreLeft, game.scoreRight);
  drawPowerUp(ctx, game.powerUp);
}

// === Game loop ===

export function FourGameLoop(TeamLeft: string, TeamRight: string)
{
  if (game.scoreLeft >= game.maxScore || game.scoreRight >= game.maxScore)
  {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "white";
      ctx.font = "40px Arial";
      const winner = game.scoreLeft > game.scoreRight ? "Team 1" : "Team 2";
      ctx.fillText(`${winner} ha vinto!`, canvas.width / 2, canvas.height / 2);
      return;
  }
  
  update(game);
  render(TeamLeft, TeamRight);
  requestAnimationFrame(() => FourGameLoop(TeamLeft, TeamRight));
}