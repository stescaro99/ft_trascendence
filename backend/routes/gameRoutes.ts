import { FastifyInstance } from "fastify";
import { addGame, getGame, updateGame, deleteGame } from "../controllers/gameController";
import { gameSchema } from "../schemas/gameSchema";
import { verifyJWT } from "../utils/jwt";

export default async function (server: FastifyInstance) {
    server.post('/add_game', {
        preHandler: verifyJWT,
        schema: {
            body: {
                type: 'object',
                required: ['players'],
                properties: {
                    players: {
                        type: 'array',
                        items: { type: 'string' },
                        minItems: 2,
                        maxItems: 4
                    },
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
        preHandler: verifyJWT,
        schema: {
            body: {
                type: 'object',
                required: ['game_id', 'field', 'new_value'],
                properties: {
                    game_id: { type: 'integer' },
                    field: { type: 'string', enum: ['1_scores', '2_scores', 'winner_nickname'] },
                    new_value: {}
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
        preHandler: verifyJWT,
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
