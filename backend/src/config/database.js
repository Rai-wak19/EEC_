const { Sequelize } = require('sequelize');
const config = require('./env');

if (!config.databaseUrl) {
  console.error('DATABASE_URL is not defined in the environment variables.');
  process.exit(1);
}

const isSqlite = config.databaseUrl.startsWith('sqlite:');

const sequelize = isSqlite
  ? new Sequelize({
      dialect: 'sqlite',
      storage: config.databaseUrl.replace('sqlite:', '') || './database.sqlite',
      logging: false,
    })
  : new Sequelize(config.databaseUrl, {
      dialect: 'postgres',
      logging: false,
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      },
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
    });

module.exports = sequelize;
