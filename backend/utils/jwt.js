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
exports.verifyJWT = verifyJWT;
exports.createJWT = createJWT;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function verifyJWT(request, reply) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const authHeader = request.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return reply.code(401).send({ error: 'Missing or invalid token' });
            }
            const token = authHeader.split(' ')[1];
            const key = process.env.JWT_SECRET || 'default_key';
            const decoded = jsonwebtoken_1.default.verify(token, key);
            request.user = decoded;
        }
        catch (err) {
            return reply.code(401).send({ error: 'Invalid or expired token' });
        }
    });
}
function createJWT(payload, expiresIn) {
    const key = process.env.JWT_SECRET || 'default_key';
    const options = expiresIn ? { expiresIn } : {};
    return jsonwebtoken_1.default.sign(payload, key, options);
}
