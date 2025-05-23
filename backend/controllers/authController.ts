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
        const secret = speakeasy.generateSecret({ name: `${process.env.TFA_SECRET || '2FA_APP'} ${nickname}` });
        user.tfa_code = secret.base32;
        await user.save();

        const otpauth_url = secret.otpauth_url;
        if (!otpauth_url) {
            reply.code(500).send({ error: 'Failed to generate OTP Auth URL' });
            return;
        }
        const qrCode = await qrcode.toDataURL(otpauth_url);

        reply.code(200).send({
            message: '2FA secret generated',
            qrCode,
        });
    }
    catch (error) {
        reply.code(500).send({ error: 'Failed to generate 2FA secret', details: error });
    }
}

export async function verify2FA(request: FastifyRequest, reply: FastifyReply) {
    const { nickname, token } = request.body as { nickname: string; token: string };

    try {
        const user = await User.findOne({ where: { nickname } });
        if (!user || !user.tfa_code) {
            reply.code(404).send({ error: 'User not found or 2FA not enabled' });
            return;
        }
        const verified = speakeasy.totp.verify({
            secret: user.tfa_code,
            encoding: 'base32',
            token,
        });
        
        if (verified) {
            reply.code(200).send({ message: '2FA verified successfully' });
        }
        else {
            reply.code(401).send({ error: 'Invalid 2FA token' });
        }
    }
    catch (error) {
        reply.code(500).send({ error: 'Failed to verify 2FA', details: error });
    }  
}  

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
    const { nickname, password, token2FA } = request.body as {
        nickname: string;
        password: string;
        token2FA?: string;
    };

    try {
        const user = await User.findOne({ where: { nickname } });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            reply.code(401).send({ error: 'Invalid credentials' });
            return;
        }

       if (!user.tfa_code) {
            const issuer = 'FT_TRASCENDENCE';

            const secret = speakeasy.generateSecret({
            name: nickname,
            issuer: issuer
            });

            user.tfa_code = secret.base32;
            await user.save();

            const label = encodeURIComponent(`${issuer}:${nickname}`);
            const base32 = secret.base32;
            const otpauth_url = `otpauth://totp/${label}?secret=${base32}&issuer=${issuer}`;

            if (!otpauth_url) {
                reply.code(500).send({ error: 'Failed to generate OTP Auth URL' });
                return;
            }
            const qrCode = await qrcode.toDataURL(otpauth_url);
            console.log('TOTP URI:', secret.otpauth_url);
            console.log('issuer:', issuer);

            reply.code(206).send({
                require2FASetup: true,
                message: '2FA setup required. Scan the QR code with Google Authenticator.',
                qrCode,
            });
            return;
        }

        if (!token2FA) {
            reply.code(401).send({ error: '2FA token required' });
            return;
        }

        console.log('2FA token:', token2FA);
        console.log('2FA secret:', user.tfa_code);

        const verified = speakeasy.totp.verify({
            secret: user.tfa_code,
            encoding: 'base32',
            token: token2FA!,
            window: 3,
        });

        if (!verified) {
            reply.code(401).send({ error: 'Invalid 2FA token' });
            return;
        }

        const payload = { id: user.id, nickname: user.nickname };
        const jwtToken = createJWT(payload);
        reply.code(200).send({ message: 'Login successful', token: jwtToken, user });
    }
    catch (error) {
        reply.code(500).send({ error: 'Failed to login', details: error });
    }
}