import { FastifyRequest, FastifyReply } from 'fastify';
import User from '../models/user';
import Game from '../models/game';
import Stats from '../models/stats';
import sequelize from '../db';

export async function updateStats(request: FastifyRequest, reply: FastifyReply) {
    const { nickname, game_id, result, index } = request.body as { 
        nickname: string; 
        game_id: number;
        result: number;
        index: number;
    };

    const transaction = await sequelize.transaction();
    try {
        const user = await User.findOne({ 
            where: { nickname },
            include: [{ model: Stats, as: 'stats' }]
        });
        if (!user) {
            await transaction.rollback();
            return reply.code(404).send({ message: 'User not found' });
        }

        const statsArray = user.stats as Stats[];
        const userStat = statsArray[index];
        if (!userStat) {
            await transaction.rollback();
            return reply.code(404).send({ message: 'Stats not found for given index' });
        }
        const game = await Game.findOne({ where: { game_id } });
        if (!game) {
            await transaction.rollback();
            return reply.code(404).send({ message: 'Game not found' });
        }
        await userStat.addGame(game, { transaction });
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
                await transaction.rollback();
                return reply.code(400).send({ message: 'Invalid result value' });
        }
        if (game.player1_nickname === nickname) {
            userStat.number_of_points = (userStat.number_of_points || 0) + (game.player1_score || 0);
        } else if (game.player2_nickname === nickname) {
            userStat.number_of_points = (userStat.number_of_points || 0) + (game.player2_score || 0);
        } else if (game.player3_nickname === nickname) {
            userStat.number_of_points = (userStat.number_of_points || 0) + (game.player3_score || 0);
        } else {
            userStat.number_of_points = (userStat.number_of_points || 0) + (game.player4_score || 0);
        }

        userStat.average_score = (userStat.number_of_points || 0) / userStat.number_of_games;
        userStat.percentage_wins = (userStat.number_of_wins || 0) / userStat.number_of_games;
        userStat.percentage_losses = (userStat.number_of_losses || 0) / userStat.number_of_games;
        userStat.percentage_draws = (userStat.number_of_draws || 0) / userStat.number_of_games;
        await userStat.save();
        await user.save();
        await transaction.commit();
        reply.code(200).send({ message: 'Stats updated!', stats: userStat });
    } catch (error) {
        console.error('Error updating stats:', error);
        reply.code(500).send({ message: 'Failed to update stats', error });
    }
}



