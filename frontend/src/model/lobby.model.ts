import { User } from './user.model';

function generateLobbyKey(length: number = 6): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let key = '';
  for (let i = 0; i < length; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return key;
}

export class Lobby {
	lobby_name!: string;
	players: User[] = [];
	max_players!: number;
	status!: 'waiting' | 'in_progress' | 'finished';

  constructor(user: User, max_players: number) {
	if (!user || !(user instanceof User)|| !max_players || max_players !== 2 && max_players !== 4) {
		throw new Error("Invalid user or max_players");
	}
	this.players.push(user);
	this.max_players = max_players;
	this.lobby_name = generateLobbyKey();
  }
}