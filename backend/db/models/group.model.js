'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Group extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsToMany(models.User, {
        through: models.GroupMember
      })
      this.hasMany(models.GroupMessage, {
        as: "Messages"
      })
    }
  };
  Group.init({
    title: DataTypes.STRING,
    isPrivate: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Group',
  });
  return Group;
};