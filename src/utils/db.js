const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DATABASE,
  process.env.USERNAME,
  process.env.PASSWORD,
  {
    dialect: 'sqlite',
    storage: 'database.sqlite',
    host: process.env.HOST
  }
);

module.exports = sequelize;
