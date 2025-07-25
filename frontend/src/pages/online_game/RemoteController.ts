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
        this.draw(state);
      });
    }
  
    private setupInput() {
      console.log('[RemoteController] Setup input listeners');
    
      // Assicurati che il canvas possa ricevere il focus
      this.canvas.tabIndex = 0;
      this.canvas.focus();
    
      // Aggiungi listener sia al document che al canvas
      const handleKeyDown = (e: KeyboardEvent) => {
        console.log('[RemoteController] Key down:', e.key);
        if (e.key === "ArrowUp" || e.key === "ArrowDown") {
          console.log('[RemoteController] Sending input for:', e.key);
          multiplayerService.sendInput({
            direction: e.key === "ArrowUp" ? "up" : "down",
            timestamp: Date.now()
          });
        }
      };
    
      document.addEventListener("keydown", handleKeyDown);
      this.canvas.addEventListener("keydown", handleKeyDown);
    
      // Assicurati che il canvas mantenga il focus quando cliccato
      this.canvas.addEventListener("click", () => {
        console.log('[RemoteController] Canvas clicked, setting focus');
        this.canvas.focus();
      });
    }
  
    private draw(state: GameState) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      
        drawField(this.ctx, this.canvas);
        
        // Solo disegna la palla se non è in attesa
        if (state.ball && !state.waitingForStart) {
            drawBall(this.ctx, state.ball);
        } else if (state.waitingForStart) {
            // Mostra countdown o messaggio
            this.ctx.fillStyle = "white";
            this.ctx.font = "24px Arial";
            this.ctx.textAlign = "center";
            this.ctx.fillText("Get Ready!", this.canvas.width / 2, this.canvas.height / 2 - 30);
        }
        
        // Disegna powerup se attivo
        if (state.powerUp && state.powerUp.active) {
            drawPowerUp(this.ctx, state.powerUp);
        }

        state.leftPaddle.forEach(p =>
            drawRect(this.ctx, p.x, p.y, state.paddleWidth, p.height, "#FF0000")
        );

        state.rightPaddle.forEach(p =>
            drawRect(this.ctx, p.x, p.y, state.paddleWidth, p.height, "#00FF00")
        );

        drawScore(this.ctx, this.canvas, state.scoreLeft, state.scoreRight);
    }
  }