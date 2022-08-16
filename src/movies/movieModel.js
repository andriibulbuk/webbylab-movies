const { DataTypes, Model } = require('sequelize');
const sequelize = require('../utils/db');

class Movie extends Model {}
Movie.init(
  {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    year: {
      type: DataTypes.INTEGER
    },
    format: {
      type: DataTypes.STRING,
      allowNull: false
    }
  },
  {
    sequelize,
    tableName: 'movies',
    modelName: 'Movie'
  }
);

class Actor extends Model {}
Actor.init(
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    }
  },
  { sequelize, tableName: 'actors', modelName: 'Actor' }
);

Movie.belongsToMany(Actor, { through: 'actorMovies', as: 'actors' });
Actor.belongsToMany(Movie, { through: 'actorMovies' });

module.exports = { Movie, Actor };
