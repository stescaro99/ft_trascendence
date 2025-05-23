import { GameState } from "./types";

export function update(game: GameState)
{
    if (game.waitingForStart)
        return;
    handleBallMovement(game);
    handlePowerUpCollision(game);
    handleWallCollision(game);
    handlePaddleCollision(game);
    updatePaddleMovement(game);
    checkScore(game);
  }

function handleBallMovement(game: GameState)
{
    if (!game.countdownActive)
    {
      game.ball.x += game.ball.dx;
      game.ball.y += game.ball.dy;
    }
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
          game.rightPaddle.height = 150;
        else
          game.leftPaddle.height = 150;
    
          game.powerUp.active = false;
    
        setTimeout(() => {
            game.leftPaddle.height = game.paddleHeight;
            game.rightPaddle.height = game.paddleHeight;
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

function handlePaddleCollision(game: GameState)
{
    if (
        game.ball.x - game.ball.radius < game.leftPaddle.x + game.paddleWidth &&
        game.ball.y > game.leftPaddle.y &&
        game.ball.y < game.leftPaddle.y + game.leftPaddle.height
      )
      {
        // Calcola distanza dal centro
        const relativeY = (game.leftPaddle.y + game.leftPaddle.height / 2) - game.ball.y;
        const normalized = relativeY / (game.leftPaddle.height / 2);
        const maxBounceAngle = Math.PI / 3;
      
        const bounceAngle = normalized * maxBounceAngle;
      
        const speed = Math.sqrt(game.ball.dx ** 2 + game.ball.dy ** 2);
        game.ball.dx = speed * Math.cos(bounceAngle);
        game.ball.dy = -speed * Math.sin(bounceAngle);
      
        game.ball.dy += game.rightPaddle.dy * 0.3;
        if (game.ball.dx < 0)
            game.ball.dx *= -1;
      }

      if (
        game.ball.x + game.ball.radius > game.rightPaddle.x &&
        game.ball.y > game.rightPaddle.y &&
        game.ball.y < game.rightPaddle.y + game.rightPaddle.height
      )
      {
        const relativeY = (game.rightPaddle.y + game.rightPaddle.height / 2) - game.ball.y;
        const normalized = relativeY / (game.rightPaddle.height / 2);
        const maxBounceAngle = Math.PI / 3;
      
        const bounceAngle = normalized * maxBounceAngle;
      
        const speed = Math.sqrt(game.ball.dx ** 2 + game.ball.dy ** 2);
        game.ball.dx = -speed * Math.cos(bounceAngle);
        game.ball.dy = -speed * Math.sin(bounceAngle);
      
        game.ball.dy += game.leftPaddle.dy * 0.3;
        if (game.ball.dx > 0) game.ball.dx *= -1;
      }
}

function updatePaddleMovement(game: GameState)
{
    game.leftPaddle.y += game.leftPaddle.dy;
    game.rightPaddle.y += game.rightPaddle.dy;

    if (game.leftPaddle.y < 0)
      game.leftPaddle.y = 0;
    if (game.leftPaddle.y + game.leftPaddle.height > game.canvas.height)
      game.leftPaddle.y = game.canvas.height - game.leftPaddle.height;
  
    if (game.rightPaddle.y < 0)
      game.rightPaddle.y = 0;
    if (game.rightPaddle.y + game.rightPaddle.height > game.canvas.height)
      game.rightPaddle.y = game.canvas.height - game.rightPaddle.height;}

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
  game.leftPaddle.y = game.canvas.height / 2 - game.paddleHeight / 2;
  game.rightPaddle.y = game.canvas.height / 2 - game.paddleHeight / 2;
  setTimeout(() => {
    game.ball.dx = x === 0 ? 5 : -5;
    game.ball.dy = 5;
    game.waitingForStart = false;
  }, 1000);
  game.ball.dx *= -1;
}

function randomizePowerUp(game: GameState) {
  game.powerUp.x = Math.random() * (game.canvas.width - 200) + 10;
  game.powerUp.y = Math.random() * (game.canvas.height - 200) + 10;
}