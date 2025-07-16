import { GameState } from "../pages/game/common/types";

export class MultiplayerService {
	private socket: WebSocket | null = null;
	private gameUpdateCallback: ((state: GameState) => void) | null = null;
	private gameStartCallback: (() => void) | null = null; 

	connect() {
        const token = localStorage.getItem("jwt");
        console.log("[WebSocket] Token trovato:", !!token);
        if (!token)
        {
            console.error("[WebSocket] Token JWT mancante. Impossibile connettersi.");
            return ;
        }

		console.log("[WebSocket] Tentativo di connessione a wss://transcendence.be:9443/ws/game");
		this.socket = new WebSocket(`wss://transcendence.be:9443/ws/game?token=${token}`);

		this.socket.onopen = () => {
			console.log("[WebSocket] Connesso con successo!");
		};

		this.socket.onmessage = (event) => {
			const data = JSON.parse(event.data);
			console.log("[WebSocket] Messaggio ricevuto:", data);
	
			if (data.type === "gameUpdate" && this.gameUpdateCallback) {
				console.log("[WebSocket] Gestendo gameUpdate");
				this.gameUpdateCallback(data.gameState);
			}

			if (data.type === "matchFound") {
				console.log("[WebSocket] Partita trovata! Room ID:", data.roomId);
				if (this.gameStartCallback) {
					this.gameStartCallback();
				}
			}

			if (data.type === "gameStarted") {
				console.log("[WebSocket] Gioco iniziato!");
				if (this.gameStartCallback) {
					this.gameStartCallback();
				}
			}
		};

		this.socket.onerror = (err) => {
			console.error("[WebSocket] Errore:", err);
		};

		this.socket.onclose = () => {
			console.warn("[WebSocket] Disconnesso");
		};
	}

	sendInput(input: { direction: 'up' | 'down'; timestamp: number }) {
		if (this.socket && this.socket.readyState === WebSocket.OPEN) {
			this.socket.send(JSON.stringify({ 
				type: "playerInput", 
				input: input 
			}));
		}
	}

	findMatch(gameType: 'two' | 'four' = 'two') {
		console.log("[WebSocket] Cercando partita tipo:", gameType);
		if (this.socket && this.socket.readyState === WebSocket.OPEN) {
			console.log("[WebSocket] Inviando richiesta findMatch");
			this.socket.send(JSON.stringify({ 
				type: "findMatch", 
				gameType: gameType 
			}));
		} else {
			console.error("[WebSocket] Socket non connesso! ReadyState:", this.socket?.readyState);
		}
	}

	onGameUpdate(cb: (state: GameState) => void) {
		this.gameUpdateCallback = cb;
	}

	onGameStart(cb: () => void) {
		this.gameStartCallback = cb;
	}
}


const multiplayerService = new MultiplayerService();
export default multiplayerService;