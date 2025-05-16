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
exports.addUser = addUser;
exports.deleteUser = deleteUser;
exports.getUser = getUser;
exports.updateUser = updateUser;
const user_1 = __importDefault(require("../models/user"));
function addUser(request, reply) {
    return __awaiter(this, void 0, void 0, function* () {
        const { name, surname, nickname, email, password, image_url } = request.body;
        try {
            const user = yield user_1.default.create({
                name,
                surname,
                nickname,
                email,
                password,
                image_url,
            });
            reply.code(201).send({ message: 'User added!', user });
        }
        catch (error) {
            reply.code(500).send({ error: 'Failed to add user', details: error });
        }
    });
}
function deleteUser(request, reply) {
    return __awaiter(this, void 0, void 0, function* () {
        const { nickname } = request.body;
        try {
            const user = yield user_1.default.destroy({ where: { nickname: nickname } });
            if (user) {
                reply.code(200).send({ message: 'User deleted!' });
            }
            else {
                reply.code(404).send({ error: 'User not found' });
            }
        }
        catch (error) {
            reply.code(500).send({ error: 'Failed to delete user', details: error });
        }
    });
}
function getUser(request, reply) {
    return __awaiter(this, void 0, void 0, function* () {
        const { nickname } = request.query;
        try {
            const user = yield user_1.default.findOne({ where: { nickname: nickname } });
            if (user) {
                reply.code(200).send(user);
            }
            else {
                reply.code(404).send({ error: 'User not found' });
            }
        }
        catch (error) {
            reply.code(500).send({ error: 'Failed to get user', details: error });
        }
    });
}
function updateUser(request, reply) {
    return __awaiter(this, void 0, void 0, function* () {
        const { field } = request.query;
        const { new_value } = request.body;
        const { nickname } = request.body;
        try {
            const user = yield user_1.default.findOne({ where: { nickname: nickname } });
            if (user) {
                switch (field) {
                    case 'name':
                        user.name = new_value;
                        break;
                    case 'surname':
                        user.surname = new_value;
                        break;
                    case 'nickname':
                        user.nickname = new_value;
                        break;
                    case 'email':
                        user.email = new_value;
                        break;
                    case 'password':
                        user.password = new_value;
                        break;
                    case 'image_url':
                        user.image_url = new_value;
                        break;
                    default:
                        reply.code(400).send({ error: 'Invalid field' });
                        return;
                }
                yield user.save();
                reply.code(200).send({ message: 'User updated!', user });
            }
            else {
                reply.code(404).send({ error: 'User not found' });
            }
        }
        catch (error) {
            reply.code(500).send({ error: 'Failed to update user', details: error });
        }
    });
}
