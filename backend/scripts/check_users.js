const { Sequelize } = require('sequelize');

const url = 'postgresql://postgres.jyxylqonqirwmkyihyeg:246810Re%3B%3A%3A%3A%23@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true';

const sequelize = new Sequelize(url, {
  dialect: 'postgres',
  logging: false,
});

(async () => {
  try {
    await sequelize.authenticate();
    console.log('Connected to Supabase successfully.');
    
    const [results] = await sequelize.query('SELECT id, email, role FROM users;');
    console.log(`Found ${results.length} users in the database.`);
    if (results.length > 0) {
      console.log(results);
    } else {
      console.log('The users table is empty! Seeding must have failed.');
    }
    process.exit(0);
  } catch (error) {
    console.error('Error connecting or querying:', error.message);
    process.exit(1);
  }
})();
