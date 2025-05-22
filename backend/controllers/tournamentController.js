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
exports.addTournament = addTournament;
exports.getTournament = getTournament;
exports.updateTournament = updateTournament;
exports.deleteTournament = deleteTournament;
const tournament_1 = __importDefault(require("../models/tournament"));
const game_1 = __importDefault(require("../models/game"));
function addTournament(request, reply) {
    return __awaiter(this, void 0, void 0, function* () {
        const { players, date } = request.body;
        const number_of_players = players.length;
        try {
            const tournament = yield tournament_1.default.create({
                players,
                number_of_players,
                date,
            });
            reply.code(201).send({ message: 'Tournament added!', tournament });
        }
        catch (error) {
            reply.code(500).send({ error: 'Failed to add tournament', details: error });
        }
    });
}
function getTournament(request, reply) {
    return __awaiter(this, void 0, void 0, function* () {
        const { tournament_id } = request.query;
        try {
            const tournament = yield tournament_1.default.findOne({ where: { tournament_id }, include: ['games'] });
            if (tournament) {
                reply.code(200).send(tournament);
            }
            else {
                reply.code(404).send({ error: 'Tournament not found' });
            }
        }
        catch (error) {
            reply.code(500).send({ error: 'Failed to get tournament', details: error });
        }
    });
}
function updateTournament(request, reply) {
    return __awaiter(this, void 0, void 0, function* () {
        const { tournament_id, game_id } = request.body;
        try {
            const game = yield game_1.default.findOne({ where: { game_id } });
            if (!game) {
                return reply.code(404).send({ error: 'Game not found' });
            }
            const tournament = yield tournament_1.default.findOne({ where: { tournament_id }, include: ['games'] });
            if (!tournament) {
                return reply.code(404).send({ error: 'Tournament not found' });
            }
            yield tournament.addGame(game);
            if (tournament.games.length == (tournament.number_of_players - 2)) {
                tournament.winner_nickname = game.winner_nickname;
            }
            yield tournament.save();
            reply.code(200).send({ message: 'Game added to tournament', tournament });
        }
        catch (error) {
            reply.code(500).send({ error: 'Failed to update tournament', details: error });
        }
    });
}
function deleteTournament(request, reply) {
    return __awaiter(this, void 0, void 0, function* () {
        const { tournament_id } = request.query;
        try {
            const tournament = yield tournament_1.default.findOne({ where: { tournament_id } });
            if (!tournament) {
                return reply.code(404).send({ error: 'Tournament not found' });
            }
            yield tournament.destroy();
            reply.code(200).send({ message: 'Tournament deleted' });
        }
        catch (error) {
            reply.code(500).send({ error: 'Failed to delete tournament', details: error });
        }
    });
}
