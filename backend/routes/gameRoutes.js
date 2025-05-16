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
const gameController_1 = require("../controllers/gameController");
const gameSchema_1 = require("../schemas/gameSchema");
function default_1(server) {
    return __awaiter(this, void 0, void 0, function* () {
        server.post('/add_game', {
            schema: {
                body: {
                    type: 'object',
                    required: ['player1_nickname', 'player2_nickname', 'date'],
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
                            game: gameSchema_1.gameSchema
                        }
                    }
                },
                tags: ['Game']
            }
        }, gameController_1.addGame);
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
                        type: 'object',
                        properties: {
                            game: gameSchema_1.gameSchema
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
        }, gameController_1.getGame);
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
                            game: gameSchema_1.gameSchema
                        }
                    }
                },
                tags: ['Game']
            }
        }, gameController_1.updateGame);
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
        }, gameController_1.deleteGame);
    });
}
