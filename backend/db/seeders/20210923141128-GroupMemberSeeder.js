'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert("groupMembers", [
    // Public
    {
      GroupId: 1,
      UserId: 1,
      roleId: 3,
    }, {
      GroupId: 1,
      UserId: 2,
      roleId: 1,
    }, {
      GroupId: 1,
      UserId: 3,
      roleId: 2
    },
    // Private group
    {
      GroupId: 2,
      UserId: 1,
      roleId: 3,
    }, {
      GroupId: 2,
      UserId: 3,
      roleId: 1,
    }])
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('groupMembers', null, {});
  }
};
