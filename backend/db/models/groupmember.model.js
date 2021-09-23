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
    }
  };
  GroupMember.init({}, {
    sequelize,
    modelName: 'GroupMember',
    timestamps: false,
  });
  return GroupMember;
};