import { GameState } from "../common/types";

export function update(game: GameState)
{
    if (game.waitingForStart)
        return;
    handleBallMovement(game);
    handlePowerUpCollision(game);
    handleWallCollision(game);
    handleTriangleCollision(game);
    handlePaddleCollision(game);
    updatePaddleMovement(game);
    checkScore(game);
  }

function handleBallMovement(game: GameState)
{
      game.ball.x += game.ball.dx * game.ball.speed;
      game.ball.y += game.ball.dy * game.ball.speed;
}

function handlePowerUpCollision(game: GameState)    
{
    if (
        game.powerUp.active &&
        game.ball.x + game.ball.radius > game.powerUp.x &&
        game.ball.x - game.ball.radius < game.powerUp.x + game.powerUp.width &&
        game.ball.y + game.ball.radius > game.powerUp.y &&
        game.ball.y - game.ball.radius < game.powerUp.y + game.powerUp.height
      )
      {
        if (game.ball.dx < 0)
          game.rightPaddle[0].height = game.canvas.height / 4;
        else
          game.leftPaddle[0].height = game.canvas.height / 4;
    
          game.powerUp.active = false;
    
        setTimeout(() => {
            game.leftPaddle[0].height = game.paddleHeight;
            game.rightPaddle[0].height = game.paddleHeight;
            setTimeout(() => {
              randomizePowerUp(game);
              game.powerUp.active = true;
            }
            , 5000);
          }, 10000);
      }
}

function handleWallCollision(game: GameState)
{
  if (game.ball.y + game.ball.radius > game.canvas.height || game.ball.y - game.ball.radius < 0)
    game.ball.dy *= -1;
}

function isPointInTriangle(px: number, py: number, ax: number, ay: number, bx: number, by: number, cx: number, cy: number): boolean
{
  const area = 0.5 * (-by * cx + ay * (-bx + cx) + ax * (by - cy) + bx * cy);
  const s = 1 / (2 * area) * (ay * cx - ax * cy + (cy - ay) * px + (ax - cx) * py);
  const t = 1 / (2 * area) * (ax * by - ay * bx + (ay - by) * px + (bx - ax) * py);
  const u = 1 - s - t;
  return (s >= 0 && t >= 0 && u >= 0);
}

function ballIntersectsTriangle(
  ball: { x: number, y: number, radius: number },
  ax: number, ay: number,
  bx: number, by: number,
  cx: number, cy: number
): boolean
{
  const { x, y, radius } = ball;

  const points = [
    [x, y],             // centro
    [x - radius, y],    // sinistra
    [x + radius, y],    // destra
    [x, y - radius],    // sopra
    [x, y + radius],    // sotto
  ];

  return (points.some(([px, py]) => isPointInTriangle(px, py, ax, ay, bx, by, cx, cy)));
}

function handleTriangleCollision(game: GameState)
{
  const ball = game.ball;
  const w = game.canvas.width;
  const h = game.canvas.height;
  const s = 60;

  // TOP-LEFT
  if (ballIntersectsTriangle(ball, 0, 0, s, 0, 0, s))
  {
    ball.dx *= -1;
    ball.dy *= -1;
  }

  // TOP-RIGHT
  if (ballIntersectsTriangle(ball, w, 0, w - s, 0, w, s))
  {
    ball.dx *= -1;
    ball.dy *= -1;
  }

  // BOTTOM-LEFT
  if (ballIntersectsTriangle(ball, 0, h, s, h, 0, h - s))
  {
    ball.dx *= -1;
    ball.dy *= -1;
  }

  // BOTTOM-RIGHT
  if (ballIntersectsTriangle(ball, w, h, w - s, h, w, h - s))
  {
    ball.dx *= -1;
    ball.dy *= -1;
  }
}

