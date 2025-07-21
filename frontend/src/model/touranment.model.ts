export interface TournamentResult {
    game: string[];
    winner: string;
}

export class Tournament {
	tournament_id: number | undefined = undefined;
	currentGameIndex: number | undefined = undefined;
	tournament_key: string = '';
	players: string[] = [];
	 results?: TournamentResult[];
	games: string[][] = [];
	number_of_players: number | undefined = undefined;
	date: Date = new Date();
	winner_nickname: string = '';
}