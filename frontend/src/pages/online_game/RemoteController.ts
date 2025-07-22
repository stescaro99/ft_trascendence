import { GameState } from "../game/common/types";
import { drawBall, drawField, drawPowerUp, drawRect, drawScore } from "../game/common/Draw"
import multiplayerService from "../../services/multiplayerService";

export class RemoteController {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
  
    constructor(canvasId: string, initialState: GameState) {
      this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
      this.ctx = this.canvas.getContext('2d')!;

      this.draw(initialState);
      this.setupListeners();
      this.setupInput();
    }
  
    private setupListeners() {
      multiplayerService.onGameUpdate((state: GameState) => {
        console.log('[RemoteController] Ricevuto gameUpdate', state);
        this.draw(state);
      });
    }
  
    private setupInput() {
      document.addEventListener("keydown", (e) => {
        if (e.key === "ArrowUp" || e.key === "ArrowDown") {
          multiplayerService.sendInput({
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