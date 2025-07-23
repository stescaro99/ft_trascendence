import onlineGameHtml from './onlineGame.html?raw';
import { UserService } from '../../service/user.service';
import { User } from '../../model/user.model';
import { TranslationService } from '../../service/translation.service';
import { RemoteController } from "./RemoteController";
import multiplayerService from '../../services/multiplayerService';

// Variabili per il timer
let searchTimer: number | null = null;
let searchStartTime: number = 0;

export class OnlineGamePage {
	user : User = new UserService().getUser() || new User();
	constructor(_currentLang: string) {
		console.log("[OnlineGame] 🚀 OnlineGamePage constructor chiamato!");
		this.init();
	}

	private init() {
		this.render();
		
		// Inizializza il gioco DOPO aver renderizzato l'HTML
		setTimeout(() => {
			this.initializeOnlineGame();
		}, 100);
		
		const nicknameElement = document.getElementById('nickname');
		if (nicknameElement) {
			nicknameElement.textContent = `Nickname: ${localStorage.getItem('nickname')}`;
		}
	}

	private initializeOnlineGame() {
		console.log("[OnlineGame] 🎮 Inizializzando online game...");
		const canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
		const status = document.getElementById("status")!;
		const matchInfo = document.getElementById("matchInfo")!;
		const findMatchBtn = document.getElementById("findMatchBtn");

		console.log("[OnlineGame] Elementi trovati:", {
			canvas: !!canvas,
			status: !!status,
			matchInfo: !!matchInfo,
			findMatchBtn: !!findMatchBtn
		});

		if (!findMatchBtn) {
			console.error("[OnlineGame] ❌ Pulsante Cerca Partita non trovato!");
			return;
		}

		console.log("[OnlineGame] 🔌 Connettendo multiplayerService...");
		multiplayerService.connect();

		// Funzione per aggiornare il timer di ricerca
		const updateSearchTimer = () => {
			const elapsed = Math.floor((Date.now() - searchStartTime) / 1000);
			const minutes = Math.floor(elapsed / 60);
			const seconds = elapsed % 60;
			const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
			status.textContent = `Cercando partita... ${timeString}`;
		};

		// Funzione per fermare la ricerca
		const stopSearch = () => {
			if (searchTimer) {
				clearInterval(searchTimer);
				searchTimer = null;
			}
			
			if (findMatchBtn) {
				findMatchBtn.removeAttribute("disabled");
				findMatchBtn.classList.remove("bg-gray-400", "cursor-not-allowed");
				findMatchBtn.classList.add("bg-blue-500", "hover:bg-blue-700");
				findMatchBtn.textContent = "Cerca Partita";
			}
			
			status.textContent = "Premi il pulsante per cercare una partita";
		};

		console.log("[OnlineGame] 🎯 Aggiungendo listener al pulsante Cerca Partita");
		findMatchBtn.addEventListener("click", () => {
			console.log("[OnlineGame] 🚀 PULSANTE CERCA PARTITA CLICCATO!");
			
			// Cambia l'aspetto del pulsante
			findMatchBtn.setAttribute("disabled", "true");
			findMatchBtn.classList.remove("bg-blue-500", "hover:bg-blue-700");
			findMatchBtn.classList.add("bg-gray-400", "cursor-not-allowed");
			findMatchBtn.textContent = "Ricerca in corso...";
			
			// Avvia il timer
			searchStartTime = Date.now();
			updateSearchTimer();
			searchTimer = setInterval(updateSearchTimer, 1000);
			
			// Mostra il pulsante di annullamento
			const cancelBtn = document.getElementById("cancelMatchBtn");
			if (cancelBtn) {
				cancelBtn.classList.remove("hidden");
			}
			
			// Avvia la ricerca
			console.log("[OnlineGame] 🔍 Avviando ricerca partita...");
			multiplayerService.findMatch('two');
		});

		// Aggiungi un pulsante per annullare la ricerca
		const cancelBtn = document.createElement("button");
		cancelBtn.id = "cancelMatchBtn";
		cancelBtn.className = "bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded ml-4 hidden";
		cancelBtn.textContent = "Annulla Ricerca";
		cancelBtn.addEventListener("click", () => {
			console.log("[OnlineGame] ❌ Ricerca annullata dall'utente");
			stopSearch();
			cancelBtn.classList.add("hidden");
		});
		
		findMatchBtn.parentNode?.insertBefore(cancelBtn, findMatchBtn.nextSibling);

		// Callback quando si è in attesa di altri giocatori
		multiplayerService.onWaitingForPlayers((data) => {
			console.log("[OnlineGame] 🕐 In attesa di altri giocatori:", data);
			status.textContent = `In attesa di giocatori... (${data.currentPlayers}/${data.maxPlayers})`;
		});

		// Callback quando la partita inizia
		multiplayerService.onGameStart((initialState) => {
			console.log("[OnlineGame] 🎉 Partita trovata! Callback onGameStart chiamato!", initialState);
			
			// Ferma il timer di ricerca
			if (searchTimer) {
				clearInterval(searchTimer);
				searchTimer = null;
			}
			
			// Nascondi il pulsante di annullamento
			const cancelBtn = document.getElementById("cancelMatchBtn");
			if (cancelBtn)
				cancelBtn.classList.add("hidden");
			
			status.textContent = "Partita trovata!";
			matchInfo.classList.remove("hidden");

			// FORZA la visualizzazione del canvas
			canvas.style.display = "block";
			canvas.classList.remove("hidden");

			if (findMatchBtn)
				findMatchBtn.style.display = "none";

			new RemoteController("gameCanvas", initialState);
		});

		console.log("[OnlineGame] ✅ Inizializzazione completata!");
	}

	render () {
		console.log("[OnlineGame] 🎨 Rendering HTML...");
		const container = document.getElementById('app');
		if (!container)
			return;

		const translation = new UserService().getUser()?.language || 'en';
		const translatedHtml = new TranslationService(translation).translateTemplate(onlineGameHtml);
		container.innerHTML = translatedHtml;

		const screen = container.querySelector('.screen');
		if (screen)
			screen.classList.add('visible');
		
		console.log("[OnlineGame] ✅ HTML renderizzato!");
	}
}