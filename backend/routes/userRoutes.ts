import { FastifyInstance } from "fastify";
import { addUser, deleteUser, getUser, updateUser, uploadImage, addFriend } from "../controllers/userController";
import { userSchema } from "../schemas/userSchema";
import { verifyJWT } from "../utils/jwt";

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
                    language: { type: 'string' },
                    image_url: { type: 'string' }
                }
            },
            response: {
                201: {
                    type: 'object',
                    properties: {
                        message: { type: 'string' },
                        user: userSchema,
                        token: { type: 'string' }
                    }
                }
            },
            tags: ['User']
        }
    }, addUser);

    server.delete('/delete_user', {
        preHandler: verifyJWT,
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
        preHandler: verifyJWT,
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
                        user: userSchema
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
        preHandler: verifyJWT,
        schema: {
            body: {
                type: 'object',
                required: ['nickname', 'field', 'new_value'],
                properties: {
                    nickname: { type: 'string' },
                    field: { type: 'string' },
                    new_value: { type: 'string' }
                }
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        message: { type: 'string' },
                        user: userSchema
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

    server.post('/upload_image', {
        schema: {
            consumes: ['multipart/form-data'],
            body: {
                type: 'object',
                properties: {
                    image: { type: 'string', format: 'binary' }
                },
                required: ['image']
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        imageUrl: { type: 'string' }
                    }
                }
            },
            tags: ['User']
        }
    }, uploadImage);

    server.put('/add_friend', {
        preHandler: verifyJWT,
        schema:{
            body:{
                type: 'object',
                required: ['user1', 'user2'],
                properties:{
                    user1: { type: 'string' },
                    user2: { type: 'string' },
                }
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        message: { type: 'string' },
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
    }, addFriend)
}