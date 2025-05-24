"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userSchema = void 0;
const statsSchema_1 = require("./statsSchema");
exports.userSchema = {
    type: 'object',
    properties: {
        user_id: { type: 'integer' },
        //name: { type: 'string' },
        //surname: { type: 'string' },
        nickname: { type: 'string' },
        //email: { type: 'string' },
        language: { type: 'string' },
        image_url: { type: 'string' },
        stats: {
            type: 'array',
            items: statsSchema_1.statsSchema
        }
    }
};
