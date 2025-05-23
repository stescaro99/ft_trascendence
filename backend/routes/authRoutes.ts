import { FastifyInstance } from "fastify";
import { isAvailable, login, generate2FA, verify2FA } from "../controllers/authController";
import { userSchema } from "../schemas/userSchema";

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

    server.post('/login', {
        schema: {
            body: {
                type: 'object',
                required: ['nickname', 'password', 'token2FA'],
                properties: {
                    nickname: { type: 'string' },
                    password: { type: 'string' },
                    token2FA: { type: 'string' }
                }
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        message: { type: 'string' },
                        user: userSchema,
                        token: { type: 'string' },
                        qr_code: { type: 'string' },
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

    server.get('/2fa/generate', {
        schema: {
            querystring: {
                type: 'object',
                required: ['nickname'],
                properties: {
                    nickname: { type: 'string' }
                }
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        message: { type: 'string' },
                        secret: { type: 'string' }
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
    }, generate2FA);

    server.post('/2fa/verify', {
        schema: {
            body: {
                type: 'object',
                required: ['nickname', 'token'],
                properties: {
                    nickname: { type: 'string' },
                    token: { type: 'string' }  
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
            tags: ['User']
        }
    }, verify2FA);
}


