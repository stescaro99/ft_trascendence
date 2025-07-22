import { GameState } from "../pages/game/common/types";

export class MultiplayerService {
	private socket: WebSocket | null = null;
	private gameUpdateCallback: ((state: GameState) => void) | null = null;
	private gameStartCallback: ((state: any) => void) | null = null;
	private waitingCallback: ((data: any) => void) | null = null;
	private currentRoomId: string | null = null;
	private heartbeatInterval: number | null = null; 

	connect() {
		// Se già connesso, non riconnettersi
		if (this.socket && this.socket.readyState === WebSocket.OPEN) {
			console.log("[WebSocket] Già connesso, usando connessione esistente");
			return;
		}

        const token = localStorage.getItem("token");
        console.log("[WebSocket] Token trovato:", !!token);
        console.log("[WebSocket] Token preview:", token ? token.substring(0, 20) + "..." : "null");
        if (!token)
        {
            console.error("[WebSocket] Token JWT mancante. Impossibile connettersi.");
            return ;
        }

		const wsUrl = `wss://transcendence.be:9443/ws/game?token=${token}`;
		console.log("[WebSocket] Tentativo di connessione a:", wsUrl);
		this.socket = new WebSocket(wsUrl);

		this.socket.onopen = () => {
			console.log("[WebSocket] Connesso con successo!");
			// Avvia heartbeat ogni 10 secondi
			this.startHeartbeat();
		};

		this.socket.onmessage = (event) => {
			const data = JSON.parse(event.data);
			console.log("[WebSocket] Messaggio ricevuto:", data);
	
			if (data.type === "gameUpdate" && this.gameUpdateCallback) {
				console.log("[WebSocket] Gestendo gameUpdate");
				this.gameUpdateCallback(data.gameState);
			}

			if (data.type === "waitingForPlayers") {
				console.log("[WebSocket] In attesa di altri giocatori...", data);
				this.currentRoomId = data.roomId;
				if (this.waitingCallback) {
					this.waitingCallback(data);
				}
			}

			if (data.type === "matchFound") {
				console.log("[WebSocket] Partita trovata! Room ID:", data.roomId);
				this.currentRoomId = data.roomId;
				// Non avviare il gioco qui, aspetta gameStarted
			}

			if (data.type === "gameStarted") {
				console.log("[WebSocket] Gioco iniziato!");
				this.gameStartCallback?.(data.gameState);
			}
		};

		this.socket.onerror = (err) => {
			console.error("[WebSocket] Errore di connessione:", err);
			console.error("[WebSocket] ReadyState:", this.socket?.readyState);
		};

		this.socket.onclose = (event) => {
			console.warn("[WebSocket] Disconnesso - Codice:", event.code, "Reason:", event.reason);
			this.stopHeartbeat();
		};
	}

	private startHeartbeat() {
		this.stopHeartbeat(); // Pulisce eventuali interval precedenti
		this.heartbeatInterval = setInterval(() => {
			if (this.socket && this.socket.readyState === WebSocket.OPEN) {
				console.log("[WebSocket] Inviando ping heartbeat");
				this.socket.send(JSON.stringify({
					type: 'ping',
					timestamp: Date.now()
				}));
			}
		}, 10000); // Ogni 10 secondi
	}

	private stopHeartbeat() {
		if (this.heartbeatInterval) {
			clearInterval(this.heartbeatInterval);
			this.heartbeatInterval = null;
		}
	}

	sendInput(input: { direction: 'up' | 'down'; timestamp: number }) {
		if (this.socket && this.socket.readyState === WebSocket.OPEN && this.currentRoomId) {
			this.socket.send(JSON.stringify({ 
				type: "playerInput", 
				roomId: this.currentRoomId,
				input: input 
			}));
		} else {
			console.error("[WebSocket] Impossibile inviare input:", {
				socketReady: this.socket?.readyState === WebSocket.OPEN,
				roomId: this.currentRoomId
			});
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

	onGameStart(cb: (state: any) => void) {
		this.gameStartCallback = cb;
	}

	onWaitingForPlayers(cb: (data: any) => void) {
		this.waitingCallback = cb;
	}
}


const multiplayerService = new MultiplayerService();
export default multiplayerService;