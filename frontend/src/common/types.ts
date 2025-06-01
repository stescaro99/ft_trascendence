export interface Ball {
    x: number;
    y: number;
    dx: number;
    dy: number;
    radius: number;
    speed: number;
  }
  
  export interface Paddle {
    x: number;
    y: number;
    dy: number;
    speed: number;
    height: number;
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
    leftPaddle: Paddle[];
    rightPaddle: Paddle[];
    powerUp: PowerUp;
    scoreLeft: number;
    scoreRight: number;
    paddleHeight: number;
    canvas: HTMLCanvasElement;
    waitingForStart: boolean;
    maxScore: number;
    paddleWidth: number;
  }