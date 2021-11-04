'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {

    await queryInterface.bulkInsert('groups', [{
      title: 'Általános',
      isPrivate: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }, {
      title: 'Privát csoport',
      isPrivate: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }], {})
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('groups', null, {});
  }
};
