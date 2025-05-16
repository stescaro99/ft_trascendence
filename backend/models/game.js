"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../db"));
class Game extends sequelize_1.Model {
}
Game.init({
    game_id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    game_status: {
        type: sequelize_1.DataTypes.ENUM('pending', 'finished'),
        allowNull: false,
        defaultValue: 'pending',
    },
    player1_nickname: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    player2_nickname: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    player3_nickname: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
        defaultValue: "",
    },
    player4_nickname: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
        defaultValue: "",
    },
    player1_score: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
    },
    player2_score: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
    },
    player3_score: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
    },
    player4_score: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
    },
    winner_nickname: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
        defaultValue: "",
    },
    date: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
}, {
    sequelize: db_1.default,
    modelName: 'Game',
    tableName: 'games',
    timestamps: false,
});
exports.default = Game;
