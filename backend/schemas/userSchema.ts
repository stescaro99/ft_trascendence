import { statsSchema } from "./statsSchema";

export const userSchema = {
    type: 'object',
    properties: {
        user_id: { type: 'integer' },
        name: { type: 'string' },
        surname: { type: 'string' },
        nickname: { type: 'string' },
        email: { type: 'string' },
        password: { type: 'string' },
        image_url: { type: 'string' },
        stats: {
            type: 'array',
            items: statsSchema
        }
    }
};