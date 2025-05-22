"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../db"));
const game_1 = __importDefault(require("./game"));
class Tournament extends sequelize_1.Model {
}
Tournament.init({
    tournament_id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    players: {
        type: sequelize_1.DataTypes.JSON,
        allowNull: false,
        defaultValue: [],
    },
    number_of_players: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    winner_nickname: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
    },
    date: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
}, {
    sequelize: db_1.default,
    modelName: 'Tournament',
    tableName: 'tournaments',
    timestamps: false,
});
Tournament.hasMany(game_1.default, {
    foreignKey: 'tournament_id',
    sourceKey: 'tournament_id',
    as: 'games',
});
game_1.default.belongsTo(Tournament, {
    foreignKey: 'tournament_id',
    targetKey: 'tournament_id',
    as: 'tournament',
});
exports.default = Tournament;
