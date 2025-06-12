import { GameState, Paddle } from "./../common/types"; 
import { update } from "./../common/GameUpdate";
import { drawBall, drawRect, drawScore, drawPowerUp, drawField } from "../common/Draw";
import { getBotActive, predictBallY, moveBot } from "../common/BotState";
import { updateGameField, createGame } from "../services/gameService";
import { addGameToStats } from "../services/statsService";

const canvas = document.getElementById("pong") as HTMLCanvasElement;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

const paddleHeight = canvas.height / 6;
const paddleWidth = 10;

const powerUpType = (() => {
    const types = ["IncreaseSize", "SpeedBoost"];
    return types[Math.floor(Math.random() * types.length)];
})();

const typeToColor: { [key: string]: string } = {
    IncreaseSize: "green",
    DecreaseSize: "red",
    SpeedBoost: "yellow"
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
  paddleSpeed: 1.5
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
      if (getBotActive(1))
        break;
      game.leftPaddle[1].dy = -game.leftPaddle[1].speed;
      break;
    case "z":
      if (getBotActive(1))
        break;
      game.leftPaddle[1].dy = game.leftPaddle[1].speed;
      break;

    case "ArrowUp":
      if (getBotActive(2))
        break;
      game.rightPaddle[0].dy = -game.rightPaddle[0].speed;
      break;
    case "ArrowDown":
      if (getBotActive(2))
        break;
      game.rightPaddle[0].dy = game.rightPaddle[0].speed;
      break;
    case "i":
      if (getBotActive(3))
        break;
      game.rightPaddle[1].dy = -game.rightPaddle[1].speed;
      break;
    case "k":
      if (getBotActive(3))
        break;
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
      if (!getBotActive(1))
        game.leftPaddle[1].dy = 0;
      break;

    case "ArrowUp":
    case "ArrowDown":
      if (!getBotActive(2))
        game.rightPaddle[0].dy = 0;
      break;
    case "i":
    case "k":
      if (!getBotActive(3))
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

export async function FourGameLoop(TeamLeft: string, TeamRight: string)
{
  if (!gameCreated) {
    const players = [
      game.leftPaddle[0].nickname,
      game.leftPaddle[1].nickname,
      game.rightPaddle[0].nickname,
      game.rightPaddle[1].nickname
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
      const winner = game.scoreLeft > game.scoreRight ? "Team 1" : "Team 2";
      ctx.fillText(`${winner} ha vinto!`, canvas.width / 2, canvas.height / 2);

      // Aggiorna game e stats
      if (currentGameId) {
        await updateGameField(currentGameId, "1_scores", game.scoreLeft.toString());
        await updateGameField(currentGameId, "2_scores", game.scoreRight.toString());
        await updateGameField(currentGameId, "status", "finished");
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
          else if (game.scoreLeft === game.scoreRight) result = 1;
          addGameToStats(nickname, currentGameId!, result, 4);
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