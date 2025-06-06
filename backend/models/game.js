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
    players: {
        type: sequelize_1.DataTypes.JSON,
        allowNull: false,
        validate: {
            isPlayersValid(value) {
                if (!Array.isArray(value) || (value.length !== 2 && value.length !== 4)) {
                    throw new Error('Players must be an array of 2 or 4 nicknames');
                }
                const uniquePlayers = new Set(value);
                if (uniquePlayers.size !== value.length) {
                    throw new Error('Players must have unique nicknames');
                }
            }
        }
    },
    scores: {
        type: sequelize_1.DataTypes.JSON,
        allowNull: false,
        defaultValue: [0, 0],
        validate: {
            isScoresValid(value) {
                if (!Array.isArray(value) || value.length !== 2) {
                    throw new Error('Scores must be an array of 2 numbers');
                }
            }
        }
    },
    winner_nickname: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
        defaultValue: "",
    },
    date: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
}, {
    sequelize: db_1.default,
    modelName: 'Game',
    tableName: 'games',
    timestamps: false,
});
exports.default = Game;
