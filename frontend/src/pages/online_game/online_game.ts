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
				findMatchBtn.style.display = "block";
			}
			
			// Nascondi il canvas se visibile
			canvas.classList.add("hidden");
			canvas.style.display = "none !important";
			
			// Nascondi le istruzioni di gioco
			const gameInstructions = document.getElementById("gameInstructions");
			if (gameInstructions) {
				gameInstructions.classList.add("hidden");
			}
			
			status.textContent = "Premi il pulsante per cercare una partita";
			matchInfo.classList.add("hidden");
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

			// FERMA IL TIMER DI RICERCA
			if (searchTimer) {
				clearInterval(searchTimer);
				searchTimer = null;
				console.log("[OnlineGame] Timer di ricerca fermato");
			}

			// AGGIORNA GLI ELEMENTI UI
			const status = document.getElementById("status");
			const matchInfo = document.getElementById("matchInfo");
			const findMatchBtn = document.getElementById("findMatchBtn");
			const cancelBtn = document.getElementById("cancelMatchBtn");
			const gameInstructions = document.getElementById("gameInstructions");

			// Nascondi i pulsanti
			if (findMatchBtn) {
				findMatchBtn.style.display = "none";
				console.log("[OnlineGame] Pulsante 'Cerca Partita' nascosto");
			}
			
			if (cancelBtn) {
				cancelBtn.classList.add("hidden");
				console.log("[OnlineGame] Pulsante 'Annulla Ricerca' nascosto");
			}

			// Aggiorna il testo di status
			if (status) {
				status.textContent = "Partita trovata!";
				status.className = "text-green-500 text-sm"; // Cambia colore in verde
				console.log("[OnlineGame] Status aggiornato");
			}

			// Mostra "Partita trovata!"
			if (matchInfo) {
				matchInfo.classList.remove("hidden");
				matchInfo.textContent = "Partita trovata!";
				console.log("[OnlineGame] MatchInfo mostrato");
			}

			// Mostra le istruzioni
			if (gameInstructions) {
				gameInstructions.classList.remove("hidden");
				console.log("[OnlineGame] Istruzioni di gioco mostrate");
			}

			// GESTISCI IL CANVAS
			const canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
			if (!canvas) {
				console.error("[OnlineGame] ❌ Canvas non trovato nel DOM!");
				// Logica di creazione canvas...
			} else {
				// Il canvas esiste, mostralo
				canvas.classList.remove("hidden");
				canvas.style.display = "block";
				canvas.style.visibility = "visible";
				console.log("[OnlineGame] Canvas mostrato");
			}

			// AVVIA IL CONTROLLER DI GIOCO
			new RemoteController("gameCanvas", initialState);
			console.log("[OnlineGame] RemoteController avviato");
		});
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
		
		// Nascondi completamente la sezione di ricerca
		const searchSection = document.querySelector('.screen > div:first-child');

		if (searchSection) {
			searchSection.style.display = "none";
		}
	}
}