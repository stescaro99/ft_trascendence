"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const dbDir = path_1.default.join(__dirname, 'db');
const dbPath = path_1.default.join(dbDir, 'database.db');
if (!fs_1.default.existsSync(dbDir)) {
    fs_1.default.mkdirSync(dbDir);
}
const dbExists = fs_1.default.existsSync(dbPath);
const swagger_1 = __importDefault(require("@fastify/swagger"));
const swagger_ui_1 = __importDefault(require("@fastify/swagger-ui"));
const server = (0, fastify_1.default)({ logger: true });
const start = (sequelize) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield server.register(swagger_1.default, {
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
        yield sequelize.authenticate();
        console.log('Database connection has been established successfully.');
        console.log('Database synchronized successfully.');
        yield server.listen({ port: 2807, host: '0.0.0.0' });
        console.log('Server is running on http://localhost:2807');
        console.log('Swagger UI is available at http://localhost:2807/swagger');
    }
    catch (err) {
        server.log.error(err);
        process.exit(1);
    }
});
(() => __awaiter(void 0, void 0, void 0, function* () {
    const { default: sequelize } = yield Promise.resolve().then(() => __importStar(require('./db')));
    yield Promise.resolve().then(() => __importStar(require('./models/game')));
    yield Promise.resolve().then(() => __importStar(require('./models/stats')));
    yield Promise.resolve().then(() => __importStar(require('./models/user')));
    yield Promise.resolve().then(() => __importStar(require('./models/tournament')));
    // ...altri modelli se servono
    yield sequelize.sync({ force: !dbExists, alter: dbExists });
    if (!dbExists) {
        console.log('Database created successfully.');
    }
    else {
        console.log('Database already exists, no changes made.');
    }
    yield start(sequelize);
}))();
