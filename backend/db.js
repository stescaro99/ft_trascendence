"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const sequelize = new sequelize_1.Sequelize({
    dialect: 'sqlite',
    storage: './db/database.db',
    dialectOptions: {
        timeout: 30000
    }
});
sequelize.getQueryInterface().sequelize.query('PRAGMA journal_mode = WAL;');
exports.default = sequelize;
