export const gameSchema = {
	type: 'object',
	properties: {
		game_id: { type: 'integer' },
		game_status: { type: 'string', enum: ['pending', 'finished'] },
		players: {
			type: 'array',
			items: { type: 'string' },
			minItems: 2,
			maxItems: 4
		},
		scores: {
			type: 'array',
			items: { type: 'integer' },
			minItems: 2,
			maxItems: 2
		},
		winner_nickname: { type: 'string' },
		date: { type: 'string', format: 'date-time' }
	}
};