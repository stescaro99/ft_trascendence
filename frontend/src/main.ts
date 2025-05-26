import { GameState } from "./types"; 
import { update } from "./gameUpdate";
import { drawBall, drawRect, drawScore, drawPowerUp, drawField } from "./draw";

const canvas = document.getElementById("pong") as HTMLCanvasElement;

const game: GameState = {
  ball: { x: canvas.width / 2, y: canvas.height / 2, dx: 5, dy: 5, radius: 10 },
  leftPaddle: { x: 0, y: canvas.height / 2 - 100 / 2, dy: 0, speed: 6, height: 100 },
  rightPaddle: { x: canvas.width - 10, y: canvas.height / 2 - 100 / 2, dy: 0, speed: 6, height: 100 },
  powerUp: { x: Math.random() * (canvas.width - 200) + 10, y: Math.random() * (canvas.height - 200) + 10, width: 20, height: 20, active: true },
  scoreLeft: 0,
  scoreRight: 0,
  paddleHeight: 100,
  canvas: canvas,
  waitingForStart: false,
  countdownActive: false,
  countdown: 3,
  maxScore: 5,
  paddleWidth: 10,
};

const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

const startBtn = document.getElementById("startBtn") as HTMLButtonElement;

const preview1 = document.getElementById("preview1") as HTMLDivElement;
const preview2 = document.getElementById("preview2") as HTMLDivElement;

let paddleColor1 = "#ffffff";
let paddleColor2 = "#ffffff";

// Colori disponibili
const colori = ["#ff0000", "#00ff00", "#ffff00", "#800080", "#007bff", "#ffffff"];

// Generazione dei bottoni per la selezione dei colori
const paletteContainers = document.querySelectorAll(".palette");

paletteContainers.forEach((palette) => {
  const player = (palette as HTMLElement).dataset.player!;
  colori.forEach((color) => {
    const btn = document.createElement("button");
    btn.style.backgroundColor = color;
    btn.setAttribute("data-color", color);
    btn.addEventListener("click", () => {
      if (player === "1") {
        paddleColor1 = color;
        preview1.style.backgroundColor = color;
      } else {
        paddleColor2 = color;
        preview2.style.backgroundColor = color;
      }

      // bordo evidenziato
      (palette as HTMLElement)
        .querySelectorAll("button")
        .forEach((b) => b.classList.remove("selected"));
      btn.classList.add("selected");
    });

    palette.appendChild(btn);
  });
});

// === Eventi tastiera ===

document.addEventListener("keydown", (e) => {
  if (e.key === "w") game.leftPaddle.dy = -game.leftPaddle.speed;
  if (e.key === "s") game.leftPaddle.dy = game.leftPaddle.speed;
  if (e.key === "ArrowUp") game.rightPaddle.dy = -game.rightPaddle.speed;
  if (e.key === "ArrowDown") game.rightPaddle.dy = game.rightPaddle.speed;
});

document.addEventListener("keyup", (e) => {
  if (e.key === "w" || e.key === "s") game.leftPaddle.dy = 0;
  if (e.key === "ArrowUp" || e.key === "ArrowDown") game.rightPaddle.dy = 0;
});

function render()
{
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawRect(ctx, game.leftPaddle.x, game.leftPaddle.y, game.paddleWidth, game.leftPaddle.height, paddleColor1);
  drawRect(ctx, game.rightPaddle.x, game.rightPaddle.y, game.paddleWidth, game.rightPaddle.height, paddleColor2);
  drawBall(ctx, game.ball);
  drawScore(ctx, canvas, game.scoreLeft, game.scoreRight);
  drawPowerUp(ctx, game.powerUp);
  drawField(ctx, canvas);
}

// === Game loop ===

function gameLoop()
{
  if (game.scoreLeft >= game.maxScore || game.scoreRight >= game.maxScore)
  {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.font = "40px Arial";
    const winner = game.scoreLeft > game.scoreRight ? "Giocatore 1" : "Giocatore 2";
    ctx.fillText(`${winner} ha vinto!`, canvas.width / 2, canvas.height / 2);
    return;
  }

  update(game);
  render();
  requestAnimationFrame(gameLoop);
}

// === Countdown ===

function startCountdown()
{
  game.countdownActive = true;
  game.countdown = 3;

  const interval = setInterval(() => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.font = "60px Arial";
    ctx.textAlign = "center";

    if (game.countdown > 0)
    {
      ctx.fillText(game.countdown.toString() + "..", canvas.width / 2, canvas.height / 2);
    }
    else if (game.countdown === 0)
    {
      ctx.fillText("GO!", canvas.width / 2, canvas.height / 2);
    }

    game.countdown--;

    if (game.countdown < 0)
    {
      clearInterval(interval);
      game.countdownActive = false;
      gameLoop();
    }
  }, 1000);
}

// === Pulsante Start ===

startBtn.addEventListener("click", () => {
  document.querySelectorAll(".screen").forEach(el => el.classList.remove("visible"));

  canvas.style.display = "block";
  
  document.fonts.ready.then(() => {
    ctx.font = "28px 'Bit5x3'";
    startCountdown();
  });
});
