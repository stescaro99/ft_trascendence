"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.statsSchema = void 0;
const gameSchema_1 = require("./gameSchema");
exports.statsSchema = {
    type: 'object',
    properties: {
        nickname: { type: 'string' },
        games: {
            type: 'array',
            items: gameSchema_1.gameSchema
        },
        number_of_games: { type: 'integer' },
        number_of_wins: { type: 'integer' },
        number_of_losses: { type: 'integer' },
        number_of_draws: { type: 'integer' },
        number_of_points: { type: 'integer' },
        average_score: { type: 'number' },
        percentage_wins: { type: 'number' },
        percentage_losses: { type: 'number' },
        percentage_draws: { type: 'number' },
    }
};
