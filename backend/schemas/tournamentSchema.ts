import { gameSchema } from "./gameSchema";

export const tournamentSchema = {
    type: 'object',
    properties: {
        tournament_id: { type: 'integer' },
        players: { type: 'array', items: { type: 'string' } },
        number_of_players: { type: 'integer' },
        winner_nickname: { type: 'string' },
        date: { type: 'string', format: 'date-time' },
        games: {
            type: 'array',
            items: gameSchema
        }
    }
};