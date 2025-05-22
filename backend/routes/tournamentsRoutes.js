"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
const tournamentController_1 = require("../controllers/tournamentController");
const tournamentSchema_1 = require("../schemas/tournamentSchema");
function default_1(server) {
    return __awaiter(this, void 0, void 0, function* () {
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
                            tournament: tournamentSchema_1.tournamentSchema
                        }
                    }
                },
                tags: ['Tournament']
            }
        }, tournamentController_1.addTournament);
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
                        tournament: tournamentSchema_1.tournamentSchema
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
        }, tournamentController_1.getTournament);
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
                            tournament_id_updated_to_new_value: { type: "boolean" }
                        }
                    }
                },
                tags: ["Tournament"]
            }
        }, tournamentController_1.updateTournament);
        server.delete('/delete_tournament', {
            schema: {
                querystring: {
                    type: "object",
                    required: ["tournament_id"],
                    properties: {
                        tournament_id: { type: "integer" }
                    }
                },
                response: {
                    200: {
                        type: "object",
                        properties: {
                            message: { type: "string" }
                        }
                    }
                },
                tags: ["Tournament"]
            }
        }, tournamentController_1.deleteTournament);
    });
}
