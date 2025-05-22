import { FastifyInstance } from "fastify";
import { isAvailable, login } from "../controllers/authController";
import { userSchema } from "../schemas/userSchema";
import jwt from 'jsonwebtoken';

export default async function (server: FastifyInstance) {
    server.get('/available_field', {
        schema: {
            querystring: {
                type: 'object',
                required: ['field', 'value'],
                properties: {
                    field: { type: 'string' },
                    value: { type: 'string' }
                }
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        available: { type: 'boolean' },
                    }
                },
                404: {
                    type: 'object',
                    properties: {
                        error: { type: 'string' }
                    }
                }
            },
            tags: ['User']
        }
    }, isAvailable);

    server.get('/login', {
        schema: {
            querystring: {
                type: 'object',
                required: ['nickname', 'password'],
                properties: {
                    nickname: { type: 'string' },
                    password: { type: 'string' }
                }
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        message: { type: 'string' },
                        user: userSchema,
                        token: { type: 'string' }
                    }
                },
                401: {
                    type: 'object',
                    properties: {
                        error: { type: 'string' }
                    }
                }
            },
            tags: ['User']
        }
    }, login);
}


