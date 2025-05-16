import Fastify from 'fastify';
import path from 'path';
import fs from 'fs';
import sequelize from './db';


const server = Fastify({ logger: true });

// aggiungo le rotte al server
const routes_path = path.join(__dirname, 'routes');
fs.readdirSync(routes_path).forEach((file) => {
    if (file.endsWith('.js')) {
        const route = require(path.join(routes_path, file));
        server.register(route, { prefix: '/api' }); // aggiunge il prefisso /api a tutte le rotte nel server
    }
});

// funzione che avvia il server sulla porta 2807
const start = async () => {
    try {
        await sequelize.authenticate(); // autenticazione al database
        console.log('Database connection has been established successfully.');
        await sequelize.sync(); // crea database e tabelle, se necessario
        console.log('Database synchronized successfully.');
        await server.listen({ port: 2807, host: '0.0.0.0' });
        console.log('Server is running on http://localhost:2807');
    } catch (err) {
        server.log.error(err);
        process.exit(1);
    }
};

start();