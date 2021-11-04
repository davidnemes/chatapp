'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class GroupMember extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // this table is supposed to be a pivot
      this.belongsTo(models.User, {
        foreignKey: "UserId"
      })
      this.belongsTo(models.Group, {
        foreignKey: "GroupId"
      })
      this.belongsTo(models.Role, {
        foreignKey: "RoleId"
      })
    }
  };
  GroupMember.init({
    GroupId: DataTypes.INTEGER,
    UserId: DataTypes.INTEGER,
    RoleId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'GroupMember',
    timestamps: false,
  });
  return GroupMember;
};