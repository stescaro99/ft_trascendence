import Fastify from 'fastify';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

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