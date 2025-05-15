import Fastify from 'fastify';
import path from 'path';
import fs from 'fs';

// Importa e configura un'istanza di Fastify con il logger abilitato
const server = Fastify({ logger: true });

// Determina il percorso della directory "routes" relativa al file corrente
const routesPath = path.join(__dirname, 'routes');

// Legge tutti i file nella directory "routes" e li registra come moduli di routing
fs.readdirSync(routesPath).forEach((file) => {
    const route = require(path.join(routesPath, file));
    server.register(route.default || route);
});

// Funzione asincrona per avviare il server
const start = async () => {
    try {
        await server.listen({ port: 3000, host: '0.0.0.0' });
        console.log('Server running at http://localhost:3000');
    } catch (err){
        server.log.error(err);
        process.exit(1);
    }
};

// Chiama la funzione per avviare il server
start();