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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addUser = addUser;
exports.deleteUser = deleteUser;
exports.getUser = getUser;
exports.updateUser = updateUser;
exports.uploadImage = uploadImage;
exports.addFriend = addFriend;
const user_1 = __importDefault(require("../models/user"));
const stats_1 = __importDefault(require("../models/stats"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
function addUser(request, reply) {
    return __awaiter(this, void 0, void 0, function* () {
        const { name, surname, nickname, email, password, image_url } = request.body;
        try {
            const hashedPassword = yield bcrypt_1.default.hash(password, 10);
            const user = yield user_1.default.create({
                name,
                surname,
                nickname,
                email,
                password: hashedPassword,
                image_url,
            });
            const stats_pong = yield stats_1.default.create({ nickname: nickname });
            const stats_game2 = yield stats_1.default.create({ nickname: nickname });
            yield user.setStats([stats_pong, stats_game2]);
            yield user.reload({ include: [{ model: stats_1.default, as: 'stats' }] });
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
            yield stats_1.default.destroy({ where: { nickname: nickname } });
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
            const user = yield user_1.default.findOne({
                where: { nickname: nickname },
                include: [{ model: stats_1.default, as: 'stats' }],
            });
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
        const { nickname, field, new_value } = request.body;
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
                        if (!user.tfa_code || user.password === '')
                            reply.code(400).send({ error: 'Cannot change email after Google Signup' });
                        user.email = new_value;
                        break;
                    case 'password':
                        if (!user.tfa_code || user.password === '')
                            reply.code(400).send({ error: 'Cannot change password after Google Signup' });
                        user.password = yield bcrypt_1.default.hash(new_value, 10);
                        break;
                    case 'language':
                        user.language = new_value;
                        break;
                    case 'image_url':
                        user.image_url = new_value;
                        break;
                    case 'active':
                        user.active = false;
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
function uploadImage(request, reply) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, e_1, _b, _c;
        const parts = request.parts ? request.parts() : [];
        try {
            for (var _d = true, parts_1 = __asyncValues(parts), parts_1_1; parts_1_1 = yield parts_1.next(), _a = parts_1_1.done, !_a; _d = true) {
                _c = parts_1_1.value;
                _d = false;
                const part = _c;
                if (part.file && part.fieldname === 'image') {
                    const filePart = part;
                    const uploadDir = path_1.default.join(__dirname, '../../uploads');
                    if (!fs_1.default.existsSync(uploadDir)) {
                        fs_1.default.mkdirSync(uploadDir, { recursive: true });
                    }
                    const filename = `${Date.now()}_${filePart.filename}`;
                    const filepath = path_1.default.join(uploadDir, filename);
                    const writeStream = fs_1.default.createWriteStream(filepath);
                    yield filePart.file.pipe(writeStream);
                    const imageUrl = `${request.protocol}://${request.hostname}:2807/uploads/${filename}`;
                    return reply.code(200).send({ imageUrl });
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (!_d && !_a && (_b = parts_1.return)) yield _b.call(parts_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        reply.code(400).send({ error: 'No image uploaded' });
    });
}
function addFriend(request, reply) {
    return __awaiter(this, void 0, void 0, function* () {
        const { user1, user2 } = request.body;
        try {
            const first_user = yield user_1.default.findOne({ where: { nickname: user1 } });
            const second_user = yield user_1.default.findOne({ where: { nickname: user2 } });
            if (!first_user || !second_user) {
                return reply.code(404).send({ error: 'User not found' });
            }
            const friends1 = new Set(first_user.friends || []);
            const friends2 = new Set(second_user.friends || []);
            const requests2 = new Set(second_user.fr_request || []);
            const requests1 = new Set(first_user.fr_request || []);
            if (friends1.has(user2) && friends2.has(user1)) {
                friends1.delete(user2);
                friends2.delete(user1);
                first_user.friends = Array.from(friends1);
                second_user.friends = Array.from(friends2);
                yield first_user.save();
                yield second_user.save();
                return reply.send({ message: 'Friendship removed' });
            }
            if (requests1.has(user2)) {
                requests1.delete(user2);
                friends1.add(user2);
                friends2.add(user1);
                first_user.fr_request = Array.from(requests1);
                first_user.friends = Array.from(friends1);
                second_user.friends = Array.from(friends2);
                yield first_user.save();
                yield second_user.save();
                return reply.send({ message: 'Friendship established' });
            }
            if (!requests2.has(user1)) {
                requests2.add(user1);
                second_user.fr_request = Array.from(requests2);
                yield second_user.save();
                return reply.send({ message: 'Friend request sent' });
            }
            return reply.code(409).send({ error: "Friend request already sent" });
        }
        catch (err) {
            console.error(err);
            return reply.code(500).send({ error: 'Internal server error' });
        }
    });
}
