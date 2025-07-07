import { GameState } from "../game/common/types";
import { drawBall, drawField, drawPowerUp, drawRect, drawScore } from "../game/common/Draw"
import MultiplayerService from "../../services/multiplayerService";

export class RemoteController {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
  
    constructor(canvasId: string) {
      const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
      const ctx = canvas.getContext("2d")!;
      this.canvas = canvas;
      this.ctx = ctx;
  
      this.setupListeners();
      this.setupInput();
      MultiplayerService.connect();
    }
  
    private setupListeners() {
      MultiplayerService.onGameUpdate((state: GameState) => {
        this.draw(state);
      });
    }
  
    private setupInput() {
      document.addEventListener("keydown", (e) => {
        if (e.key === "ArrowUp" || e.key === "ArrowDown") {
          MultiplayerService.sendInput({
            direction: e.key === "ArrowUp" ? "up" : "down",
            timestamp: Date.now()
          });
        }
      });
    }
  
    private draw(state: GameState) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
        drawField(this.ctx, this.canvas);
        drawBall(this.ctx, state.ball);
        drawPowerUp(this.ctx, state.powerUp);
    
        state.leftPaddle.forEach(p =>
            drawRect(this.ctx, p.x, p.y, state.paddleWidth, p.height, "#FFFFFF")
        );
    
        state.rightPaddle.forEach(p =>
            drawRect(this.ctx, p.x, p.y, state.paddleWidth, p.height, "#FFFFFF")
        );
    
        drawScore(this.ctx, this.canvas, state.scoreLeft, state.scoreRight);
    }
  }