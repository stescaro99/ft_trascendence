import gameTwoHtml from './game_two.html?raw';
import gameFourHtml from './game_four.html?raw';
import './game.css'
import { TwoGameLoop } from "./TwoPlayers/TwoController";
import { FourGameLoop } from "./FourPlayers/FourController";
import { setBotActive, getBotActive } from "./common/BotState";

export class GamePage {

   Team1Color = "#ffffff";
  Team2Color = "#ffffff";
  colors = ["#ff0000", "#00ff00", "#ffff00", "#800080", "#007bff", "#ffffff"];

  constructor() {
    
    this.render();
  }
  
  render() {

    const canvas = this.createCanvas();
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    const params = new URLSearchParams(window.location.hash.split('?')[1]);
    const players = params.get('players');
    const container = document.getElementById('app');
    console.log("Rendering GamePage with players:", players);
    if (!container) 
      return;
    if (players === '4') {
        container.innerHTML = gameFourHtml;
      } else {
        container.innerHTML = gameTwoHtml;
      }

  const screen = container.querySelector('.screen');
    if (screen) screen.classList.add('visible');

    // Palette colori
    const preview1 = document.getElementById("Preview1") as HTMLDivElement;
    const preview2 = document.getElementById("Preview2") as HTMLDivElement;
    const preview3 = document.getElementById("Preview3") as HTMLDivElement;
    const preview4 = document.getElementById("Preview4") as HTMLDivElement;

    const paletteContainers = container.querySelectorAll(".palette");
    paletteContainers.forEach((palette) => {
      palette.innerHTML = "";
      const player = (palette as HTMLElement).dataset.player!;
      this.colors.forEach((color) => {
        const btn = document.createElement("button");
        btn.style.backgroundColor = color;
        btn.setAttribute("data-color", color);
        btn.addEventListener("click", () => {
          if (player === "1" || player === "3") {
            this.Team1Color = color;
            if (preview1) preview1.style.backgroundColor = color;
            if (preview3) preview3.style.backgroundColor = color;
          } else {
            this.Team2Color = color;
            if (preview2) preview2.style.backgroundColor = color;
            if (preview4) preview4.style.backgroundColor = color;
          }
          (palette as HTMLElement)
            .querySelectorAll("button")
            .forEach((b) => b.classList.remove("selected"));
          btn.classList.add("selected");
        });
        palette.appendChild(btn);
      });
    });

    // Bot buttons
    for (let i = 0; i < 4; i++) {
      const btn = document.getElementById(`addBotBtn${i}`);
      if (btn) {
        btn.addEventListener("click", () => {
          const newState = !getBotActive(i);
          setBotActive(i, newState);
          btn.classList.toggle("active-bot", newState);
          btn.textContent = newState ? "BOT ATTIVO" : "Add Bot";
        });
      }
    }

    // Start buttons
    const canvas = document.getElementById("pong") as HTMLCanvasElement;
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

    const startBtn2 = document.getElementById("startBtn2");
    if (startBtn2) {
      startBtn2.addEventListener("click", () => {
        this.hideScreens();
        canvas.style.display = "block";
        document.fonts.ready.then(() => {
          ctx.font = "80px Helvetica";
          this.startCountdown(2, ctx, canvas);
        });
      });
    }

    const startBtn4 = document.getElementById("startBtn4");
    if (startBtn4) {
      startBtn4.addEventListener("click", () => {
        this.hideScreens();
        canvas.style.display = "block";
        document.fonts.ready.then(() => {
          ctx.font = "80px Helvetica";
          this.startCountdown(4, ctx, canvas);
        });
      });
    }
    
  }

   hideScreens() {
    document.querySelectorAll(".screen").forEach(el => el.classList.remove("visible"));
  }

  startCountdown(x: number, ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
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

createCanvas() {
  let canvas = document.getElementById("pong") as HTMLCanvasElement | null;
  if (!canvas) {
    canvas = document.createElement("canvas");
    canvas.id = "pong";
    canvas.width = 1200;
    canvas.height = 750;
    canvas.style.display = "none";
    document.body.appendChild(canvas);
  }
  return canvas;
}

removeCanvas() {
  const canvas = document.getElementById("pong");
  if (canvas) canvas.remove();
}