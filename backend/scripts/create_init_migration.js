const fs = require('fs');
const path = require('path');
const { sequelize } = require('../src/models/index');

const migrationDir = path.join(__dirname, '../src/migrations');
if (!fs.existsSync(migrationDir)) {
  fs.mkdirSync(migrationDir, { recursive: true });
}

const date = new Date();
const prefix = date.toISOString().replace(/\D/g, '').slice(0, 14);
const filename = `${prefix}-initial-migration.js`;
const filepath = path.join(migrationDir, filename);

let upContent = `
    const transaction = await queryInterface.sequelize.transaction();
    try {
`;

let downContent = `
    const transaction = await queryInterface.sequelize.transaction();
    try {
`;

// Sort models manually to respect foreign keys
const order = [
  'User',
  'Project',
  'Contract',
  'Milestone',
  'Deliverable',
  'FinancialRecord',
  'Risk',
  'Issue',
  'Resource',
  'ProjectProgress',
  'Intervention',
  'RecoveryPlan',
  'ForwardLook'
];

for (const modelName of order) {
  const model = sequelize.models[modelName];
  if (!model) continue;
  
  const tableName = model.tableName;
  const attributes = model.getAttributes();
  
  let attrStr = '{\n';
  for (const [key, attr] of Object.entries(attributes)) {
    attrStr += `        ${key}: {`;
    if (attr.primaryKey) attrStr += ' primaryKey: true,';
    if (attr.autoIncrement) attrStr += ' autoIncrement: true,';
    if (attr.allowNull !== undefined) attrStr += ` allowNull: ${attr.allowNull},`;
    
    // type
    attrStr += ` type: Sequelize.${attr.type.constructor.name}`;
    if (attr.type.options && attr.type.options.length) {
       attrStr += `(${attr.type.options.length})`;
    } else if (attr.type.options && attr.type.options.values) {
       attrStr += `(${JSON.stringify(attr.type.options.values)})`;
    }
    attrStr += ',';
    
    // references
    if (attr.references) {
      attrStr += ` references: { model: '${attr.references.model}', key: '${attr.references.key}' },`;
      if (attr.onDelete) attrStr += ` onDelete: '${attr.onDelete}',`;
      if (attr.onUpdate) attrStr += ` onUpdate: '${attr.onUpdate}',`;
    }
    if (attr.defaultValue !== undefined) {
      if (typeof attr.defaultValue === 'string') {
        attrStr += ` defaultValue: '${attr.defaultValue}',`;
      } else if (typeof attr.defaultValue === 'boolean' || typeof attr.defaultValue === 'number') {
        attrStr += ` defaultValue: ${attr.defaultValue},`;
      }
    }
    
    attrStr += ' },\n';
  }
  attrStr += '      }';
  
  upContent += `
      await queryInterface.createTable('${tableName}', ${attrStr}, { transaction });`;
      
  downContent = `
      await queryInterface.dropTable('${tableName}', { transaction });` + downContent;
}

upContent += `
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
`;

downContent += `
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
`;

const fileContent = `'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {${upContent}
  },
  down: async (queryInterface, Sequelize) => {${downContent}
  }
};
`;

fs.writeFileSync(filepath, fileContent);
console.log('Created migration:', filepath);
