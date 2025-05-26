import { DataTypes, Model } from 'sequelize';
import sequelize from '../db';
import Stats from './stats';

class User extends Model {
    public id!: number;
    public name!: string;
    public surname!: string;
    public nickname!: string;
    public email!: string;
    public password!: string;
    public language?: string;
    public image_url?: string;
    public setStats!: (stats: Stats[] | number[]) => Promise<void>;
    public stats?: Stats[];
    public tfa_code?: string;
    public active!: boolean;
    public friends?: string[];
}

User.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        surname: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        nickname: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        language: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: 'English',
        },
        image_url: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        tfa_code: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        active: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        }
    },
    {
        sequelize,
        modelName: 'User',
        tableName: 'users',
    }
);

User.hasMany(Stats, {
    foreignKey: 'nickname',
    sourceKey: 'nickname',
    as: 'stats',
});
Stats.belongsTo(User, {
    foreignKey: 'nickname',
    targetKey: 'nickname',
    as: 'user',
});

export default User;