import { DataTypes, Model } from 'sequelize';
import sequelize from '../db';
import { Stats } from 'fs';

class Game extends Model {
    public game_id!: number;
    public game_status!: 'pending' | 'finished';
    public player1_nickname!: string;
    public player2_nickname!: string;
    public player3_nickname?: string;
    public player4_nickname?: string;
    public player1_score?: number;
    public player2_score?: number;
    public player3_score?: number;
    public player4_score?: number;
    public winner_nickname?: string;
    public date!: Date;
}

Game.init(
    {
        game_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        game_status: {
            type: DataTypes.ENUM('pending', 'finished'),
            allowNull: false,
            defaultValue: 'pending',
        },
        player1_nickname: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        player2_nickname: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        player3_nickname: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: "",
        },
        player4_nickname: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: "",
        },
        player1_score: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
        },
        player2_score: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
        },
        player3_score: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
        },
        player4_score: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
        },
        winner_nickname: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: "",
        },
        date: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        sequelize,
        modelName: 'Game',
        tableName: 'games',
        timestamps: false,
    }
);

export default Game;
