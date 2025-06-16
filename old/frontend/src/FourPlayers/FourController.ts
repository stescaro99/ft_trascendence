import { GameState } from "./../common/types"; 
import { randomizePowerUp, update } from "./../common/GameUpdate";
import { drawBall, drawRect, drawScore, drawPowerUp, drawField } from "../common/Draw";
import { getBotActive, predictBallY, moveBot} from "../common/BotState";

const canvas = document.getElementById("pong") as HTMLCanvasElement;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

const paddleHeight = canvas.height / 6;
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
      speed: 4,
      height: paddleHeight
    },
    {
      x: canvas.width / 7,
      y: canvas.height / 2 - paddleHeight / 2,
      dy: 0,
      speed: 4,
      height: paddleHeight
    }
  ],

  rightPaddle: [
    {
      x: canvas.width - paddleWidth - 30,
      y: canvas.height / 2 - paddleHeight / 2,
      dy: 0,
      speed: 4,
      height: paddleHeight
    },
    {
      x: canvas.width - canvas.width / 7 - paddleWidth,
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
  paddleSpeed: 4
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
  if (keys["w"] && keys["s"]) {
    game.leftPaddle[0].dy = 0;
  } else if (keys["w"]) {
    game.leftPaddle[0].dy = -game.leftPaddle[0].speed;
  } else if (keys["s"]) {
    game.leftPaddle[0].dy = game.leftPaddle[0].speed;
  } else {
    game.leftPaddle[0].dy = 0;
  }

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

let botInterval: number | undefined = undefined;

function moveBotPaddle() {
  if (getBotActive(1)) {
    const randomOffset = (Math.random() - 0.5) * 200;
    predictedY[1] = predictBallY(game.ball, game.leftPaddle[1].x) + randomOffset;
  }
  if (getBotActive(2)) {
    const randomOffset = (Math.random() - 0.5) * 200;
    predictedY[2] = predictBallY(game.ball, game.rightPaddle[0].x) + randomOffset;
  }
  if (getBotActive(3)) {
    const randomOffset = (Math.random() - 0.5) * 200;
    predictedY[3] = predictBallY(game.ball, game.rightPaddle[1].x) + randomOffset;
  }
}

let predictedY: (number | null)[] = [
  null,
  predictBallY(game.ball, game.leftPaddle[1].x),
  predictBallY(game.ball, game.rightPaddle[0].x),
  predictBallY(game.ball, game.rightPaddle[1].x),
];

export function FourGameLoop(TeamLeft: string, TeamRight: string)
{
  
  if (game.scoreLeft >= game.maxScore || game.scoreRight >= game.maxScore)
  {
      // Fine partita, aggiungere salvataggio statistiche backend
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "white";
      ctx.font = "40px Arial";
      const winner = game.scoreLeft > game.scoreRight ? "Team 1" : "Team 2";
      ctx.fillText(`${winner} ha vinto!`, canvas.width / 2, canvas.height / 2);

      if (botInterval) {
        clearInterval(botInterval);
        botInterval = undefined;
      }

      return;
  }

  if (getBotActive(1) && predictedY !== null) {
      moveBot(game.leftPaddle[1], predictedY[1]!);
  }

  if (getBotActive(2) && predictedY !== null) {
      moveBot(game.rightPaddle[0], predictedY[2]!);
  }    

  if (getBotActive(3) && predictedY !== null) {
      moveBot(game.rightPaddle[1], predictedY[3]!);
  }

  if (!botInterval && (getBotActive(1) || getBotActive(2) || getBotActive(3))) {
    botInterval = setInterval(moveBotPaddle, 1000);
  }
  
  update(game);
  render(TeamLeft, TeamRight);
  requestAnimationFrame(() => FourGameLoop(TeamLeft, TeamRight));
}