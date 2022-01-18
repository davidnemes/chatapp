'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert("groupMembers", [
    // Public
    {
      GroupId: 1,
      UserId: 1,
      roleId: 3,
      status: "stable",
    }, {
      GroupId: 1,
      UserId: 2,
      roleId: 1,
      status: "stable",
    }, {
      GroupId: 1,
      UserId: 3,
      roleId: 2,
      status: "stable",
    },
    // Private group
    {
      GroupId: 2,
      UserId: 1,
      roleId: 3,
      status: "stable",
    }, {
      GroupId: 2,
      UserId: 3,
      roleId: 1,
      status: "stable",
    }])
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('groupMembers', null, {});
  }
};
