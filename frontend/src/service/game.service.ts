import { environment } from '../environments/environment';

export class GameService {
	apiUrl = `${environment.apiUrl}`;

	async addGame(players: string[]) {
		if (!players || players.length === 0) {
			throw new Error("Players array cannot be empty");
		}
		const date = new Date().toISOString();
		const token = localStorage.getItem("user");
		const body: any = { players };
		if (date) body.date = date;

		const res = await fetch(`${this.apiUrl}/add_game`, {
			method: "POST",
			headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify(body),
		});
		return res.json();
	}

	async updateGame(game_id: number, field: string, new_value: any) {
		if (!game_id || !field || new_value === undefined) {
			throw new Error("Invalid parameters for updating game");
		}
		const token = localStorage.getItem("user");
		const res = await fetch(`${this.apiUrl}/update_game`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({ game_id, field, new_value }),
		});
		return res.json();
	}

	async getGame(game_id: number) {
		if (!game_id) {
			throw new Error("Game ID is required");
		}
		const res = await fetch(`${this.apiUrl}/get_game?game_id=${game_id}`);
		if (!res.ok) {
			throw new Error(`Error fetching game with ID ${game_id}`);
		}
		return res.json();
	}

	async deleteGame(game_id: number) {
		if (!game_id) {
			throw new Error("Game ID is required for deletion");
		}
		const token = localStorage.getItem("user");
		const res = await fetch(`${this.apiUrl}/delete_game?game_id=${game_id}`, {
			method: "DELETE",
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});
		if (!res.ok) {
			throw new Error(`Error deleting game with ID ${game_id}`);
		}
		return res.json();
	}
}