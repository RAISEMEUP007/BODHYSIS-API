import { Sequelize } from 'sequelize';

import sequelize from '../../utils/database.js';

const SettingsStoreDetails = sequelize.define('settings_storedetails', {
   id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
   },
   store_name: {
      type: Sequelize.STRING,
   },
   language_id: {
      type: Sequelize.INTEGER,
   },
   logo_url: {
      type: Sequelize.STRING,
   },
   address_line1: {
      type: Sequelize.STRING,
   },
   address_line2: {
      type: Sequelize.STRING,
   },
   city: {
      type: Sequelize.STRING,
   },
   state: {
      type: Sequelize.STRING,
   },
   postal_code: {
      type: Sequelize.STRING,
   },
   latitude: {
      type: Sequelize.FLOAT,
   },
   longitutde: {
      type: Sequelize.FLOAT,
   },
   phone_number: {
      type: Sequelize.STRING,
   },
   country_id: {
      type: Sequelize.INTEGER,
   },
   primary_language_id: {
      type: Sequelize.INTEGER,
   },
   timezone_id: {
      type: Sequelize.INTEGER,
   },
   currency_id: {
      type: Sequelize.INTEGER,
   },
   date_format: {
      type: Sequelize.STRING,
   },
   time_format: {
      type: Sequelize.STRING,
   },
   week_start_day: {
      type: Sequelize.STRING,
   },
   sales_tax: {
      type: Sequelize.FLOAT,
   },
   store_wavier: {
      type: Sequelize.STRING,
   },
}, {
   timestamps: false
});


export default SettingsStoreDetails;