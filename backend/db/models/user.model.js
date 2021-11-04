'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsToMany(models.Group, {
        through: models.GroupMember
      })
      this.hasMany(models.GroupMember, {
        as: "Membership"
      })
      this.hasMany(models.GroupMessage, {
        as: "Messages"
      })
    }
  };
  User.init({
    username: DataTypes.STRING,
    password: DataTypes.STRING,
    deleted: DataTypes.BOOLEAN,
    picName: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'User',
    tableName: "users"
  });
  return User;
};