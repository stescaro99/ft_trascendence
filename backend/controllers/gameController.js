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
exports.addGame = addGame;
exports.getGame = getGame;
exports.updateGame = updateGame;
exports.deleteGame = deleteGame;
const game_1 = __importDefault(require("../models/game"));
function addGame(request, reply) {
    return __awaiter(this, void 0, void 0, function* () {
        const { player1_nickname, player2_nickname, player3_nickname, player4_nickname, date } = request.body;
        try {
            const game = yield game_1.default.create({
                player1_nickname,
                player2_nickname,
                player3_nickname,
                player4_nickname,
                date,
            });
            reply.code(201).send({ message: 'Game added!', game: game });
        }
        catch (error) {
            reply.code(500).send({ error: 'Failed to add game', details: error });
        }
    });
}
function getGame(request, reply) {
    return __awaiter(this, void 0, void 0, function* () {
        const { game_id } = request.query;
        try {
            const game = yield game_1.default.findOne({ where: { game_id: game_id } });
            if (game) {
                reply.code(200).send(game);
            }
            else {
                reply.code(404).send({ error: 'Game not found' });
            }
        }
        catch (error) {
            reply.code(500).send({ error: 'Failed to get game', details: error });
        }
    });
}
function updateGame(request, reply) {
    return __awaiter(this, void 0, void 0, function* () {
        const { field } = request.body;
        const { new_value } = request.body;
        const { game_id } = request.body;
        try {
            const game = yield game_1.default.findOne({ where: { game_id: game_id } });
            if (!game) {
                reply.code(404).send({ error: 'Game not found' });
                return;
            }
            switch (field) {
                case 'player1_score':
                    yield (game === null || game === void 0 ? void 0 : game.update({ player1_score: Number(new_value) }));
                    break;
                case 'player2_score':
                    yield (game === null || game === void 0 ? void 0 : game.update({ player2_score: Number(new_value) }));
                    break;
                case 'player3_score':
                    yield (game === null || game === void 0 ? void 0 : game.update({ player3_score: Number(new_value) }));
                    break;
                case 'player4_score':
                    yield (game === null || game === void 0 ? void 0 : game.update({ player4_score: Number(new_value) }));
                    break;
                case 'winner_nickname':
                    yield (game === null || game === void 0 ? void 0 : game.update({ winner_nickname: new_value }));
                    yield (game === null || game === void 0 ? void 0 : game.update({ game_status: 'finished' }));
                    break;
                default:
                    reply.code(400).send({ error: 'Invalid field' });
                    return;
            }
            yield game.save();
            reply.code(200).send({ message: 'Game updated!', game });
        }
        catch (error) {
            reply.code(500).send({ error: 'Failed to update game', details: error });
        }
    });
}
function deleteGame(request, reply) {
    return __awaiter(this, void 0, void 0, function* () {
        const { game_id } = request.query;
        try {
            const game = yield game_1.default.findOne({ where: { game_id: game_id } });
            if (game) {
                yield game.destroy();
                reply.code(200).send({ message: 'Game deleted!' });
            }
            else {
                reply.code(404).send({ error: 'Game not found' });
            }
        }
        catch (error) {
            reply.code(500).send({ error: 'Failed to delete game', details: error });
        }
    });
}
