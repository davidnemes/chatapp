'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PrivateMessage extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.PrivateConnection, {
        foreignKey: "connectionId",
      })
      this.belongsTo(models.User, {
        foreignKey: "userId",
      })
    }
  };
  PrivateMessage.init({
    connectionId: DataTypes.INTEGER,
    userId: DataTypes.INTEGER,
    message: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'PrivateMessage',
    tableName: 'privateMessages',
    timestamps: true,
    createdAt: "date",
    updatedAt: false,
  });
  return PrivateMessage;
};