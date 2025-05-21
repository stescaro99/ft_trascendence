import { FastifyInstance } from "fastify";
import { updateStats } from "../controllers/statsController";
import { statsSchema } from "../schemas/statsSchema";
import { gameSchema } from "../schemas/gameSchema";

export default async function (server: FastifyInstance) {
    server.put('/update_stats', {
        schema: {
            body: {
                type: 'object',
                required: ['nickname', 'game_id', 'result', 'index'],
                properties: {
                    nickname: { type: 'string' },
                    game_id: { type: 'integer' },
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
