'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('roles', [{
      role: 'Felhasználó',
      weight: 10,
      id: 1
    },{
      role: 'Moderátor',
      weight: 20,
      id: 2
    },{
      role: 'Alapító',
      weight: 30,
      id: 3
    }], {})
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('roles', null, {});

  }
};
