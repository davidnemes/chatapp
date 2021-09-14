'use strict';

const bcrypt = require("bcrypt")

module.exports = {
  up: async (queryInterface, Sequelize) => {
    
    let encryptedPasswordDavid = await bcrypt.hash('isadmin', 10)
    let encryptedPasswordGuest = await bcrypt.hash('isguest', 10)

    await queryInterface.bulkInsert('users', [{
      username: 'david',
      password: encryptedPasswordDavid,
      roleId: 3,
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      username: 'guest',
      password: encryptedPasswordGuest,
      roleId: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    }], {})
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('users', null, {});
  }
};
