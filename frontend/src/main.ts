const canvas = document.getElementById("pong") as HTMLCanvasElement;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

const setupScreen = document.getElementById("setup-screen") as HTMLDivElement;
const startBtn = document.getElementById("startBtn") as HTMLButtonElement;

const preview1 = document.getElementById("preview1") as HTMLDivElement;
const preview2 = document.getElementById("preview2") as HTMLDivElement;

let paddleColor1 = "#ffffff";
let paddleColor2 = "#ffffff";

// 🎨 Colori disponibili
const colori = ["#ff0000", "#00ff00", "#ffff00", "#800080", "#007bff", "#ffffff"];

// 🧩 Genera i bottoni per le palette
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

// === Variabili gioco ===

let countdownActive = true;
let countdown = 3;

let scoreLeft = 0;
let scoreRight = 0;
const maxScore = 5;

const paddleWidth = 10;
const paddleHeight = 100;

const leftPaddle = {
  x: 0,
  y: canvas.height / 2 - paddleHeight / 2,
  dy: 0,
  speed: 6,
};

const rightPaddle = {
  x: canvas.width - paddleWidth,
  y: canvas.height / 2 - paddleHeight / 2,
  dy: 0,
  speed: 6,
};

const ball = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  radius: 10,
  dx: 5,
  dy: 5,
};

// === Eventi tastiera ===

document.addEventListener("keydown", (e) => {
  if (e.key === "w") leftPaddle.dy = -leftPaddle.speed;
  if (e.key === "s") leftPaddle.dy = leftPaddle.speed;
  if (e.key === "ArrowUp") rightPaddle.dy = -rightPaddle.speed;
  if (e.key === "ArrowDown") rightPaddle.dy = rightPaddle.speed;
});

document.addEventListener("keyup", (e) => {
  if (e.key === "w" || e.key === "s") leftPaddle.dy = 0;
  if (e.key === "ArrowUp" || e.key === "ArrowDown") rightPaddle.dy = 0;
});

// === Disegno ===

function drawRect(x: number, y: number, w: number, h: number, color: string) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function drawBall() {
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fillStyle = "white";
  ctx.fill();
  ctx.closePath();
}

function drawScore() {
  ctx.font = "30px Arial";
  ctx.fillStyle = "white";
  ctx.fillText(scoreLeft.toString(), canvas.width / 4, 40);
  ctx.fillText(scoreRight.toString(), (canvas.width * 3) / 4, 40);
}

// === Update gioco ===

function update() {
  if (!countdownActive) {
    ball.x += ball.dx;
    ball.y += ball.dy;
  }

  // Collisione top/bottom
  if (ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0) {
    ball.dy *= -1;
  }

  // Rimbalzo paddle sinistra
  if (
    ball.x - ball.radius < leftPaddle.x + paddleWidth &&
    ball.y > leftPaddle.y &&
    ball.y < leftPaddle.y + paddleHeight
  ) {
    ball.dx *= -1;
  }

  // Rimbalzo paddle destra
  if (
    ball.x + ball.radius > rightPaddle.x &&
    ball.y > rightPaddle.y &&
    ball.y < rightPaddle.y + paddleHeight
  ) {
    ball.dx *= -1;
  }

  // Movimento paddle
  leftPaddle.y += leftPaddle.dy;
  rightPaddle.y += rightPaddle.dy;

  if (leftPaddle.y + paddleHeight  >= canvas.height || leftPaddle.y <= 0)
    leftPaddle.y -= leftPaddle.dy;

  if (rightPaddle.y + paddleHeight >= canvas.height || rightPaddle.y <= 0)
    rightPaddle.y -= rightPaddle.dy;

  // Punto per player destro
  if (ball.x - ball.radius < 0) {
    scoreRight++;
    resetBall();
  }

  // Punto per player sinistro
  if (ball.x + ball.radius > canvas.width) {
    scoreLeft++;
    resetBall();
  }
}

function resetBall() {
  ball.x = canvas.width / 2;
  ball.y = canvas.height / 2;
  ball.dx *= -1;
}

// === Disegno frame ===

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawRect(leftPaddle.x, leftPaddle.y, paddleWidth, paddleHeight, paddleColor1);
  drawRect(rightPaddle.x, rightPaddle.y, paddleWidth, paddleHeight, paddleColor2);
  drawBall();
  drawScore();
}

// === Game loop ===

function gameLoop() {
  if (scoreLeft >= maxScore || scoreRight >= maxScore) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.font = "40px Arial";
    const winner = scoreLeft > scoreRight ? "Giocatore 1" : "Giocatore 2";
    ctx.fillText(`${winner} ha vinto!`, canvas.width / 2, canvas.height / 2);
    return;
  }

  update();
  render();
  requestAnimationFrame(gameLoop);
}

// === Countdown ===

function startCountdown() {
  countdownActive = true;
  countdown = 3;

  const interval = setInterval(() => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.font = "60px Arial";
    ctx.textAlign = "center";

    if (countdown > 0) {
      ctx.fillText(countdown.toString() + "..", canvas.width / 2, canvas.height / 2);
    } else if (countdown === 0) {
      ctx.fillText("GO!", canvas.width / 2, canvas.height / 2);
    }

    countdown--;

    if (countdown < 0) {
      clearInterval(interval);
      countdownActive = false;
      gameLoop();
    }
  }, 1000);
}

// === Pulsante Start ===

startBtn.addEventListener("click", () => {
  setupScreen.style.display = "none";
  canvas.style.display = "block";
  startCountdown();
});
