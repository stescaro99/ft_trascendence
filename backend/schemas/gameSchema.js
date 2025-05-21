"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gameSchema = void 0;
exports.gameSchema = {
    type: 'object',
    properties: {
        game_id: { type: 'integer' },
        game_status: { type: 'string', enum: ['pending', 'finished'] },
        player1_nickname: { type: 'string' },
        player2_nickname: { type: 'string' },
        player3_nickname: { type: 'string' },
        player4_nickname: { type: 'string' },
        player1_score: { type: 'integer' },
        player2_score: { type: 'integer' },
        player3_score: { type: 'integer' },
        player4_score: { type: 'integer' },
        winner_nickname: { type: 'string' },
        date: { type: 'string', format: 'date-time' }
    }
};
