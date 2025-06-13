import { TwoGameLoop } from "./TwoPlayers/TwoController";
import { FourGameLoop } from "./FourPlayers/FourController";
import { setBotActive, getBotActive } from "./common/BotState";

const canvas = document.getElementById("pong") as HTMLCanvasElement;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

const startBtn2 = document.getElementById("startBtn2") as HTMLButtonElement;
const startBtn4 = document.getElementById("startBtn4") as HTMLButtonElement;


const preview1 = document.getElementById("Preview1") as HTMLDivElement;
const preview2 = document.getElementById("Preview2") as HTMLDivElement;
const preview3 = document.getElementById("Preview3") as HTMLDivElement;
const preview4 = document.getElementById("Preview4") as HTMLDivElement;

let Team1Color = "#ffffff";
let Team2Color = "#ffffff";

const colors = ["#ff0000", "#00ff00", "#ffff00", "#800080", "#007bff", "#ffffff"];

const paletteContainers = document.querySelectorAll(".palette");

const addBotBtn0 = document.getElementById("addBotBtn0");
addBotBtn0?.addEventListener("click", () => {
  const botIndex = 0;
  const newState = !getBotActive(botIndex);
  setBotActive(botIndex, newState);
  addBotBtn0.classList.toggle("active-bot", newState);
  addBotBtn0.textContent = newState ? "BOT ATTIVO" : "Add Bot";
});

const addBotBtn1 = document.getElementById("addBotBtn1");
addBotBtn1?.addEventListener("click", () => {
  const botIndex = 1;
  const newState = !getBotActive(botIndex);
  setBotActive(botIndex, newState);
  addBotBtn1.classList.toggle("active-bot", newState);
  addBotBtn1.textContent = newState ? "BOT ATTIVO" : "Add Bot";
});

const addBotBtn2 = document.getElementById("addBotBtn2");
addBotBtn2?.addEventListener("click", () => {
  const botIndex = 2;
  const newState = !getBotActive(botIndex);
  setBotActive(botIndex, newState);
  addBotBtn2.classList.toggle("active-bot", newState);
  addBotBtn2.textContent = newState ? "BOT ATTIVO" : "Add Bot";
});

const addBotBtn3 = document.getElementById("addBotBtn3");
addBotBtn3?.addEventListener("click", () => {
  const botIndex = 3;
  const newState = !getBotActive(botIndex);
  setBotActive(botIndex, newState);
  addBotBtn3.classList.toggle("active-bot", newState);
  addBotBtn3.textContent = newState ? "BOT ATTIVO" : "Add Bot";
});

paletteContainers.forEach((palette) => {
  palette.innerHTML = "";
  console.log(palette);

  const player = (palette as HTMLElement).dataset.player!;
  colors.forEach((color) => {
    const btn = document.createElement("button");
    btn.style.backgroundColor = color;
    btn.setAttribute("data-color", color);
    btn.addEventListener("click", () => {
      if (player === "1" || player === "3")
      {
        Team1Color = color;
        preview1.style.backgroundColor = color;
        preview3.style.backgroundColor = color;
      }
      else
      {
        Team2Color = color;
        preview2.style.backgroundColor = color;
        preview4.style.backgroundColor = color;
      }

      (palette as HTMLElement)
        .querySelectorAll("button")
        .forEach((b) => b.classList.remove("selected"));
      btn.classList.add("selected");
    });

    palette.appendChild(btn);
  });
});

// === Countdown ===

function startCountdown(x: number)
{
  let countdownActive = true;
  let countdown = 3;

  const interval = setInterval(() => {
      
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
   

    if (countdown > 0)
      ctx.fillText(countdown.toString(), canvas.width / 2, canvas.height / 2);
  
    if (countdown === 0)
      ctx.fillText("GO!", canvas.width / 2, canvas.height / 2);

    if (countdown < 0)
    {
      if (x === 2)
      {
        clearInterval(interval);
        countdownActive = false;
        TwoGameLoop(Team1Color, Team2Color);
      }
      else if (x === 4)
      {
        clearInterval(interval);
        countdownActive = false;
        FourGameLoop(Team1Color, Team2Color);
      }
    }
    countdown--; 
  }, 1000);
}



startBtn2.addEventListener("click", () => {
  document.querySelectorAll(".screen").forEach(el => el.classList.remove("visible"));

  canvas.style.display = "block";
  
  document.fonts.ready.then(() => {
    ctx.font = "80px Helvetica";
    startCountdown(2);
  });
});

startBtn4.addEventListener("click", () => {
  document.querySelectorAll(".screen").forEach(el => el.classList.remove("visible"));

  canvas.style.display = "block";
  
  document.fonts.ready.then(() => {
    ctx.font = "80px Helvetica";
    startCountdown(4);
  });
});
