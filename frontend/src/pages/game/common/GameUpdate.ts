import { Ball, GameState, triangleSize } from "./types";

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
	const isLeft = game.ball.dx < 0;

	const affectedTeam = isLeft ? game.rightPaddle : game.leftPaddle;
	const oppositeTeam = isLeft ? game.leftPaddle : game.rightPaddle;

	affectedTeam.forEach(p => {
	  if (game.powerUp.type === "SizeIncrease") {
		p.height += p.height / 2;
	  } else if (game.powerUp.type === "SpeedBoost") {
		p.speed *= 1.5;
	  }
	});

	if (game.powerUp.type === "SizeDecrease") {
	  oppositeTeam.forEach(p => {
		p.height -= p.height / 3;
	  });
	}
	game.powerUp.active = false;

	setTimeout(() => {
	  game.leftPaddle.forEach(p => p.height = game.paddleHeight);
	  game.rightPaddle.forEach(p => p.height = game.paddleHeight);
	  game.leftPaddle.forEach(p => p.speed = game.paddleSpeed);
	  game.rightPaddle.forEach(p => p.speed = game.paddleSpeed);
	  setTimeout(() => {
		randomizePowerUp(game);
		game.powerUp.active = true;
	  }, 5000);
	}, 10000);
  }
}


function handleWallCollision(game: GameState)
{
  const ball = game.ball;

  const isInTriangleZone =
	ball.x - ball.radius < triangleSize || ball.x + ball.radius > game.canvas.width - triangleSize;

  if (isInTriangleZone)
	return;

  if (
	ball.y - ball.radius < 0 ||
	ball.y + ball.radius > game.canvas.height
  ) {
	ball.dy *= -1;

	if (ball.y < game.canvas.height / 2)
	  ball.y = ball.radius + 1;
	else
	  ball.y = game.canvas.height - ball.radius - 1;
  }
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
	[x, y],			 // centro
	[x - radius, y],	// sinistra
	[x + radius, y],	// destra
	[x, y - radius],	// sopra
	[x, y + radius],	// sotto
  ];

  return (points.some(([px, py]) => isPointInTriangle(px, py, ax, ay, bx, by, cx, cy)));
}

function bounceFromTriangle(ball: Ball, centerX: number, centerY: number, canvasWidth: number, triangleSize: number)
{
  const maxBounceAngle = Math.PI / 3;
  const speed = Math.sqrt(ball.dx ** 2 + ball.dy ** 2);
  const relativeY = centerY - ball.y;
  const normalized = relativeY / (triangleSize / 2);
  const bounceAngle = normalized * maxBounceAngle;

  const dirX = ball.x < canvasWidth / 2 ? 1 : -1;

  ball.dx = dirX * speed * Math.cos(bounceAngle);
  ball.dy = -speed * Math.sin(bounceAngle);
}

function handleTriangleCollision(game: GameState)
{
  const ball = game.ball;
  const w = game.canvas.width;
  const h = game.canvas.height;
  const s = triangleSize;

  // TOP-LEFT
  if (ballIntersectsTriangle(ball, 0, 0, s, 0, 0, s)) 
	bounceFromTriangle(ball, s / 2, s / 2, w, s);

  // TOP-RIGHT
  if (ballIntersectsTriangle(ball, w, 0, w - s, 0, w, s))
	bounceFromTriangle(ball, w - s / 2, s / 2, w, s);

  // BOTTOM-LEFT
  if (ballIntersectsTriangle(ball, 0, h, s, h, 0, h - s))
	bounceFromTriangle(ball, s / 2, h - s / 2, w, s);

  // BOTTOM-RIGHT
  if (ballIntersectsTriangle(ball, w, h, w - s, h, w, h - s))
	bounceFromTriangle(ball, w - s / 2, h - s / 2, w, s);
}

