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
const userController_1 = require("../controllers/userController");
const userSchema_1 = require("../schemas/userSchema");
function default_1(server) {
    return __awaiter(this, void 0, void 0, function* () {
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
                            user: userSchema_1.userSchema
                        }
                    }
                },
                tags: ['User']
            }
        }, userController_1.addUser);
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
        }, userController_1.deleteUser);
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
                        user: userSchema_1.userSchema
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
        }, userController_1.getUser);
        server.put('/update_user', {
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
                            user: userSchema_1.userSchema
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
        }, userController_1.updateUser);
    });
}
