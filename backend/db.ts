import { time } from 'console';
import { Sequelize } from 'sequelize';

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './db/database.db',
    dialectOptions: {
        timeout: 30000
    }
})

sequelize.getQueryInterface().sequelize.query('PRAGMA journal_mode = WAL;');

export default sequelize;