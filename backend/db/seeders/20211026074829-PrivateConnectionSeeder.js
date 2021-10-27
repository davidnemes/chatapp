'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('privateConnections', [{
      userId_1: 1,
      userId_2: 3,
      status: "stable",
      createdAt: new Date(),
      updatedAt: new Date(),
    }, {
      userId_1: 2,
      userId_2: 1,
      status: "stable",
      createdAt: new Date(),
      updatedAt: new Date(),
    }], {})
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('privateConnections', null, {});
  }
};
