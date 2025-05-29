"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../db"));
const stats_1 = __importDefault(require("./stats"));
class User extends sequelize_1.Model {
}
User.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    surname: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    nickname: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    email: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    password: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    language: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
        defaultValue: 'English',
    },
    image_url: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    tfa_code: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    active: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    friends: {
        type: sequelize_1.DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
    },
    fr_request: {
        type: sequelize_1.DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
    }
}, {
    sequelize: db_1.default,
    modelName: 'User',
    tableName: 'users',
});
User.hasMany(stats_1.default, {
    foreignKey: 'nickname',
    sourceKey: 'nickname',
    as: 'stats',
});
stats_1.default.belongsTo(User, {
    foreignKey: 'nickname',
    targetKey: 'nickname',
    as: 'user',
});
exports.default = User;
