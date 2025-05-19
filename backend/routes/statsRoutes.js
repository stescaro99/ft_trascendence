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
const statsController_1 = require("../controllers/statsController");
const statsSchema_1 = require("../schemas/statsSchema");
const gameSchema_1 = require("../schemas/gameSchema");
function default_1(server) {
    return __awaiter(this, void 0, void 0, function* () {
        server.put('/update_stats', {
            schema: {
                body: {
                    type: 'object',
                    required: ['nickname', 'game', 'result', 'index'],
                    properties: {
                        nickname: { type: 'string' },
                        game: gameSchema_1.gameSchema,
                        result: { type: 'integer' },
                        index: { type: 'integer' }
                    },
                },
                response: {
                    200: {
                        type: 'object',
                        properties: {
                            message: { type: 'string' },
                            stats: statsSchema_1.statsSchema,
                        },
                    },
                },
                tags: ['Stats']
            },
        }, statsController_1.updateStats);
    });
}
;
