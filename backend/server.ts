import Fastify from 'fastify';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import fastifyMultipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import fastifyCors from '@fastify/cors';
import fastifyOauth2 from '@fastify/oauth2';

dotenv.config();

const dbDir = path.join(__dirname, 'db');
const dbPath = path.join(dbDir, 'database.db');

if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir);
}

const dbExists = fs.existsSync(dbPath);

import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';

const server = Fastify({ logger: true });

const start = async (sequelize: any) => {
    try {
        await server.register(fastifyCors, {
            origin: true,
            credentials: true
        });
        await server.register(swagger, {
            openapi: {
                info: {
                    title: 'API ft_trascendence',
                    description: 'Documentazione API Pong',
                    version: '1.0.0'
                },
                components: {
                    securitySchemes: {
                        bearerAuth: {
                            type: 'http',
                            scheme: 'bearer',
                            bearerFormat: 'JWT',
                            description: 'Inserisci il token JWT come: Bearer <token>'
                        }
                    }
                },
                security: [{ bearerAuth: [] }]
            },
        });
        await server.register(swaggerUI, {
            routePrefix: '/swagger'
        });

        await server.register(fastifyMultipart);
        await server.register(fastifyStatic, {
            root: path.join(__dirname, '../uploads'),
            prefix: '/uploads/',
        });

        await server.register(fastifyOauth2 as any, {
            name: 'googleOAuth2',
            scope: ['profile', 'email'],
            credentials: {
                client: {
                    id: process.env.GOOGLE_CLIENT_ID,
                    secret: process.env.GOOGLE_CLIENT_SECRET,
                },
                auth: fastifyOauth2.GOOGLE_CONFIGURATION,
            },
            startRedirectPath: '/auth/google',
            callbackUri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:2807/auth/google/callback',
            
        });
        //debug

        console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID);
        console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET);
        console.log('GOOGLE_REDIRECT_URI:', process.env.GOOGLE_REDIRECT_URI);
        const routes_path = path.join(__dirname, 'routes');
        fs.readdirSync(routes_path).forEach((file) => {
            if (file.endsWith('.js')) {
                const route = require(path.join(routes_path, file));
                server.register(route, { prefix: '/api' });
            }
        });

        await sequelize.authenticate();
        console.log('Database connection has been established successfully.');
        console.log('Database synchronized successfully.');
        await server.listen({ port: 2807, host: '0.0.0.0' });
        console.log('Server is running on http://localhost:2807');
        console.log('Swagger UI is available at http://localhost:2807/swagger');
    } catch (err) {
        server.log.error(err);
        process.exit(1);
    }
};

(async () => {
    const { default: sequelize } = await import('./db');
    await import('./models/game');
    await import('./models/stats');
    await import('./models/user');
    await import('./models/tournament');
    // ...altri modelli se servono

    await sequelize.sync({ force: !dbExists, alter: dbExists });
    if (!dbExists) {
        console.log('Database created successfully.');
    } else {
        console.log('Database already exists, no changes made.');
    }
    await start(sequelize);
})();