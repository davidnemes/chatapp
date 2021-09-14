'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('roles', [{
      role: 'user',
      weight: 10,
      createdAt: new Date(),
      updatedAt: new Date()
    },{
      role: 'moderator',
      weight: 20,
      createdAt: new Date(),
      updatedAt: new Date()
    },{
      role: 'admin',
      weight: 30,
      createdAt: new Date(),
      updatedAt: new Date()
    }], {})
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('roles', null, {});

  }
};
