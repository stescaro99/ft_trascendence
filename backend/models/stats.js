"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../db"));
const game_1 = __importDefault(require("./game"));
class Stats extends sequelize_1.Model {
}
;
Stats.init({
    stat_index: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    },
    nickname: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    number_of_games: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
    },
    number_of_wins: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
    },
    number_of_losses: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
    },
    number_of_draws: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
    },
    number_of_points: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
    },
    number_of_tournaments_won: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
    },
    average_score: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: true,
        defaultValue: 0.0,
    },
    percentage_wins: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: true,
        defaultValue: 0.0,
    },
    percentage_losses: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: true,
        defaultValue: 0.0,
    },
    percentage_draws: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: true,
        defaultValue: 0.0,
    }
}, {
    sequelize: db_1.default,
    modelName: 'Stats',
    tableName: 'stats',
});
Stats.hasMany(game_1.default, {
    foreignKey: 'stat_index',
    sourceKey: 'stat_index',
    as: 'games',
});
game_1.default.belongsToMany(Stats, {
    through: 'game_stats',
    foreignKey: 'stat_index',
    otherKey: 'game_id',
    as: 'stats',
});
exports.default = Stats;
