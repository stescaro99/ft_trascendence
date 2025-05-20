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
exports.updateStats = updateStats;
const user_1 = __importDefault(require("../models/user"));
const game_1 = __importDefault(require("../models/game"));
const stats_1 = __importDefault(require("../models/stats"));
const db_1 = __importDefault(require("../db"));
function updateStats(request, reply) {
    return __awaiter(this, void 0, void 0, function* () {
        const { nickname, game_id, result, index } = request.body;
        const transaction = yield db_1.default.transaction();
        try {
            const user = yield user_1.default.findOne({
                where: { nickname },
                include: [{ model: stats_1.default, as: 'stats' }]
            });
            if (!user) {
                yield transaction.rollback();
                return reply.code(404).send({ message: 'User not found' });
            }
            const statsArray = user.stats;
            const userStat = statsArray[index];
            if (!userStat) {
                yield transaction.rollback();
                return reply.code(404).send({ message: 'Stats not found for given index' });
            }
            const game = yield game_1.default.findOne({ where: { game_id } });
            if (!game) {
                yield transaction.rollback();
                return reply.code(404).send({ message: 'Game not found' });
            }
            yield userStat.addGame(game, { transaction });
            userStat.number_of_games = (userStat.number_of_games || 0) + 1;
            switch (result) {
                case 0:
                    userStat.number_of_losses = (userStat.number_of_losses || 0) + 1;
                    break;
                case 1:
                    userStat.number_of_draws = (userStat.number_of_draws || 0) + 1;
                    break;
                case 2:
                    userStat.number_of_wins = (userStat.number_of_wins || 0) + 1;
                    break;
                default:
                    yield transaction.rollback();
                    return reply.code(400).send({ message: 'Invalid result value' });
            }
            if (game.player1_nickname === nickname) {
                userStat.number_of_points = (userStat.number_of_points || 0) + (game.player1_score || 0);
            }
            else if (game.player2_nickname === nickname) {
                userStat.number_of_points = (userStat.number_of_points || 0) + (game.player2_score || 0);
            }
            else if (game.player3_nickname === nickname) {
                userStat.number_of_points = (userStat.number_of_points || 0) + (game.player3_score || 0);
            }
            else {
                userStat.number_of_points = (userStat.number_of_points || 0) + (game.player4_score || 0);
            }
            userStat.average_score = (userStat.number_of_points || 0) / userStat.number_of_games;
            userStat.percentage_wins = (userStat.number_of_wins || 0) / userStat.number_of_games;
            userStat.percentage_losses = (userStat.number_of_losses || 0) / userStat.number_of_games;
            userStat.percentage_draws = (userStat.number_of_draws || 0) / userStat.number_of_games;
            yield userStat.save();
            yield user.save();
            yield transaction.commit();
            reply.code(200).send({ message: 'Stats updated!', stats: userStat });
        }
        catch (error) {
            console.error('Error updating stats:', error);
            reply.code(500).send({ message: 'Failed to update stats', error });
        }
    });
}
