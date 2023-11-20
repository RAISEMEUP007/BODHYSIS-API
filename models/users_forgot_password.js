import { Sequelize } from 'sequelize';

import sequelize from '../utils/database.js';

const UserForgotPassword = sequelize.define('users_forgot_passowrds', {
   id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
      unsigned: true,
   },
   user_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
   },
   recover_id: {
      type: Sequelize.STRING,
      allowNull: false,
   },
   client_direction: {
      type: Sequelize.STRING,
   },
   expire_date: {
      type: Sequelize.DATE,
   },
   is_expired: {
      type: Sequelize.TINYINT,
   },
}, {
   timestamps: false  // Disable timestamps
 });
 

export default UserForgotPassword;