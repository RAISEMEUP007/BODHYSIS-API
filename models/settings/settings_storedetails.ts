import { Sequelize } from 'sequelize';

import sequelize from '../../utils/database';
import SettingsTaxcodes from './settings_taxcodes';
import PriceBrands from '../price_brands';

const SettingsStoreDetails = sequelize.define('settings_storedetails', {
   id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
   },
   brand_id: {
      type: Sequelize.INTEGER,
   },
   store_name: {
      type: Sequelize.STRING,
   },
   store_url: {
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
   longitude: {
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
   cut_off_time: {
      type: Sequelize.STRING,
   },
   taxcode_id: {
      type: Sequelize.INTEGER,
   },
   store_wavier: {
      type: Sequelize.STRING,
   },
   document_id: {
      type: Sequelize.INTEGER,
   },
   is_document: {
      type: Sequelize.INTEGER,
   },
   pickup_time: {
      type: Sequelize.STRING,
   },
   dropoff_time: {
      type: Sequelize.STRING,
   },
   use_beach_address: {
      type: Sequelize.BOOLEAN,
   },
   email_confirmation: {
      type: Sequelize.STRING,
   },
   text_confirmation: {
      type: Sequelize.STRING,
   },
}, {
   timestamps: false
});
SettingsStoreDetails.belongsTo(SettingsTaxcodes, { foreignKey: 'taxcode_id', as: 'taxcodes' });
SettingsStoreDetails.belongsTo(PriceBrands, { foreignKey: 'brand_id', as: 'brands', sourceKey:'id' });
PriceBrands.hasOne(SettingsStoreDetails, { foreignKey: 'brand_id', as: 'storedetail', sourceKey: 'id' });

export default SettingsStoreDetails;