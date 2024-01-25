import { Sequelize } from 'sequelize';

import sequelize from '../../utils/database';
import SettingsCountries from '../settings/settings_countries.js';

const CustomerDeliveryAddress = sequelize.define('customer_delivery_address', {
   id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
   },
   customer_id: {
      type: Sequelize.INTEGER,
   },
   address1: {
      type: Sequelize.STRING,
   },
   address2: {
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
   country_id: {
      type: Sequelize.STRING,
   },
   is_used: {
      type: Sequelize.BOOLEAN,
   },
}, {
   timestamps: false,
   tableName: 'customer_delivery_address' 
});

CustomerDeliveryAddress.belongsTo(SettingsCountries, { foreignKey: 'country_id', as: 'country' });

export default CustomerDeliveryAddress;