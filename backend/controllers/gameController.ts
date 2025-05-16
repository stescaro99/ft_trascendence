import { FastifyRequest, FastifyReply } from 'fastify';
import Game from '../models/game';

export async function addGame(request: FastifyRequest, reply: FastifyReply) {
    const { player1_nickname, player2_nickname, player3_nickname, player4_nickname, date } = request.body as {
        player1_nickname: string;
        player2_nickname: string;
        player3_nickname: string;
        player4_nickname: string;
        date: Date;
    };
    try {
        const game = await Game.create({
            player1_nickname,
            player2_nickname,
            player3_nickname,
            player4_nickname,
            date,
        });
        reply.code(201).send({ message: 'Game added!', game: game });
    } catch (error) {
        reply.code(500).send({ error: 'Failed to add game', details: error });
    }
}

export async function getGame(request: FastifyRequest, reply: FastifyReply) {
    const { game_id } = request.query as { game_id: number };
    try {
        const game = await Game.findOne({ where: { game_id: game_id } });
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
    const { field } = request.body as { field: string };
    const { new_value } = request.body as { new_value: string };
    const { game_id } = request.body as { game_id: number };
    try {
        const game = await Game.findOne({ where: { game_id: game_id } });
        if (!game) {
            reply.code(404).send({ error: 'Game not found' });
            return;
        }
        switch (field) {
            case 'player1_score':
                await game?.update({ player1_score: Number(new_value) });
                break;
            case 'player2_score':
                await game?.update({ player2_score: Number(new_value) });
                break;
            case 'player3_score':
                await game?.update({ player3_score: Number(new_value) });
                break;
            case 'player4_score':
                await game?.update({ player4_score: Number(new_value) });
                break;
            case 'winner_nickname':
                await game?.update({ winner_nickname: new_value });
                await game?.update({ game_status: 'finished' });
                break;
            default:
                reply.code(400).send({ error: 'Invalid field' });
                return;
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
        const game = await Game.findOne({ where: { game_id: game_id } });
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

