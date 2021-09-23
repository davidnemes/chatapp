'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert("groupMembers", [{
      GroupId: 1,
      UserId: 1,
    }, {
      GroupId: 1,
      UserId: 2,
    }, {
      GroupId: 1,
      UserId: 3,
    },])
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('groupMembers', null, {});
  }
};
