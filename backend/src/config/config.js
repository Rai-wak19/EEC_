require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const isSqlite = process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('sqlite:');
const sqlitePath = isSqlite ? process.env.DATABASE_URL.replace('sqlite:', '') || './database.sqlite' : null;

module.exports = {
  development: {
    use_env_variable: 'DATABASE_URL',
    dialect: isSqlite ? 'sqlite' : 'postgres',
    storage: sqlitePath,
    dialectOptions: !isSqlite ? {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    } : undefined
  },
  test: {
    use_env_variable: 'DATABASE_URL',
    dialect: isSqlite ? 'sqlite' : 'postgres',
    storage: sqlitePath
  },
  production: {
    use_env_variable: 'DATABASE_URL',
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  }
};
