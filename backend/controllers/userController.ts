import { FastifyRequest, FastifyReply } from 'fastify';
import User from '../models/user';

export async function addUser(request: FastifyRequest, reply: FastifyReply) {
    const { name, surname, nickname, email, password, image_url } = request.body as { 
        name: string; 
        surname: string; 
        nickname: string; 
        email: string; 
        password: string; 
        image_url?: string;
    };
    try {
        const user = await User.create({
            name,
            surname,
            nickname,
            email,
            password,
            image_url,
        });
        reply.code(201).send({ message: 'User added!', user });
    } catch (error) {
        reply.code(500).send({ error: 'Failed to add user', details: error });
    }
}

export async function deleteUser(request: FastifyRequest, reply: FastifyReply) {
    const { nickname } = request.body as { nickname: string };
    try {
        const user = await User.destroy({ where: { nickname: nickname } });
        if (user) {
            reply.code(200).send({ message: 'User deleted!' });
        } else {
            reply.code(404).send({ error: 'User not found' });
        }
    } catch (error) {
        reply.code(500).send({ error: 'Failed to delete user', details: error });
    }
}

export async function getUser(request: FastifyRequest, reply: FastifyReply) {
    const { nickname } = request.query as { nickname: string };
    try {
        const user = await User.findOne({ where: { nickname: nickname } });
        if (user) {
            reply.code(200).send(user);
        } else {
            reply.code(404).send({ error: 'User not found' });
        }
    } catch (error) {
        reply.code(500).send({ error: 'Failed to get user', details: error });
    }
}

export async function updateUser(request: FastifyRequest, reply: FastifyReply) {
    const { field } = request.query as { field: string };
    const { new_value} = request.body as { new_value: string;};
    const { nickname } = request.body as { nickname: string };
    try {
        const user = await User.findOne({ where: { nickname: nickname } });
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
                    user.email = new_value;
                    break;
                case 'password':
                    user.password = new_value;
                    break;
                case 'image_url':
                    user.image_url = new_value;
                    break;
                default:
                    reply.code(400).send({ error: 'Invalid field' });
                    return;
            }
            await user.save();
            reply.code(200).send({ message: 'User updated!', user });
        } else {
            reply.code(404).send({ error: 'User not found' });
        }
    }
    catch (error) {
        reply.code(500).send({ error: 'Failed to update user', details: error });
    }
}