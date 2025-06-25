import { FastifyInstance, FastifyRequest } from 'fastify';
import websocket from '@fastify/websocket';
import { handleWebSocketConnection } from '../controllers/websocketController';

export default async function websocketRoutes(fastify: FastifyInstance) {
  await fastify.register(websocket);

  fastify.register(async function (fastify: FastifyInstance) {
    fastify.get('/game', { 
      websocket: true,
      schema: {
        querystring: {
          type: 'object',
          properties: {
            token: { type: 'string' }
          }
        },
        tags: ['WebSocket']
      }
    }, (connection: any, req: FastifyRequest) => {
      handleWebSocketConnection(connection, req);
    });
  });
}
