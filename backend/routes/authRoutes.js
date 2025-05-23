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
const authController_1 = require("../controllers/authController");
const userSchema_1 = require("../schemas/userSchema");
function default_1(server) {
    return __awaiter(this, void 0, void 0, function* () {
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
        }, authController_1.isAvailable);
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
                            user: userSchema_1.userSchema,
                            token: { type: 'string' },
                            qr_code: { type: 'string' },
                            secret: { type: 'string' }
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
        }, authController_1.login);
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
        }, authController_1.generate2FA);
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
        }, authController_1.verify2FA);
    });
}
