import { FastifyInstance } from "fastify";
import { addTournament, getTournament, updateTournament, deleteTournament } from "../controllers/tournamentController";
import { tournamentSchema } from "../schemas/tournamentSchema";

export default async function (server: FastifyInstance) {
    server.post('/add_tournament', {
        schema: {
            body: {
                type: 'object',
                required: ['players'],
                properties: {
                    players: {
                        type: 'array',
                        items: { type: 'string' },
                        minItems: 4,
                        maxItems: 16,
                        uniqueItems: true
                    },
                    date: { type: 'string', format: 'date-time' }
                }
            },
            response: {
                201: {
                    type: 'object',
                    properties: {
                        message: { type: 'string' },
                        tournament: tournamentSchema
                    }
                }
            },
            tags: ['Tournament']
        }
    }, addTournament);

    server.get('/get_tournament', {
        schema: {
            querystring: {
                type: 'object',
                required: ['tournament_id'],
                properties: {
                    tournament_id: { type: 'integer' }
                }
            },
            response: {
                200: {
                    tournament: tournamentSchema
                },
                404: {
                    type: 'object',
                    properties: {
                        error: { type: 'string' }
                    }
                },
            },
            tags: ['Tournament']
        }
    }, getTournament);

    server.put('/update_tournament', {
        schema: {
            body: {
                type: 'object',
                required: ['tournament_id', 'game_id'],
                properties: {
                    tournament_id: { type: 'integer' },
                    game_id: { type: 'integer' },
                }
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        message: { type: 'string' },
                        tournament_id_updated_to_new_value : {type : "boolean"}
                    }
                }
            },
            tags : ["Tournament"]
        }
    }, updateTournament);

    server.delete('/delete_tournament', {
        schema :{
            querystring :{
                type : "object",
                required : ["tournament_id"],
                properties :{
                    tournament_id :{type : "integer"}
                }
            },
            response:{
                200:{
                    type :"object",
                    properties:{
                        message:{type :"string"}
                    }
                }
            },
            tags:["Tournament"]
        }
    }, deleteTournament);
}
