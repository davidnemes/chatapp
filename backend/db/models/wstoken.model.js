'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class WsToken extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  WsToken.init({
    token: DataTypes.STRING,
    expiration: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'WsToken',
    timestamps: false
  });
  return WsToken;
};