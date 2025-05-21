import { FastifyInstance } from "fastify";
import { addGame, getGame, updateGame, deleteGame } from "../controllers/gameController";
import { gameSchema } from "../schemas/gameSchema";

export default async function (server: FastifyInstance) {
    server.post('/add_game', {
        schema: {
            body: {
                type: 'object',
                required: ['player1_nickname', 'player2_nickname'],
                properties: {
                    player1_nickname: { type: 'string' },
                    player2_nickname: { type: 'string' },
                    player3_nickname: { type: 'string' },
                    player4_nickname: { type: 'string' },
                    date: { type: 'string', format: 'date-time' }
                }
            },
            response: {
                201: {
                    type: 'object',
                    properties: {
                        message: { type: 'string' },
                        game: gameSchema
                    }
                }
            },
            tags: ['Game']
        }
    }, addGame);

    server.get('/get_game', {
        schema: {
            querystring: {
                type: 'object',
                required: ['game_id'],
                properties: {
                    game_id: { type: 'integer' }
                }
            },
            response: {
                200: {
                    game: gameSchema
                },
                404: {
                    type: 'object',
                    properties: {
                        error: { type: 'string' }
                    }
                },
            },
            tags: ['Game']
        }
    }, getGame);

    server.put('/update_game', {
        schema: {
            body: {
                type: 'object',
                required: ['game_id', 'field', 'new_value'],
                properties: {
                    game_id: { type: 'integer' },
                    field: { type: 'string' },
                    new_value: { type: 'string' }
                }
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        message: { type: 'string' },
                        game: gameSchema
                    }
                }
            },
            tags: ['Game']
        }
    }, updateGame);

    server.delete('/delete_game', {
        schema: {
            querystring: {
                type: 'object',
                required: ['game_id'],
                properties: {
                    game_id: { type: 'integer' }
                }
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        message: { type: 'string' }
                    }
                },
                404: {
                    type: 'object',
                    properties: {
                        error: { type: 'string' }
                    }
                },
            },
            tags: ['Game']
        }
    }, deleteGame);
}
