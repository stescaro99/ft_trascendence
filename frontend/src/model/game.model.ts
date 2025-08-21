
export class Game  {
	public game_id?: number;
	public game_status?: 'pending' | 'finished';
	public players?: string[];
	public scores?: [number, number];
	public winner_nickname?: string;
	public date?: Date;
}
