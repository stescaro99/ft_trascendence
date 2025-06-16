import { FastifyInstance } from "fastify";
import { isAvailable, login, generate2FA, verify2FA, GoogleOAuthCallback } from "../controllers/authController";
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
            tags: ['Authentication']
        }
    }, isAvailable);

    server.post('/login', {
        schema: {
            body: {
                type: 'object',
                required: ['nickname', 'password'],
                properties: {
                    nickname: { type: 'string' },
                    password: { type: 'string' },
                }
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        require2FA: { type: 'boolean' },
                        message: { type: 'string' },
                    }
                },
                401: {
                    type: 'object',
                    properties: {
                        error: { type: 'string' }
                    }
                }
            },
            tags: ['Authentication']
        }
    }, login);

    server.post('/generate_2FA', {
        schema: {
            body: {
                type: 'object',
                properties: {
                    nickname: { type: 'string' },
                    password: { type: 'string' }
                },
                required: [],
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        message: { type: 'string' },
                        qrCode: { type: 'string' }
                    }
                },
                401: {
                    type: 'object',
                    properties: {
                        error: { type: 'string' }
                    }
                },
                404: {
                    type: 'object',
                    properties: {
                        error: { type: 'string' }
                    }
                }
            },
            tags: ['Authentication']
        }
    }, generate2FA);

    server.post('/verify_2FA', {
        schema: {
            body: {
                type: 'object',
                required: ['nickname', 'token2FA'],
                properties: {
                    nickname: { type: 'string' },
                    token2FA: { type: 'string' }  
                }
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        message: { type: 'string' },
                        token: { type: 'string' },
                        user: userSchema,
                    }
                },
                401: {
                    type: 'object',
                    properties: {
                        error: { type: 'string' }
                    }
                },
                404: {
                    type: 'object',
                    properties: {
                        error: { type: 'string' }
                    }
                },
            },
            tags: ['Authentication']
        }
    }, verify2FA);

    server.get('/google/callback', GoogleOAuthCallback);
}


