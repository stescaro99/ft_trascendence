import { FastifyRequest, FastifyReply } from 'fastify';
import User from '../models/user';
import sequelize from '../db';

export async function isAvailable(request: FastifyRequest, reply: FastifyReply) {
    const { field, value } = request.query as {
        field: string;
        value: string;
    };

    try {
        switch (field) {
            case 'nickname':
                const user = await User.findOne({ where: { nickname: value } });
                if (user) {
                    reply.code(200).send({ available: false });
                }
                else {
                    reply.code(200).send({ available: true });
                }
                break;
            case 'email':
                const emailUser = await User.findOne({ where: { email: value } });
                if (emailUser) {
                    reply.code(200).send({ available: false });
                }
                else {
                    reply.code(200).send({ available: true });
                }
                break;
            default:
                reply.code(400).send({ error: 'Invalid field' });
                return;
        }
    }
    catch (error) {
        reply.code(500).send({ error: 'Failed to check availability', details: error });
    }
}

export async function login(request: FastifyRequest, reply: FastifyReply) {
    const { nickname, password } = request.query as {
        nickname: string;
        password: string;
    };

    try {
        const user = await User.findOne({ where: { nickname: nickname, password: password } });
        if (user) {
            reply.code(200).send({ message: 'Login successful', user });
        }
        else {
            reply.code(401).send({ error: 'Invalid credentials' });
        }
    }
    catch (error) {
        reply.code(500).send({ error: 'Failed to login', details: error });
    }
}