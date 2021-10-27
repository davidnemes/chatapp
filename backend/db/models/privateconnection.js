'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PrivateConnection extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // couldn't associate both user ids to User
      // User is queried seperately
    }
  };
  PrivateConnection.init({
    userId_1: DataTypes.INTEGER,
    userId_2: DataTypes.INTEGER,
    status: DataTypes.ENUM("pending", "stable", "deleted")
  }, {
    sequelize,
    modelName: 'PrivateConnection',
    tableName: "privateConnections"
  });
  return PrivateConnection;
};