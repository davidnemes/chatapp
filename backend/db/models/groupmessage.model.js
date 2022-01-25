'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class GroupMessage extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.Group, {
        foreignKey: "groupId",
      })
      this.belongsTo(models.User, {
        foreignKey: "userId",
      })
    }
  };
  GroupMessage.init({
    message: DataTypes.TEXT,
    groupId: DataTypes.INTEGER,
    userId: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'GroupMessage',
    tableName: 'groupMessages',
    timestamps: true,
    createdAt: "date",
    updatedAt: false,
  });
  return GroupMessage;
};