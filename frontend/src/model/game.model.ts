
export class Game  {
	game_id!: number;
	game_status!: 'pending' | 'finished';
	player1_nickname!: string;
	player2_nickname!: string;
	player3_nickname?: string;
	player4_nickname?: string;
	player1_score?: number;
	player2_score?: number;
	player3_score?: number;
	player4_score?: number;
	winner_nickname?: string;
	date!: Date;
}
