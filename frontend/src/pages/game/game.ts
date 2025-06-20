import gameTwoHtml from './game_two.html?raw';
import gameFourHtml from './game_four.html?raw';
import './game.css'
import { TwoGameLoop } from "./TwoPlayers/TwoController";
import { FourGameLoop } from "./FourPlayers/FourController";
import { setBotActive, getBotActive } from "./common/BotState";
import { TranslationService } from '../../service/translation.service';

export class GamePage {
	private currentLang: string;
   Team1Color = "#ffffff";
  Team2Color = "#ffffff";
  colors = ["#ff0000", "#00ff00", "#ffff00", "#800080", "#007bff", "#ffffff"];

  constructor(lang: string) {
	this.currentLang = lang;
	this.render();
  }
  
  render() {

	const params = new URLSearchParams(window.location.hash.split('?')[1]);
	const players = params.get('players');
	const container = document.getElementById('app');
	console.log("Rendering GamePage with players:", players);
	if (!container) 
	  return;
	if (players === '4') {
		const translation = new TranslationService(this.currentLang);
		const translatedHtml = translation.translateTemplate(gameFourHtml);
		container.innerHTML = translatedHtml;
	  } else {
		const translation = new TranslationService(this.currentLang);
		const translatedHtml = translation.translateTemplate(gameTwoHtml);
		container.innerHTML = translatedHtml;
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
		  
		  // Gestione classi Tailwind per bot attivo
		  if (newState) {
			btn.classList.remove("bg-black", "text-white", "hover:bg-gray-900", "hover:text-cyan-400");
			btn.classList.add("bg-green-500", "text-white");
		  } else {
			btn.classList.remove("bg-green-500");
			btn.classList.add("bg-black", "text-white", "hover:bg-gray-900", "hover:text-cyan-400");
		  }
		  
		  btn.textContent = newState ? "BOT ATTIVO" : "Add Bot";
		  
		  // Aggiorna i nomi dei giocatori
		  this.updatePlayerNames();
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
	// Mostra i nomi dei giocatori
	const playerNameContainer = document.getElementById("playerNames");
	if (playerNameContainer) {
	  playerNameContainer.style.display = "flex";
	  
	  if (x === 2) {
		const player1Name = document.getElementById("player1Name");
		const player2Name = document.getElementById("player2Name");
		if (player1Name) player1Name.textContent = "Giocatore 1";
		if (player2Name) player2Name.textContent = "Giocatore 2";
	  } else if (x === 4) {
		const player1Name = document.getElementById("player1Name");
		const player2Name = document.getElementById("player2Name");
		const player3Name = document.getElementById("player3Name");
		const player4Name = document.getElementById("player4Name");
		
		if (player1Name) player1Name.textContent = "Team 1 - P1";
		if (player2Name) player2Name.textContent = "Team 1 - P2";
		if (player3Name) player3Name.textContent = "Team 2 - P1";
		if (player4Name) player4Name.textContent = "Team 2 - P2";
	  }
	}

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

	// Aggiungi metodo per aggiornare i nomi dei giocatori
	updatePlayerNames() {
	  // Aggiorna i nomi durante il setup
	  const team1Player1 = document.getElementById("team1Player1");
	  const team1Player2 = document.getElementById("team1Player2");
	  const team2Player1 = document.getElementById("team2Player1");
	  const team2Player2 = document.getElementById("team2Player2");

	  if (team1Player1) {
		team1Player1.textContent = getBotActive(0) ? "BOT" : "Player 1";
		if (getBotActive(0)) {
		  team1Player1.classList.add("text-green-500");
		  team1Player1.classList.remove("text-cyan-400");
		} else {
		  team1Player1.classList.add("text-cyan-400");
		  team1Player1.classList.remove("text-green-500");
		}
	  }
	  
	  if (team1Player2) {
		team1Player2.textContent = getBotActive(1) ? "BOT" : "Player 2";
		if (getBotActive(1)) {
		  team1Player2.classList.add("text-green-500");
		  team1Player2.classList.remove("text-cyan-400");
		} else {
		  team1Player2.classList.add("text-cyan-400");
		  team1Player2.classList.remove("text-green-500");
		}
	  }
	  
	  if (team2Player1) {
		team2Player1.textContent = getBotActive(2) ? "BOT" : "Player 1";
		if (getBotActive(2)) {
		  team2Player1.classList.add("text-green-500");
		  team2Player1.classList.remove("text-cyan-400");
		} else {
		  team2Player1.classList.add("text-cyan-400");
		  team2Player1.classList.remove("text-green-500");
		}
	  }
	  
	  if (team2Player2) {
		team2Player2.textContent = getBotActive(3) ? "BOT" : "Player 2";
		if (getBotActive(3)) {
		  team2Player2.classList.add("text-green-500");
		  team2Player2.classList.remove("text-cyan-400");
		} else {
		  team2Player2.classList.add("text-cyan-400");
		  team2Player2.classList.remove("text-green-500");
		}
	  }

	  // Aggiorna anche i nomi nel canvas overlay
	  const player1Name = document.getElementById("player1Name");
	  const player2Name = document.getElementById("player2Name");
	  const player3Name = document.getElementById("player3Name");
	  const player4Name = document.getElementById("player4Name");

	  if (player1Name) player1Name.textContent = getBotActive(0) ? "Team 1 - BOT" : "Team 1 - Player 1";
	  if (player2Name) player2Name.textContent = getBotActive(1) ? "Team 1 - BOT" : "Team 1 - Player 2";
	  if (player3Name) player3Name.textContent = getBotActive(2) ? "Team 2 - BOT" : "Team 2 - Player 1";
	  if (player4Name) player4Name.textContent = getBotActive(3) ? "Team 2 - BOT" : "Team 2 - Player 2";
	}
}