const app = require('./src/app');
const config = require('./src/config/env');
const sequelize = require('./src/config/database');

// Require models to ensure they are registered with Sequelize before syncing
require('./src/models/index');

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');

    // Database schema is now managed by Sequelize migrations
    // Run migrations using \`npm run migrate\`

    app.listen(config.port, () => {
      console.log(`Server is running on port ${config.port} in ${config.env} mode.`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

startServer();
