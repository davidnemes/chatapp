'use strict';

const bcrypt = require("bcrypt")

module.exports = {
  up: async (queryInterface, Sequelize) => {
    
    let encryptedPasswordDavid = await bcrypt.hash('isadmin', 10)
    let encryptedPasswordGuest = await bcrypt.hash('isguest', 10)
    let encryptedPasswordFriend = await bcrypt.hash('isfriend', 10)

    await queryInterface.bulkInsert('users', [{
      username: 'david',
      password: encryptedPasswordDavid,
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      username: 'guest',
      password: encryptedPasswordGuest,
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      username: 'friend',
      password: encryptedPasswordFriend,
      createdAt: new Date(),
      updatedAt: new Date()
    }], {})
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('users', null, {});
  }
};
