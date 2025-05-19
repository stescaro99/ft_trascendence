import Fastify from 'fastify';
import path from 'path';
import fs from 'fs';
import sequelize from './db';
import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';


const server = Fastify({ logger: true });

(async () => {
    await sequelize.sync({ alter: true });
    console.log('Database synchronized successfully.');
})();
// funzione che avvia il server sulla porta 2807
const start = async () => {
    try {
        await server.register(swagger, {
            openapi: {
                info: {
                    title: 'API ft_trascendence',
                    description: 'Documentazione API Pong',
                    version: '1.0.0'
                }
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
        //await sequelize.sync();
        console.log('Database synchronized successfully.');
        await server.listen({ port: 2807, host: '0.0.0.0' });
        console.log('Server is running on http://localhost:2807');
    } catch (err) {
        server.log.error(err);
        process.exit(1);
    }
};

start();
