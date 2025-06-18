import { DataTypes, Model } from 'sequelize';
import sequelize from '../db';
import Game from './game';

class Tournament extends Model {
	public tournament_id!: number;
	public players!: string[];
	public number_of_players!: number;
	public winner_nickname?: string;
	public date!: Date;
	public addGame!: (game: Game, options?: any) => Promise<void>;
	public games!: Game[];
}

	Tournament.init(
		{
			tournament_id: {
				type: DataTypes.INTEGER,
				autoIncrement: true,
				primaryKey: true,
			},
			players: {
				type: DataTypes.JSON,
				allowNull: false,
				defaultValue: [],
			},
			number_of_players: {
				type: DataTypes.INTEGER,
				allowNull: false,
				defaultValue: 0,
			},
			winner_nickname: {
				type: DataTypes.STRING,
				allowNull: true,
				defaultValue: null,
			},
			date: {
				type: DataTypes.DATE,
				allowNull: false,
				defaultValue: DataTypes.NOW,
			},
		},
		{
			sequelize,
			modelName: 'Tournament',
			tableName: 'tournaments',
			timestamps: false,
		}
	);

	Tournament.hasMany(Game, {
		foreignKey: 'tournament_id',
		sourceKey: 'tournament_id',
		as: 'games',
	});
	Game.belongsTo(Tournament, {
		foreignKey: 'tournament_id',
		targetKey: 'tournament_id',
		as: 'tournament',
	});

export default Tournament;