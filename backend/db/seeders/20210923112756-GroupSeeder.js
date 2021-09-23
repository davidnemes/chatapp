'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {

    await queryInterface.bulkInsert('groups', [{
      title: 'Public',
      isPrivate: false,
      createdAt: new Date(),
    }], {})
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('groups', null, {});
  }
};
