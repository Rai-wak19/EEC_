const { Sequelize } = require('sequelize');
const bcrypt = require('bcryptjs');
const { User } = require('../src/models');
const sequelize = require('../src/config/database');

(async () => {
  try {
    await sequelize.authenticate();
    console.log('Connected to database successfully.');
    
    const hashedPassword = await bcrypt.hash('monet@430', 10);
    
    const [updatedCount] = await User.update(
      { 
        email: 'hericppm@gmail.com',
        password_hash: hashedPassword
      },
      { 
        where: { id: 1 } 
      }
    );
    
    if (updatedCount > 0) {
      console.log('Admin user updated successfully.');
    } else {
      console.log('User with ID 1 not found.');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error updating user:', error.message);
    process.exit(1);
  }
})();