function handlePaddleCollision(game: GameState)
{
    if (
        game.ball.x - game.ball.radius < game.leftPaddle[0].x + game.paddleWidth &&
        game.ball.y > game.leftPaddle[0].y &&
        game.ball.y < game.leftPaddle[0].y + game.leftPaddle[0].height
      )
      {
        // Calcola distanza dal centro
        const relativeY = (game.leftPaddle[0].y + game.leftPaddle[0].height / 2) - game.ball.y;
        const normalized = relativeY / (game.leftPaddle[0].height / 2);
        const maxBounceAngle = Math.PI / 3;
      
        const bounceAngle = normalized * maxBounceAngle;
      
        const speed = Math.sqrt(game.ball.dx ** 2 + game.ball.dy ** 2);
        game.ball.dx = speed * Math.cos(bounceAngle);
        game.ball.dy = -speed * Math.sin(bounceAngle);
      
        game.ball.dy += game.rightPaddle[0].dy * 0.3;
        if (game.ball.dx < 0)
            game.ball.dx *= -1;
      }

      if (
        game.ball.x + game.ball.radius > game.rightPaddle[0].x &&
        game.ball.y > game.rightPaddle[0].y &&
        game.ball.y < game.rightPaddle[0].y + game.rightPaddle[0].height
      )
      {
        const relativeY = (game.rightPaddle[0].y + game.rightPaddle[0].height / 2) - game.ball.y;
        const normalized = relativeY / (game.rightPaddle[0].height / 2);
        const maxBounceAngle = Math.PI / 3;
      
        const bounceAngle = normalized * maxBounceAngle;
      
        const speed = Math.sqrt(game.ball.dx ** 2 + game.ball.dy ** 2);
        game.ball.dx = -speed * Math.cos(bounceAngle);
        game.ball.dy = -speed * Math.sin(bounceAngle);
      
        game.ball.dy += game.leftPaddle[0].dy * 0.3;
        if (game.ball.dx > 0)
          game.ball.dx *= -1;
      }
}

function updatePaddleMovement(game: GameState)
{
    const size = 60;

    game.leftPaddle[0].y += game.leftPaddle[0].dy;
    game.rightPaddle[0].y += game.rightPaddle[0].dy;

    if (game.leftPaddle[0].y < size)
        game.leftPaddle[0].y = size;
    if (game.leftPaddle[0].y + game.leftPaddle[0].height > game.canvas.height - size)
        game.leftPaddle[0].y = game.canvas.height - size - game.leftPaddle[0].height;

    if (game.rightPaddle[0].y < size)
        game.rightPaddle[0].y = size;
    if (game.rightPaddle[0].y + game.rightPaddle[0].height > game.canvas.height - size)
        game.rightPaddle[0].y = game.canvas.height - size - game.rightPaddle[0].height;
}

function checkScore(game: GameState)
{
    // Punto per player destro
    if (game.ball.x - game.ball.radius < 0)
    {
        game.scoreRight++;
      resetAfterPoint(0, game);
    }
  
    // Punto per player sinistro
    if (game.ball.x + game.ball.radius > game.canvas.width)
    {
        game.scoreLeft++;
      resetAfterPoint(1, game);
    }
}

// ========== Reset del gioco ==========

function resetAfterPoint(x: number, game: GameState)
{
    game.waitingForStart = true;
  game.ball.dx = 0;
  game.ball.dy = 0;
  game.ball.x = game.canvas.width / 2;
  game.ball.y = game.canvas.height / 2;
  game.leftPaddle[0].y = game.canvas.height / 2 - game.paddleHeight / 2;
  game.rightPaddle[0].y = game.canvas.height / 2 - game.paddleHeight / 2;
  setTimeout(() => {
    game.ball.dx = x === 0 ? 5 : -5;
    game.ball.dy = 5;
    game.waitingForStart = false;
  }, 1000);
  game.ball.dx *= -1;
}

function randomizePowerUp(game: GameState) {
  game.powerUp.x = Math.random() * (game.canvas.width - game.canvas.width / 4) + 10;
  game.powerUp.y = Math.random() * (game.canvas.height - game.canvas.height / 4) + 10;
}