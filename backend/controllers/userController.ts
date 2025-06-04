import { FastifyRequest, FastifyReply } from 'fastify';
import { MultipartFile } from '@fastify/multipart';
import User from '../models/user';
import Stats from '../models/stats';
import sequelize from '../db';
import bcrypt from 'bcrypt';
import path from 'path';
import fs from 'fs';

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
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            name,
            surname,
            nickname,
            email,
            password: hashedPassword,
            image_url,
        });

        const stats_pong = await Stats.create({ nickname: nickname });
        const stats_game2 = await Stats.create({ nickname: nickname });

        await user.setStats([stats_pong, stats_game2]);
        await user.reload({ include: [{ model: Stats, as: 'stats' }] });

        reply.code(201).send({ message: 'User added!', user});
    } catch (error) {
        reply.code(500).send({ error: 'Failed to add user', details: error });
    }
}

export async function deleteUser(request: FastifyRequest, reply: FastifyReply) {
    const { nickname } = request.body as { nickname: string };
    try {
        await Stats.destroy({ where: { nickname: nickname } });
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
        const user = await User.findOne({
            where: { nickname: nickname },
            include: [{ model: Stats, as: 'stats' }],
        });
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
    const { nickname, field, new_value } = request.body as { nickname: string; field: string; new_value: string };
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
                    user.password = await bcrypt.hash(new_value, 10);
                    break;
                case 'language':
                    user.language = new_value;
                    break;
                case 'image_url':
                    user.image_url = new_value;
                    break;
                case 'active':
                    user.active = false;
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

export async function uploadImage(request: FastifyRequest, reply: FastifyReply) {
    const parts = request.parts ? request.parts() : [];
    for await (const part of parts) {
        if ((part as MultipartFile).file && part.fieldname === 'image') {
            const filePart = part as MultipartFile;
            const uploadDir = path.join(__dirname, '../../uploads');
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }
            const filename = `${Date.now()}_${filePart.filename}`;
            const filepath = path.join(uploadDir, filename);
            const writeStream = fs.createWriteStream(filepath);
            await filePart.file.pipe(writeStream);
            const imageUrl = `${request.protocol}://${request.hostname}:2807/uploads/${filename}`;
            return reply.code(200).send({ imageUrl });
        }
    }
    reply.code(400).send({ error: 'No image uploaded' });
}


export async function addFriend(request: FastifyRequest, reply: FastifyReply) {
    const { user1, user2 } = request.body as { user1: string; user2: string };

    try {
        const first_user = await User.findOne({ where: { nickname: user1 } });
        const second_user = await User.findOne({ where: { nickname: user2 } });

        if (!first_user || !second_user) {
            return reply.code(404).send({ error: 'User not found' });
        }

        const friends1 = new Set(first_user.friends || []);
        const friends2 = new Set(second_user.friends || []);
        const requests2 = new Set(second_user.fr_request || []);
        const requests1 = new Set(first_user.fr_request || []);

        if (friends1.has(user2) && friends2.has(user1)) {
            friends1.delete(user2);
            friends2.delete(user1);

            first_user.friends = Array.from(friends1);
            second_user.friends = Array.from(friends2);

            await first_user.save();
            await second_user.save();

            return reply.send({ message: 'Friendship removed' });
        }
        if (requests1.has(user2)) {
            requests1.delete(user2);
            friends1.add(user2);
            friends2.add(user1);

            first_user.fr_request = Array.from(requests1);
            first_user.friends = Array.from(friends1);
            second_user.friends = Array.from(friends2);

            await first_user.save();
            await second_user.save();

            return reply.send({ message: 'Friendship established' });
        }
        if (!requests2.has(user1)) {
            requests2.add(user1);
            second_user.fr_request = Array.from(requests2);
            await second_user.save();
            return reply.send({ message: 'Friend request sent' });
        }
        return reply.code(409).send({ error: "Friend request already sent"})

    } catch (err) {
        console.error(err);
        return reply.code(500).send({ error: 'Internal server error' });
    }
}
