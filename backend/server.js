"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const db_1 = __importDefault(require("./db"));
const server = (0, fastify_1.default)({ logger: true });
// aggiungo le rotte al server
const routes_path = path_1.default.join(__dirname, 'routes');
fs_1.default.readdirSync(routes_path).forEach((file) => {
    if (file.endsWith('.js')) {
        const route = require(path_1.default.join(routes_path, file));
        server.register(route, { prefix: '/api' }); // aggiunge il prefisso /api a tutte le rotte nel server
    }
});
// route di test
server.get('/', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
    return { hello: 'world' };
}));
// funzione che avvia il server sulla porta 2807
const start = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield db_1.default.authenticate(); // autenticazione al database
        console.log('Database connection has been established successfully.');
        yield db_1.default.sync(); // crea database e tabelle, se necessario
        console.log('Database synchronized successfully.');
        yield server.listen({ port: 2807, host: '0.0.0.0' });
        console.log('Server is running on http://localhost:2807');
    }
    catch (err) {
        server.log.error(err);
        process.exit(1);
    }
});
start();
