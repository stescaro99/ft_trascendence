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
        const { players, date } = request.body;
        if (!Array.isArray(players) || (players.length !== 2 && players.length !== 4)) {
            return reply.code(400).send({ error: 'Players must be an array of 2 or 4 nicknames' });
        }
        try {
            const game = yield game_1.default.create({
                players,
                scores: [0, 0],
                date,
            });
            reply.code(201).send({ message: 'Game added!', game });
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
            const game = yield game_1.default.findOne({ where: { game_id } });
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
        const { game_id, field, new_value } = request.body;
        try {
            const game = yield game_1.default.findOne({ where: { game_id } });
            if (!game) {
                return reply.code(404).send({ error: 'Game not found' });
            }
            switch (field) {
                case '1_scores':
                    yield (game === null || game === void 0 ? void 0 : game.update({ scores: [Number(new_value), game.scores[1]] }));
                    break;
                case '2_scores':
                    yield (game === null || game === void 0 ? void 0 : game.update({ scores: [game.scores[0], Number(new_value)] }));
                    break;
                case 'winner_nickname':
                    yield (game === null || game === void 0 ? void 0 : game.update({ winner_nickname: new_value }));
                    yield (game === null || game === void 0 ? void 0 : game.update({ game_status: 'finished' }));
                    break;
                default:
                    return reply.code(400).send({ error: 'Invalid field' });
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
            const game = yield game_1.default.findOne({ where: { game_id } });
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
