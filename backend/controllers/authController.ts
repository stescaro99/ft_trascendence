import { FastifyRequest, FastifyReply } from 'fastify';
import User from '../models/user';
import bcrypt from 'bcrypt';
import { createJWT } from '../utils/jwt';
import speakeasy from 'speakeasy';
import qrcode from 'qrcode';

export async function generate2FA(request: FastifyRequest, reply: FastifyReply) {
    const { nickname } = request.body as { nickname: string };
    try {
        const user = await User.findOne({ where: { nickname } });
        if (!user) {
            reply.code(404).send({ error: 'User not found' });
            return;
        }
        if (user.tfa_code) {
            reply.code(400).send({ error: '2FA already enabled' });
            return;
        }
        const issuer = 'FT_TRASCENDENCE';
        const secret = speakeasy.generateSecret({ name: nickname, issuer });
        user.tfa_code = secret.base32;
        await user.save();

        const label = encodeURIComponent(`${issuer}:${nickname}`);
        const base32 = secret.base32;
        const otpauth_url = `otpauth://totp/${label}?secret=${base32}&issuer=${issuer}`;
        const qrCode = await qrcode.toDataURL(otpauth_url);

        reply.code(200).send({
            message: '2FA setup required. Scan the QR code with Google Authenticator.',
            qrCode,
        });
    }
    catch (error) {
        reply.code(500).send({ error: 'Failed to generate 2FA secret', details: error });
    }
}

export async function verify2FA(request: FastifyRequest, reply: FastifyReply) {
    const { nickname, token2FA} = request.body as { nickname: string; token2FA: string};

    try {
        const user = await User.findOne({ where: { nickname } });
        if (!user || !user.tfa_code) {
            reply.code(404).send({ error: 'User not found or 2FA not enabled' });
            return;
        }
        
        const verified = speakeasy.totp.verify({
            secret: user.tfa_code,
            encoding: 'base32',
            token: token2FA,
            window: 2
        });

        if (verified) {
            const payload = { id: user.id, nickname: user.nickname };
            const jwtToken = createJWT(payload);
            reply.code(200).send({ message: '2FA verified successfully, you are now logged in', token: jwtToken, user });
        } else {
            reply.code(401).send({ error: 'Invalid 2FA token' });
        }
    }
    catch (error) {
        reply.code(500).send({ error: 'Failed to verify 2FA', details: error });
    }
}

export async function login(request: FastifyRequest, reply: FastifyReply) {
    const { nickname, password } = request.body as { nickname: string; password: string };

    try {
        const user = await User.findOne({ where: { nickname } });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            reply.code(401).send({ error: 'Invalid credentials' });
            return;
        }
        if (!user.tfa_code) {
            reply.code(403).send({ error: '2FA not enabled. Complete 2FA setup.' });
            return;
        }
        reply.code(200).send({ require2FA: true, message: '2FA required' });
    }
    catch (error) {
        reply.code(500).send({ error: 'Failed to login', details: error });
    }
}

export async function isAvailable(request: FastifyRequest, reply: FastifyReply) {
    const { field, value } = request.query as { field: string; value: string; };
    try {
        switch (field) {
            case 'nickname':
                const user = await User.findOne({ where: { nickname: value } });
                reply.code(200).send({ available: !user });
                break;
            case 'email':
                const emailUser = await User.findOne({ where: { email: value } });
                reply.code(200).send({ available: !emailUser });
                break;
            default:
                reply.code(400).send({ error: 'Invalid field' });
        }
    }
    catch (error) {
        reply.code(500).send({ error: 'Failed to check availability', details: error });
    }
}