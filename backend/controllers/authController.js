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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAvailable = isAvailable;
exports.login = login;
const user_1 = __importDefault(require("../models/user"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jwt_1 = require("../utils/jwt");
function isAvailable(request, reply) {
    return __awaiter(this, void 0, void 0, function* () {
        const { field, value } = request.query;
        try {
            switch (field) {
                case 'nickname':
                    const user = yield user_1.default.findOne({ where: { nickname: value } });
                    if (user) {
                        reply.code(200).send({ available: false });
                    }
                    else {
                        reply.code(200).send({ available: true });
                    }
                    break;
                case 'email':
                    const emailUser = yield user_1.default.findOne({ where: { email: value } });
                    if (emailUser) {
                        reply.code(200).send({ available: false });
                    }
                    else {
                        reply.code(200).send({ available: true });
                    }
                    break;
                default:
                    reply.code(400).send({ error: 'Invalid field' });
                    return;
            }
        }
        catch (error) {
            reply.code(500).send({ error: 'Failed to check availability', details: error });
        }
    });
}
function login(request, reply) {
    return __awaiter(this, void 0, void 0, function* () {
        const { nickname, password } = request.query;
        try {
            const user = yield user_1.default.findOne({ where: { nickname: nickname } });
            if (user && (yield bcrypt_1.default.compare(password, user.password))) {
                const payload = { id: user.id, nickname: user.nickname };
                const token = (0, jwt_1.createJWT)(payload, '3h');
                reply.code(200).send({ message: 'Login successful', token, user });
            }
            else {
                reply.code(401).send({ error: 'Invalid credentials' });
            }
        }
        catch (error) {
            reply.code(500).send({ error: 'Failed to login', details: error });
        }
    });
}
