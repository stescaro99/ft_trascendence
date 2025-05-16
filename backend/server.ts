// questi sarebbero tipo import 
const Fastify = require('fastify');
const path = require('path');
const fs = require('fs');

// Sostituire '/' con le nostre routes
const server = Fastify({ logger: true });
server.get('/', async (request, reply) => {
    return { message: 'Server is running!' };
});

// avvia il server sulla porta 2807
const start = async () => {
    try {
        await server.listen({ port: 2807, host: '0.0.0.0' });
        console.log('Server is running on http://localhost:2807');
    } catch (err) {
        server.log.error(err);
        process.exit(1);
    }
};

start();