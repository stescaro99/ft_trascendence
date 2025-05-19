import { FastifyInstance } from "fastify";
import { updateStats } from "../controllers/statsController";
import { statsSchema } from "../schemas/statsSchema";
import { gameSchema } from "../schemas/gameSchema";

export default async function (server: FastifyInstance) {
    server.put('/update_stats', {
        schema: {
            body: {
                type: 'object',
                required: ['nickname', 'game', 'result', 'index'],
                properties: {
                    nickname: { type: 'string' },
                    game: gameSchema,
                    result: { type : 'integer' },
                    index: { type : 'integer' }
                },
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        message: { type: 'string' },
                        stats: statsSchema,
                    },
                },
            },
            tags: ['Stats']
        },
    }, updateStats)
};
