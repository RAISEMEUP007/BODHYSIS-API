import { Sequelize } from 'sequelize';

import sequelize from '../../utils/database.js';
import SettingsLocations from './settings_locations.js';
import SettingsCountries from './settings_countries.js';
import SettingsLanguages from './settings_languages.js';

const SettingsCustomers = sequelize.define('settings_customers', {
   id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
   },
   first_name: {
      type: Sequelize.STRING,
      allowNull: false,
   },
   last_name: {
      type: Sequelize.STRING,
      allowNull: false,
   },
   email: {
      type: Sequelize.STRING,
      allowNull: false,
   },
   phone_number: {
      type: Sequelize.STRING,
      allowNull: false,
   },
   home_address: {
      type: Sequelize.STRING,
      allowNull: false,
   },
   city: {
      type: Sequelize.STRING,
      allowNull: false,
   },
   state: {
      type: Sequelize.STRING,
      allowNull: false,
   },
   zipcode: {
      type: Sequelize.STRING,
      allowNull: false,
   },
   mobile_phone: {
      type: Sequelize.STRING,
      allowNull: false,
   },
   country_id: {
      type: Sequelize.STRING,
      allowNull: false,
   },
   language_id: {
      type: Sequelize.STRING,
      allowNull: false,
   },
   home_location: {
      type: Sequelize.STRING,
      allowNull: false,
   },
   delivery_street_number: {
      type: Sequelize.STRING,
      allowNull: false,
   },
   delivery_street_property_name: {
      type: Sequelize.STRING,
      allowNull: false,
   },
   delivery_area_plantation: {
      type: Sequelize.STRING,
      allowNull: false,
   },
   marketing_opt_in: {
      type: Sequelize.STRING,
      allowNull: false,
   },
},);

SettingsCustomers.belongsTo(SettingsCountries, { foreignKey: 'country_id', as: 'country' });
SettingsCustomers.belongsTo(SettingsLanguages, { foreignKey: 'language_id', as: 'language' });
SettingsCustomers.belongsTo(SettingsLocations, { foreignKey: 'home_location', as: 'home_location_tbl' });

export default SettingsCustomers;