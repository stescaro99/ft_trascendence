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
const swagger_1 = __importDefault(require("@fastify/swagger"));
const swagger_ui_1 = __importDefault(require("@fastify/swagger-ui"));
const server = (0, fastify_1.default)({ logger: true });
(() => __awaiter(void 0, void 0, void 0, function* () {
    yield db_1.default.sync({ alter: true });
    console.log('Database synchronized successfully.');
}))();
// funzione che avvia il server sulla porta 2807
const start = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield server.register(swagger_1.default, {
            openapi: {
                info: {
                    title: 'API ft_trascendence',
                    description: 'Documentazione API Pong',
                    version: '1.0.0'
                }
            },
        });
        yield server.register(swagger_ui_1.default, {
            routePrefix: '/swagger'
        });
        const routes_path = path_1.default.join(__dirname, 'routes');
        fs_1.default.readdirSync(routes_path).forEach((file) => {
            if (file.endsWith('.js')) {
                const route = require(path_1.default.join(routes_path, file));
                server.register(route, { prefix: '/api' });
            }
        });
        yield db_1.default.authenticate();
        console.log('Database connection has been established successfully.');
        //await sequelize.sync();
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
