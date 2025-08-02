import { GameState } from "../game/common/types";
import { drawBall, drawField, drawPowerUp, drawRect, drawScore } from "../game/common/Draw"
import multiplayerService from "../../services/multiplayerService";

export class RemoteController {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private keys: { [key: string]: boolean } = {};
    private animationFrameId: number | null = null;

    constructor(canvasId: string, initialState: GameState) {
        this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        this.ctx = this.canvas.getContext('2d')!;

        this.draw(initialState);
        this.setupListeners();
        this.setupInput();
        this.gameLoop();
    }

    private setupListeners() {
        multiplayerService.onGameUpdate((state: GameState) => {
            this.draw(state);
        });
    }

    private setupInput() {
        this.canvas.tabIndex = 0;
        this.canvas.focus();

        document.addEventListener("keydown", (e) => {
            if (e.key === "w" || e.key === "s") {
                this.keys[e.key] = true;
            }
        });

        document.addEventListener("keyup", (e) => {
            if (e.key === "w" || e.key === "s") {
                this.keys[e.key] = false;
            }
        });

        this.canvas.addEventListener("click", () => {
            this.canvas.focus();
        });
    }

    // Game loop per inviare input in modo fluido
    private gameLoop = () => {
        let direction = "stop";
        if (this.keys["w"] && this.keys["s"]) {
            direction = "stop";
        } else if (this.keys["w"]) {
            direction = "up";
        } else if (this.keys["s"]) {
            direction = "down";
        }

        multiplayerService.sendInput({
            direction,
            timestamp: Date.now()
        });

        this.animationFrameId = requestAnimationFrame(this.gameLoop);
    }

    private draw(state: GameState) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        drawField(this.ctx, this.canvas);

        if (state.ball && !state.waitingForStart) {
            drawBall(this.ctx, state.ball);
        } else if (state.waitingForStart) {
            this.ctx.fillStyle = "white";
            this.ctx.font = "24px Arial";
            this.ctx.textAlign = "center";
            this.ctx.fillText("Get Ready!", this.canvas.width / 2, this.canvas.height / 2 - 30);
        }

        if (state.powerUp && state.powerUp.active) {
            drawPowerUp(this.ctx, state.powerUp);
        }

        state.leftPaddle.forEach(p =>
            drawRect(this.ctx, p.x, p.y, state.paddleWidth, p.height, "#00FF00")
        );

        state.rightPaddle.forEach(p =>
            drawRect(this.ctx, p.x, p.y, state.paddleWidth, p.height, "#FF0000")
        );

        drawScore(this.ctx, this.canvas, state.scoreLeft, state.scoreRight);
    }
}