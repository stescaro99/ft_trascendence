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
      gameState.scoreLeft = Math.max(0, gameState.scoreLeft + 1);
    } else {
      gameState.scoreRight = Math.max(0, gameState.scoreRight + 1);
    }

    console.log(`Score update: Left ${gameState.scoreLeft} - Right ${gameState.scoreRight}`);
    this.resetBall(gameState);
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
}
