import { GameState, GAME_CONSTANTS } from './types';

export class GamePhysics {
  static updateGameStateWithDelta(gameState: GameState, deltaTime: number): void {
    const normalizedDelta = deltaTime / (1000 / GAME_CONSTANTS.TARGET_FPS);

    gameState.ball.x += (gameState.ball.dx * gameState.ball.speed) * normalizedDelta;
    gameState.ball.y += (gameState.ball.dy * gameState.ball.speed) * normalizedDelta;
    gameState.leftPaddle.forEach(paddle => {
      paddle.y += paddle.dy * normalizedDelta;
      paddle.y = Math.max(0, Math.min(GAME_CONSTANTS.CANVAS_HEIGHT - paddle.height, paddle.y));
    });
    gameState.rightPaddle.forEach(paddle => {
      paddle.y += paddle.dy * normalizedDelta;
      paddle.y = Math.max(0, Math.min(GAME_CONSTANTS.CANVAS_HEIGHT - paddle.height, paddle.y));
    });
    if (gameState.ball.y <= gameState.ball.radius || 
        gameState.ball.y >= GAME_CONSTANTS.CANVAS_HEIGHT - gameState.ball.radius) {
      gameState.ball.dy = -gameState.ball.dy;
      gameState.ball.y = Math.max(gameState.ball.radius, 
        Math.min(GAME_CONSTANTS.CANVAS_HEIGHT - gameState.ball.radius, gameState.ball.y));
    }
    this.checkPaddleCollisions(gameState);
    this.checkPowerUpCollision(gameState);
    if (gameState.ball.x <= -gameState.ball.radius) {
      this.handleScore(gameState, 'right');
    } else if (gameState.ball.x >= GAME_CONSTANTS.CANVAS_WIDTH + gameState.ball.radius) {
      this.handleScore(gameState, 'left');
    }
  }

  static checkPaddleCollisions(gameState: GameState): void {
    gameState.leftPaddle.forEach(paddle => {
      if (this.isColliding(gameState.ball, paddle, gameState)) {
        this.handlePaddleCollision(gameState, paddle, 'left');
      }
    });
    gameState.rightPaddle.forEach(paddle => {
      if (this.isColliding(gameState.ball, paddle, gameState)) {
        this.handlePaddleCollision(gameState, paddle, 'right');
      }
    });
  }

  static isColliding(ball: any, paddle: any, gameState: GameState): boolean {
    const ballLeft = ball.x - ball.radius;
    const ballRight = ball.x + ball.radius;
    const ballTop = ball.y - ball.radius;
    const ballBottom = ball.y + ball.radius;
    const paddleLeft = paddle.x;
    const paddleRight = paddle.x + gameState.paddleWidth;
    const paddleTop = paddle.y;
    const paddleBottom = paddle.y + paddle.height;

    return ballRight >= paddleLeft &&
           ballLeft <= paddleRight &&
           ballBottom >= paddleTop &&
           ballTop <= paddleBottom;
  }

  static handlePaddleCollision(gameState: GameState, paddle: any, side: 'left' | 'right'): void {
    const relativeIntersectY = (paddle.y + (paddle.height / 2)) - gameState.ball.y;
    const normalizedRelativeIntersection = relativeIntersectY / (paddle.height / 2);
    const bounceAngle = normalizedRelativeIntersection * Math.PI / 4;
    const speed = Math.sqrt(gameState.ball.dx * gameState.ball.dx + gameState.ball.dy * gameState.ball.dy);
    
    if (side === 'left') {
      gameState.ball.dx = speed * Math.cos(bounceAngle);
    } else {
      gameState.ball.dx = -speed * Math.cos(bounceAngle);
    }
    gameState.ball.dy = speed * -Math.sin(bounceAngle);
    if (Math.abs(paddle.dy) > 0) {
      gameState.ball.dy += paddle.dy * 0.1;
    }
    if (side === 'left') {
      gameState.ball.x = paddle.x + gameState.paddleWidth + gameState.ball.radius + 1;
    } else {
      gameState.ball.x = paddle.x - gameState.ball.radius - 1;
    }
    gameState.ball.dx *= GAME_CONSTANTS.SPEED_INCREASE_FACTOR;
    gameState.ball.dy *= GAME_CONSTANTS.SPEED_INCREASE_FACTOR;
    const currentSpeed = Math.sqrt(gameState.ball.dx * gameState.ball.dx + gameState.ball.dy * gameState.ball.dy);
    
    if (currentSpeed > GAME_CONSTANTS.MAX_BALL_SPEED) {
      gameState.ball.dx = (gameState.ball.dx / currentSpeed) * GAME_CONSTANTS.MAX_BALL_SPEED;
      gameState.ball.dy = (gameState.ball.dy / currentSpeed) * GAME_CONSTANTS.MAX_BALL_SPEED;
    }
  }

