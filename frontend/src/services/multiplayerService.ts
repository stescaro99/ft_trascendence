export class MultiplayerService {
	private socket: WebSocket | null = null;

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
			// TODO: invoca funzione per aggiornare stato di gioco
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
}

export default new MultiplayerService();
