import { FastifyRequest, FastifyReply } from 'fastify';
import Game from '../models/game';

export async function addGame(request: FastifyRequest, reply: FastifyReply) {
    const { players, date } = request.body as {
        players: string[];
        date: Date;
    };
    if (!Array.isArray(players) || (players.length !== 2 && players.length !== 4)) {
        return reply.code(400).send({ error: 'Players must be an array of 2 or 4 nicknames' });
    }
    try {
        const game = await Game.create({
            players,
            scores: [0, 0],
            date,
        });
        reply.code(201).send({ message: 'Game added!', game });
    } catch (error) {
        reply.code(500).send({ error: 'Failed to add game', details: error });
    }
}

export async function getGame(request: FastifyRequest, reply: FastifyReply) {
    const { game_id } = request.query as { game_id: number };
    try {
        const game = await Game.findOne({ where: { game_id } });
        if (game) {
            reply.code(200).send(game);
        } else {
            reply.code(404).send({ error: 'Game not found' });
        }
    } catch (error) {
        reply.code(500).send({ error: 'Failed to get game', details: error });
    }
}

export async function updateGame(request: FastifyRequest, reply: FastifyReply) {
    const { game_id, field, new_value } = request.body as { game_id: number; field: string; new_value: any };
    try {
        const game = await Game.findOne({ where: { game_id } });
        if (!game) {
            return reply.code(404).send({ error: 'Game not found' });
        }
        switch (field) {
            case '1_scores':
                await game?.update({ scores: [Number(new_value), game.scores[1]] });
                break;
            case '2_scores':
                await game?.update({ scores: [game.scores[0], Number(new_value)] });
                break;
            case 'winner_nickname':
                await game?.update({ winner_nickname: new_value });
                await game?.update({ game_status: 'finished' });
                break;
            default:
                return reply.code(400).send({ error: 'Invalid field' });
        }
        await game.save();
        reply.code(200).send({ message: 'Game updated!', game });
    } catch (error) {
        reply.code(500).send({ error: 'Failed to update game', details: error });
    }
}

export async function deleteGame(request: FastifyRequest, reply: FastifyReply) {
    const { game_id } = request.query as { game_id: number };
    try {
        const game = await Game.findOne({ where: { game_id } });
        if (game) {
            await game.destroy();
            reply.code(200).send({ message: 'Game deleted!' });
        } else {
            reply.code(404).send({ error: 'Game not found' });
        }
    } catch (error) {
        reply.code(500).send({ error: 'Failed to delete game', details: error });
    }
}