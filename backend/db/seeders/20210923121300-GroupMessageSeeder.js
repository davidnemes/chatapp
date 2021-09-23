'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('groupMessages', [{
      userId: 1,
      groupId: 1,
      date: new Date(Date.now() + (60 * 1000)),
      message: "Sziasztok!"
    }, {
      userId: 2,
      groupId: 1,
      date: new Date(Date.now() + (3 * 60 * 1000)),
      message: "Hali"
    }], {})

  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('groupMessages', null, {});
  }
};