function handlePaddleCollision(game: GameState)
{
  // Collisione con paddle sinistri
  for (let i = 0; i < game.leftPaddle.length; i++)
{
	const paddle = game.leftPaddle[i];
  
	if (game.ball.dx > 0 && i === 1)
	  continue;

	if (i === 1 && game.ball.x < paddle.x)
	  continue;

	if (
	  game.ball.x - game.ball.radius < paddle.x + game.paddleWidth &&
	  game.ball.y > paddle.y &&
	  game.ball.y < paddle.y + paddle.height
	) {
	  const relativeY = (paddle.y + paddle.height / 2) - game.ball.y;
	  const normalized = relativeY / (paddle.height / 2);
	  const maxBounceAngle = Math.PI / 3;
	  const bounceAngle = normalized * maxBounceAngle;
	  const speed = Math.sqrt(game.ball.dx ** 2 + game.ball.dy ** 2);
  
	  game.ball.dx = Math.abs(speed * Math.cos(bounceAngle));
	  game.ball.dy = -speed * Math.sin(bounceAngle);
	  return;
	}
  }

  // Collisione con paddle destri
  for (let i = 0; i < game.rightPaddle.length; i++)
  {
	const paddle = game.rightPaddle[i];

	if (game.ball.dx < 0 && i === 1)
	  continue;
	
	if (i === 1 && game.ball.x < paddle.x)
	  continue;

	if (
	  game.ball.x + game.ball.radius > paddle.x &&
	  game.ball.y > paddle.y &&
	  game.ball.y < paddle.y + paddle.height
	)
	{
	  const relativeY = (paddle.y + paddle.height / 2) - game.ball.y;
	  const normalized = relativeY / (paddle.height / 2);
	  const maxBounceAngle = Math.PI / 3;
	  const bounceAngle = normalized * maxBounceAngle;
	  const speed = Math.sqrt(game.ball.dx ** 2 + game.ball.dy ** 2);

	  game.ball.dx = -Math.abs(speed * Math.cos(bounceAngle));
	  game.ball.dy = -speed * Math.sin(bounceAngle);
	  return;
	}
  }
}

function updatePaddleMovement(game: GameState)
{
	const size = triangleSize / 2;
  
	game.leftPaddle.forEach(paddle => {
		paddle.y += paddle.dy;
		if (paddle.y < size)
		paddle.y = size;
		if (paddle.y + paddle.height > game.canvas.height - size)
		paddle.y = game.canvas.height - size - paddle.height;
	});
	
	game.rightPaddle.forEach(paddle => {
		paddle.y += paddle.dy;
		if (paddle.y < size)
		paddle.y = size;
		if (paddle.y + paddle.height > game.canvas.height - size)
		paddle.y = game.canvas.height - size - paddle.height;
	});
}


function checkScore(game: GameState)
{
	if (game.ball.x - game.ball.radius < 0)
	{
	  game.scoreRight++;
	  resetAfterPoint(0, game);
	}
  
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

  game.leftPaddle.forEach(p => {
	p.y = game.canvas.height / 2 - p.height / 2;
	p.dy = 0;
  });

  game.rightPaddle.forEach(p => {
	p.y = game.canvas.height / 2 - p.height / 2;
	p.dy = 0;
  });

  setTimeout(() => {
	game.ball.dx = x === 0 ? 5 : -5;
	game.ball.dy = 5;
	game.waitingForStart = false;
  }, 1000);
}

export function randomizePowerUp(game: GameState)
{
  const rectWidth = game.canvas.width / 2;
  const rectHeight = game.canvas.height / 2;
  const rectX = game.canvas.width / 4;
  const rectY = game.canvas.height / 4; 

  game.powerUp.x = Math.random() * rectWidth + rectX;
  game.powerUp.y = Math.random() * rectHeight + rectY;

  const types = ["SizeIncrease", "SizeDecrease", "SpeedBoost"];
  const index = Math.floor(Math.random() * types.length);
  game.powerUp.type = types[index];

  switch (game.powerUp.type)
  {
	case "SizeIncrease":
	  game.powerUp.color = "#00ff00"; // verde
	  game.powerUp.type = "SizeIncrease";
	  break;
	case "SizeDecrease":
	  game.powerUp.color = "#ff0000"; // rosso
	  game.powerUp.type = "SizeDecrease";
	  break;
	case "SpeedBoost":
	  game.powerUp.color = "#ffff00"; // giallo
	  game.powerUp.type = "SpeedBoost";
	  break;
  }
}
