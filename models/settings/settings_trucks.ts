import { Sequelize } from 'sequelize';

import sequelize from '../../utils/database';

const SettingsTrucks = sequelize.define('settings_trucks', {
   id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
   },
   name: {
      type: Sequelize.STRING,
   },
   short_name: {
      type: Sequelize.STRING,
   },
   barcode: {
      type: Sequelize.STRING,
   },
   license_plate: {
      type: Sequelize.STRING,
   },
   max_capacity: {
      type: Sequelize.INTEGER,
   },
   hhi_resort: {
      type: Sequelize.STRING,
   },
   ocean1: {
      type: Sequelize.STRING,
   },
   pd_pass: {
      type: Sequelize.STRING,
   },
   sp_pass: {
      type: Sequelize.STRING,
   },
   sy_pass: {
      type: Sequelize.STRING,
   },
   notes: {
      type: Sequelize.STRING,
   },
}, {
   timestamps: false
});


export default SettingsTrucks;