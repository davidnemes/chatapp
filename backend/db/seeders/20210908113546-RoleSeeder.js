'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('roles', [{
      role: 'user',
      weight: 10,
    },{
      role: 'moderator',
      weight: 20,
    },{
      role: 'admin',
      weight: 30,
    }], {})
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('roles', null, {});

  }
};
