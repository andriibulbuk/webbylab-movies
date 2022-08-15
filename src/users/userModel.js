const { DataTypes, Model } = require('sequelize');
const sequelize = require('../utils/db');

class User extends Model {}
User.init(
  {
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        isEmail: true
      }
    },
    name: {
      type: DataTypes.STRING
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    }
  },
  { sequelize, tableName: 'users', modelName: 'User' }
);

module.exports = User;
