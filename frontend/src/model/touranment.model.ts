export interface TournamentResult {
    game: string[];
    winner: string;
    round: number;
}

export interface TournamentRound {
    roundNumber: number;
    roundName: string;
    games: string[][];
    results: TournamentResult[];
    completed: boolean;
}

export class Tournament {
	tournament_id: number | undefined = undefined;
	currentGameIndex: number | undefined = undefined;
	currentRound: number = 0;
	tournament_key: string = '';
	players: string[] = [];
	results?: TournamentResult[];
	games: string[][] = []; // Manteniamo per compatibilità
	rounds: TournamentRound[] = []; // Nuovo sistema a round
	number_of_players: number | undefined = undefined;
	date: Date = new Date();
	winner_nickname: string = '';
}