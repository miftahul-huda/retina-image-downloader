'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('GoogleUsers', 'isAdmin', {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
            allowNull: false
        });

        // Set miftahul.huda@devoteam.com as admin and authorized
        await queryInterface.sequelize.query(`
      UPDATE "GoogleUsers" 
      SET "isAdmin" = true, "isAuthorized" = true 
      WHERE email = 'miftahul.huda@devoteam.com'
    `);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('GoogleUsers', 'isAdmin');
    }
};
