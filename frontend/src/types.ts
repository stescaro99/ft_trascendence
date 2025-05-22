export interface Ball {
    x: number;
    y: number;
    dx: number;
    dy: number;
    radius: number;
  }
  
  export interface Paddle {
    x: number;
    y: number;
    dy: number;
    speed: number;
    height: number;
    color?: string;
  }
  
  export interface PowerUp {
    x: number;
    y: number;
    width: number;
    height: number;
    active: boolean;
  }
  
  export interface GameState {
    ball: Ball;
    leftPaddle: Paddle;
    rightPaddle: Paddle;
    powerUp: PowerUp;
    scoreLeft: number;
    scoreRight: number;
    paddleHeight: number;
    canvas: HTMLCanvasElement;
    waitingForStart: boolean;
    countdownActive: boolean;
    countdown: number;
    maxScore: number;
    paddleWidth: number;
  }