  static handleScore(gameState: GameState, winner: 'left' | 'right'): void {
    if (winner === 'left') {
        gameState.scoreLeft++;
    } else {
        gameState.scoreRight++;
    }
    
    this.resetAfterPoint(gameState);
}

static resetAfterPoint(gameState: GameState): void {
    // Ferma la palla al centro
    gameState.waitingForStart = true;
    gameState.ball.dx = 0;
    gameState.ball.dy = 0;
    gameState.ball.x = GAME_CONSTANTS.CANVAS_WIDTH / 2;
    gameState.ball.y = GAME_CONSTANTS.CANVAS_HEIGHT / 2;

    // Riposiziona paddle al centro e ferma movimento
    gameState.leftPaddle.forEach(paddle => {
        paddle.y = GAME_CONSTANTS.CANVAS_HEIGHT / 2 - paddle.height / 2;
        paddle.dy = 0;
    });

    gameState.rightPaddle.forEach(paddle => {
        paddle.y = GAME_CONSTANTS.CANVAS_HEIGHT / 2 - paddle.height / 2;
        paddle.dy = 0;
    });

    // Riavvia dopo 2 secondi
    setTimeout(() => {
        const direction = Math.random() > 0.5 ? 1 : -1;
        gameState.ball.dx = direction * 5;
        gameState.ball.dy = (Math.random() - 0.5) * 5;
        gameState.waitingForStart = false;
    }, 2000);
}

  static resetBall(gameState: GameState): void {
    gameState.ball.x = GAME_CONSTANTS.CANVAS_WIDTH / 2;
    gameState.ball.y = GAME_CONSTANTS.CANVAS_HEIGHT / 2;
    gameState.ball.dx = Math.random() > 0.5 ? 5 : -5;
    gameState.ball.dy = Math.random() > 0.5 ? 5 : -5;
  }

  static createGameUpdateData(gameState: GameState, frameId: number): any {
    return {
      ball: {
        x: Math.round(gameState.ball.x * 100) / 100,
        y: Math.round(gameState.ball.y * 100) / 100,
        dx: gameState.ball.dx,
        dy: gameState.ball.dy,
        radius: gameState.ball.radius,
        speed: gameState.ball.speed
      },
      leftPaddle: gameState.leftPaddle.map(p => ({
        x: p.x,
        y: Math.round(p.y * 100) / 100,
        dy: p.dy,
        height: p.height,
        speed: p.speed,
        nickname: p.nickname
      })),
      rightPaddle: gameState.rightPaddle.map(p => ({
        x: p.x,
        y: Math.round(p.y * 100) / 100,
        dy: p.dy,
        height: p.height,
        speed: p.speed,
        nickname: p.nickname
      })),
      powerUp: gameState.powerUp,
      scoreLeft: gameState.scoreLeft,
      scoreRight: gameState.scoreRight,
      paddleWidth: gameState.paddleWidth,
      paddleHeight: gameState.paddleHeight,
      waitingForStart: gameState.waitingForStart,
      maxScore: gameState.maxScore,
      paddleSpeed: gameState.paddleSpeed,
      frameId: frameId
    };
  }

  static checkPowerUpCollision(gameState: GameState): void {
    if (!gameState.powerUp.active) return;
    
    const ball = gameState.ball;
    const powerUp = gameState.powerUp;
    
    if (ball.x + ball.radius > powerUp.x &&
        ball.x - ball.radius < powerUp.x + powerUp.width &&
        ball.y + ball.radius > powerUp.y &&
        ball.y - ball.radius < powerUp.y + powerUp.height) {
        
        this.applyPowerUp(gameState);
        gameState.powerUp.active = false;
        
        // Spawna nuovo powerup dopo 5 secondi
        setTimeout(() => {
            this.spawnNewPowerUp(gameState);
        }, 5000);
    }
}

static applyPowerUp(gameState: GameState): void {
    const isLeft = gameState.ball.dx < 0;
    const affectedTeam = isLeft ? gameState.rightPaddle : gameState.leftPaddle;
    const oppositeTeam = isLeft ? gameState.leftPaddle : gameState.rightPaddle;

    switch(gameState.powerUp.type) {
        case "SizeIncrease":
            affectedTeam.forEach(paddle => paddle.height += paddle.height / 2);
            break;
        case "SpeedBoost":
            affectedTeam.forEach(paddle => paddle.speed *= 1.5);
            break;
        case "SizeDecrease":
            oppositeTeam.forEach(paddle => paddle.height -= paddle.height / 3);
            break;
    }
    
    // Reset effetti dopo 10 secondi
    setTimeout(() => {
        this.resetPaddleEffects(gameState);
    }, 10000);
}

static spawnNewPowerUp(gameState: GameState): void {
    gameState.powerUp = {
        x: Math.random() * (GAME_CONSTANTS.CANVAS_WIDTH - 200) + 100,
        y: Math.random() * (GAME_CONSTANTS.CANVAS_HEIGHT - 200) + 100,
        width: 20,
        height: 20,
        active: true,
        type: this.getRandomPowerUpType(),
        color: this.getPowerUpColor(gameState.powerUp.type)
    };
}

static getRandomPowerUpType(): string {
    const powerUpTypes = ["SizeIncrease", "SpeedBoost", "SizeDecrease"];
    return powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
}

static getPowerUpColor(type: string): string {
    switch (type) {
        case "SizeIncrease":
            return "green";
        case "SpeedBoost":
            return "blue";
        case "SizeDecrease":
            return "red";
        default:
            return "gray";
    }
}

static resetPaddleEffects(gameState: GameState): void {
    gameState.leftPaddle.forEach(paddle => {
        paddle.height = gameState.paddleHeight;
        paddle.speed = gameState.paddleSpeed;
    });
    gameState.rightPaddle.forEach(paddle => {
        paddle.height = gameState.paddleHeight;
        paddle.speed = gameState.paddleSpeed;
    });
}
}
