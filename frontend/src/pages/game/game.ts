import { TwoGameLoop } from "./TwoPlayers/TwoController";
import { FourGameLoop } from "./FourPlayers/FourController";
import { setBotActive, getBotActive } from "./common/BotState";

export class PongApp {
  private colors = ["#ff0000", "#00ff00", "#ffff00", "#800080", "#007bff", "#ffffff"];
  private Team1Color = "#ffffff";
  private Team2Color = "#ffffff";

  constructor() {
    document.addEventListener("DOMContentLoaded", () => this.init());
  }

  private init() {
    this.setupScreenButtons();
    this.setupBotButtons();
    this.setupPalettes();
    this.setupStartButtons();
  }

  private setupScreenButtons() {
    // Sposta la logica di showScreen qui
    document.querySelectorAll(".btn-large[onclick]").forEach(btn => {
      const screenId = (btn as HTMLButtonElement).getAttribute("onclick")?.match(/'([^']+)'/)?.[1];
      if (screenId) {
        btn.addEventListener("click", () => this.showScreen(screenId));
        btn.removeAttribute("onclick");
      }
    });
  }

  private showScreen(screenId: string) {
    document.querySelectorAll(".screen").forEach(el => el.classList.remove("visible"));
    const canvas = document.getElementById("pong") as HTMLCanvasElement;
    canvas.style.display = "none";
    const target = document.getElementById(screenId);
    if (target) {
      if (target.tagName === "CANVAS") {
        target.style.display = "block";
      } else {
        target.classList.add("visible");
      }
    }
  }

  private setupBotButtons() {
    for (let i = 0; i < 4; i++) {
      const btn = document.getElementById(`addBotBtn${i}`) as HTMLButtonElement;
      if (btn) {
        btn.addEventListener("click", () => {
          const newState = !getBotActive(i);
          setBotActive(i, newState);
          btn.classList.toggle("active-bot", newState);
          btn.textContent = newState ? "BOT ATTIVO" : "Add Bot";
        });
      }
    }
  }

  private setupPalettes() {
    const previews = [
      document.getElementById("Preview1") as HTMLDivElement,
      document.getElementById("Preview2") as HTMLDivElement,
      document.getElementById("Preview3") as HTMLDivElement,
      document.getElementById("Preview4") as HTMLDivElement,
    ];
    document.querySelectorAll(".palette").forEach((palette) => {
      palette.innerHTML = "";
      const player = (palette as HTMLElement).dataset.player!;
      this.colors.forEach((color) => {
        const btn = document.createElement("button");
        btn.style.backgroundColor = color;
        btn.setAttribute("data-color", color);
        btn.addEventListener("click", () => {
          if (player === "1" || player === "3") {
            this.Team1Color = color;
            previews[0].style.backgroundColor = color;
            previews[2].style.backgroundColor = color;
          } else {
            this.Team2Color = color;
            previews[1].style.backgroundColor = color;
            previews[3].style.backgroundColor = color;
          }
          (palette as HTMLElement)
            .querySelectorAll("button")
            .forEach((b) => b.classList.remove("selected"));
          btn.classList.add("selected");
        });
        palette.appendChild(btn);
      });
    });
  }

  private setupStartButtons() {
    const canvas = document.getElementById("pong") as HTMLCanvasElement;
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

    const startBtn2 = document.getElementById("startBtn2") as HTMLButtonElement;
    const startBtn4 = document.getElementById("startBtn4") as HTMLButtonElement;

    startBtn2?.addEventListener("click", () => {
      this.showScreen("pong");
      document.fonts.ready.then(() => {
        ctx.font = "80px Helvetica";
        this.startCountdown(2, ctx, canvas);
      });
    });

    startBtn4?.addEventListener("click", () => {
      this.showScreen("pong");
      document.fonts.ready.then(() => {
        ctx.font = "80px Helvetica";
        this.startCountdown(4, ctx, canvas);
      });
    });
  }

  private startCountdown(x: number, ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
    let countdown = 3;
    const interval = setInterval(() => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "white";
      ctx.textAlign = "center";
      if (countdown > 0)
        ctx.fillText(countdown.toString(), canvas.width / 2, canvas.height / 2);
      if (countdown === 0)
        ctx.fillText("GO!", canvas.width / 2, canvas.height / 2);
      if (countdown < 0) {
        clearInterval(interval);
        if (x === 2) {
          TwoGameLoop(this.Team1Color, this.Team2Color);
        } else if (x === 4) {
          FourGameLoop(this.Team1Color, this.Team2Color);
        }
      }
      countdown--;
    }, 1000);
  }
}

new PongApp();