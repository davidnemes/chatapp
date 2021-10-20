'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {

    await queryInterface.bulkInsert('groups', [{
      title: 'Public',
      isPrivate: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }, {
      title: 'Mods',
      isPrivate: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }], {})
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('groups', null, {});
  }
};
