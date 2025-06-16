import { DataTypes, Model } from 'sequelize';
import sequelize from '../db';

class Game extends Model {
    public game_id!: number;
    public game_status!: 'pending' | 'finished';
    public players!: string[];
    public scores!: [number, number];
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
        players: {
            type: DataTypes.JSON,
            allowNull: false,
            validate: {
                isPlayersValid(value: string[]) {
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
            type: DataTypes.JSON,
            allowNull: false,
            defaultValue: [0, 0],
            validate: {
                isScoresValid(value: [number, number]) {
                    if (!Array.isArray(value) || value.length !== 2) {
                        throw new Error('Scores must be an array of 2 numbers');
                    }
                }
            }
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