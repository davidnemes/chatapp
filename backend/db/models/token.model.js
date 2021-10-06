'use strict';
const {
  Model
} = require('sequelize');

// this is a model for creating custom tokens

module.exports = (sequelize, DataTypes) => {
  class Token extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  Token.init({
    token: DataTypes.STRING,
    expiration: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Token',
    timestamps: false
  });
  return Token;
};