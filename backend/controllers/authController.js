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
exports.generate2FA = generate2FA;
exports.verify2FA = verify2FA;
exports.login = login;
exports.isAvailable = isAvailable;
const user_1 = __importDefault(require("../models/user"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jwt_1 = require("../utils/jwt");
const speakeasy_1 = __importDefault(require("speakeasy"));
const qrcode_1 = __importDefault(require("qrcode"));
function generate2FA(request, reply) {
    return __awaiter(this, void 0, void 0, function* () {
        const { nickname } = request.body;
        try {
            const user = yield user_1.default.findOne({ where: { nickname } });
            if (!user) {
                reply.code(404).send({ error: 'User not found' });
                return;
            }
            if (user.tfa_code) {
                reply.code(400).send({ error: '2FA already enabled' });
                return;
            }
            const issuer = 'FT_TRASCENDENCE';
            const secret = speakeasy_1.default.generateSecret({ name: nickname, issuer });
            user.tfa_code = secret.base32;
            yield user.save();
            const label = encodeURIComponent(`${issuer}:${nickname}`);
            const base32 = secret.base32;
            const otpauth_url = `otpauth://totp/${label}?secret=${base32}&issuer=${issuer}`;
            const qrCode = yield qrcode_1.default.toDataURL(otpauth_url);
            reply.code(200).send({
                message: '2FA setup required. Scan the QR code with Google Authenticator.',
                qrCode,
            });
        }
        catch (error) {
            reply.code(500).send({ error: 'Failed to generate 2FA secret', details: error });
        }
    });
}
function verify2FA(request, reply) {
    return __awaiter(this, void 0, void 0, function* () {
        const { nickname, token2FA } = request.body;
        try {
            const user = yield user_1.default.findOne({ where: { nickname } });
            if (!user || !user.tfa_code) {
                reply.code(404).send({ error: 'User not found or 2FA not enabled' });
                return;
            }
            const verified = speakeasy_1.default.totp.verify({
                secret: user.tfa_code,
                encoding: 'base32',
                token: token2FA,
                window: 2
            });
            if (verified) {
                const payload = { id: user.id, nickname: user.nickname };
                const jwtToken = (0, jwt_1.createJWT)(payload);
                reply.code(200).send({ message: '2FA verified successfully, you are now logged in', token: jwtToken, user });
            }
            else {
                reply.code(401).send({ error: 'Invalid 2FA token' });
            }
        }
        catch (error) {
            reply.code(500).send({ error: 'Failed to verify 2FA', details: error });
        }
    });
}
function login(request, reply) {
    return __awaiter(this, void 0, void 0, function* () {
        const { nickname, password } = request.body;
        try {
            const user = yield user_1.default.findOne({ where: { nickname } });
            if (!user || !(yield bcrypt_1.default.compare(password, user.password))) {
                reply.code(401).send({ error: 'Invalid credentials' });
                return;
            }
            if (!user.tfa_code) {
                reply.code(403).send({ error: '2FA not enabled. Complete 2FA setup.' });
                return;
            }
            reply.code(200).send({ require2FA: true, message: '2FA required' });
        }
        catch (error) {
            reply.code(500).send({ error: 'Failed to login', details: error });
        }
    });
}
function isAvailable(request, reply) {
    return __awaiter(this, void 0, void 0, function* () {
        const { field, value } = request.query;
        try {
            switch (field) {
                case 'nickname':
                    const user = yield user_1.default.findOne({ where: { nickname: value } });
                    reply.code(200).send({ available: !user });
                    break;
                case 'email':
                    const emailUser = yield user_1.default.findOne({ where: { email: value } });
                    reply.code(200).send({ available: !emailUser });
                    break;
                default:
                    reply.code(400).send({ error: 'Invalid field' });
            }
        }
        catch (error) {
            reply.code(500).send({ error: 'Failed to check availability', details: error });
        }
    });
}
