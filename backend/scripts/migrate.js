/**
 * migrate.js — Drops and recreates all tables in the correct order.
 * Run with: npm run migrate
 * WARNING: This will DROP all existing data.
 */
const { execSync } = require('child_process');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const args = process.argv.slice(2);
const force = args.includes('--force');

(async () => {
  try {
    if (force) {
      console.log('⚠️ Running forced database reset...');
      console.log('Undoing all migrations...');
      execSync('npx sequelize-cli db:migrate:undo:all', { stdio: 'inherit' });
    }

    console.log('Starting database migration...');
    execSync('npx sequelize-cli db:migrate', { stdio: 'inherit' });

    console.log('✅ Migrations executed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
})();
