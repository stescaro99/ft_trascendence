import Fastify from 'fastify';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import fastifyMultipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import fastifyCors from '@fastify/cors';
import fastifyOauth2 from '@fastify/oauth2';
import fastifyCookie from '@fastify/cookie';

//dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config(); //con docker non serve specificare il path, prende automaticamente il file .env nella root del progetto

const dbDir = path.join(__dirname, 'db');
const dbPath = path.join(dbDir, 'database.db');

if (!fs.existsSync(dbDir)) {
	fs.mkdirSync(dbDir);
}

const dbExists = fs.existsSync(dbPath);

import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';

// Carica i certificati SSL
const httpsOptions = {
	key: fs.readFileSync(path.join(__dirname, 'cert', 'key.pem')),
	cert: fs.readFileSync(path.join(__dirname, 'cert', 'cert.pem'))
};

const server = Fastify({
  logger: true,
  https: httpsOptions,
  bodyLimit: 20 * 1024 * 1024
});

server.register(fastifyCookie); 

const start = async (sequelize: any) => {
	try {
		await server.register(fastifyCors, {
			origin: [
				'https://localhost:5173',
				'http://localhost:5173',
				'https://localhost:3000',
				'http://localhost:3000',
				'https://trascendence.fe',
				'http://trascendence.fe',
				'https://trascendence.be',
				'http://trascendence.be',
				/^https?:\/\/10\.\d+\.\d+\.\d+:\d+$/,        // IP 10.x.x.x (rete privata classe A)
				/^https?:\/\/192\.168\.\d+\.\d+:\d+$/,       // IP 192.168.x.x (rete privata classe C)
				/^https?:\/\/172\.(1[6-9]|2\d|3[01])\.\d+\.\d+:\d+$/, // IP 172.16-31.x.x (rete privata classe B)
			],
			credentials: true,
			methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
			allowedHeaders: ['Content-Type', 'Authorization']
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

		await server.register(fastifyMultipart, {
			limits: {
				fileSize: 20 * 1024 * 1024
			}
		});
		await server.register(fastifyStatic, {
			root: path.join(__dirname, '../uploads'),
			prefix: '/uploads/',
		});

		await server.register(fastifyOauth2 as any, {
			name: 'googleOAuth2',
			scope: ['profile', 'email', 'openid'],
			credentials: {
				client: {
					id: process.env.GOOGLE_CLIENT_ID!,
					secret: process.env.GOOGLE_CLIENT_SECRET!
				},
				auth: fastifyOauth2.GOOGLE_CONFIGURATION,
			},
			startRedirectPath: '/api/google_login',
			callbackUri: process.env.GOOGLE_REDIRECT_URI!
		});
	

		const routes_path = path.join(__dirname, 'routes');
		fs.readdirSync(routes_path).forEach((file) => {
			if (file.endsWith('.js')) {
				const route = require(path.join(routes_path, file));
				server.register(route, { prefix: '/api' });
			}
		});

		// Registra le route WebSocket
		const websocketRoutes = require('./routes/websocketRoutes');
		server.register(websocketRoutes.default, { prefix: '/ws' });


		await sequelize.authenticate();
		console.log('Database connection has been established successfully.');
		console.log('Database synchronized successfully.');
		await server.listen({ port: 2807, host: '0.0.0.0' });
		console.log('Server is running on https://localhost:2807');
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