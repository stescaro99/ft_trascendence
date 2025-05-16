import { FastifyInstance } from "fastify";
import { addUser, deleteUser, getUser, updateUser } from "../controllers/userController";

export default async function (server: FastifyInstance) {
    server.post('/add_user', {
        schema: {
            body: {
                type: 'object',
                required: ['name', 'surname', 'nickname', 'email', 'password'],
                properties: {
                    name: { type: 'string' },
                    surname: { type: 'string' },
                    nickname: { type: 'string' },
                    email: { type: 'string' },
                    password: { type: 'string' },
                    image_url: { type: 'string' }
                }
            },
            response: {
                201: {
                    type: 'object',
                    properties: {
                        message: { type: 'string' },
                        user: { type: 'object' }
                    }
                }
            },
            tags: ['User']
        }
    }, addUser);

    server.delete('/delete_user', {
        schema: {
            body: {
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
                        message: { type: 'string' }
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
    }, deleteUser);

    server.get('/get_user', {
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
                        user: { type: 'object' }
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
    }, getUser);

    server.put('/update_user', {
        schema: {
            body: {
                type: 'object',
                required: ['nickname'],
                properties: {
                    nickname: { type: 'string' },
                    name: { type: 'string' },
                    surname: { type: 'string' },
                    email: { type: 'string' },
                    password: { type: 'string' },
                    image_url: { type: 'string' }
                }
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        message: { type: 'string' },
                        user: { type: 'object' }
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
    }, updateUser);
}