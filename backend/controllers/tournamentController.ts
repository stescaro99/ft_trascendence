import { FastifyRequest, FastifyReply } from 'fastify';
import Tournament from '../models/tournament';
import Game from '../models/game';

export async function addTournament(request: FastifyRequest, reply: FastifyReply) {
    const { players, date } = request.body as {
        players: string[];
        date: Date;
    };
    const number_of_players = players.length;
    try {
        const tournament = await Tournament.create({
            players,
            number_of_players,
            date,
        });
        reply.code(201).send({ message: 'Tournament added!', tournament });
    } catch (error) {
        reply.code(500).send({ error: 'Failed to add tournament', details: error });
    }
}

export async function getTournament(request: FastifyRequest, reply: FastifyReply) {
    const { tournament_id } = request.query as { tournament_id: number };
    try {
        const tournament = await Tournament.findOne({ where: { tournament_id }, include: ['games'] });
        if (tournament) {
            reply.code(200).send(tournament);
        } else {
            reply.code(404).send({ error: 'Tournament not found' });
        }
    } catch (error) {
        reply.code(500).send({ error: 'Failed to get tournament', details: error });
    }
}

export async function updateTournament(request: FastifyRequest, reply: FastifyReply) {
    const { tournament_id, game_id } = request.body as {
        tournament_id: number;
        game_id: number;
    };

    try {
        const game = await Game.findOne({ where: { game_id } });
        if (!game) {
            return reply.code(404).send({ error: 'Game not found' });
        }
        const tournament = await Tournament.findOne({ where: { tournament_id }, include: ['games'] });
        if (!tournament) {
            return reply.code(404).send({ error: 'Tournament not found' });
        }
        await tournament.addGame(game);

        if (tournament.games.length == (tournament.number_of_players - 2)) {
            tournament.winner_nickname = game.winner_nickname;
        }
        
        await tournament.save();
        reply.code(200).send({ message: 'Game added to tournament', tournament });
    } catch (error) {
        reply.code(500).send({ error: 'Failed to update tournament', details: error });
    }
}

export async function deleteTournament(request: FastifyRequest, reply: FastifyReply) {
    const { tournament_id } = request.query as { tournament_id: number };
    try {
        const tournament = await Tournament.findOne({ where: { tournament_id } });
        if (!tournament) {
            return reply.code(404).send({ error: 'Tournament not found' });
        }
        await tournament.destroy();
        reply.code(200).send({ message: 'Tournament deleted' });
    } catch (error) {
        reply.code(500).send({ error: 'Failed to delete tournament', details: error });
    }
}


