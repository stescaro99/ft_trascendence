import { GameState } from "../game/common/types.ts";

export class MultiplayerService {
	private socket: WebSocket | null = null;
	private gameUpdateCallback: ((state: GameState) => void) | null = null;
	private gameStartCallback: (() => void) | null = null; 

	connect() {
        const token = localStorage.getItem("jwt");
        if (!token)
        {
            console.error("Token JWT mancante.");
            return ;
        }

		this.socket = new WebSocket(`wss://localhost:9443/ws/game?token=${token}`);

		this.socket.onopen = () => {
			console.log("[WebSocket] Connesso");
		};

		this.socket.onmessage = (event) => {
			const data = JSON.parse(event.data);
			console.log("[WebSocket] Ricevuto:", data);
	
			if (data.type === "state" && this.gameUpdateCallback) {
				this.gameUpdateCallback(data.payload);
			}

			if (data.type === "match_found" && this.gameStartCallback) {
				this.gameStartCallback();
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
			this.socket.send(JSON.stringify({ type: "input", ...input }));
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