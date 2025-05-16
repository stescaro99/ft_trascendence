"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userSchema = void 0;
exports.userSchema = {
    type: 'object',
    properties: {
        user_id: { type: 'integer' },
        name: { type: 'string' },
        surname: { type: 'string' },
        nickname: { type: 'string' },
        email: { type: 'string' },
        password: { type: 'string' },
        image_url: { type: 'string' }
    }
};
