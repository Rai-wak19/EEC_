const sequelize = require('../src/config/database');
require('../src/models/index');

const schemas = {};

for (const modelName in sequelize.models) {
  const model = sequelize.models[modelName];
  schemas[modelName] = model.getAttributes();
}

console.log(JSON.stringify(schemas, (key, value) => {
  if (typeof value === 'function') {
    return value.name || value.toString();
  }
  return value;
}, 2));
process.exit(0);
