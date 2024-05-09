import { Sequelize } from 'sequelize';

import sequelize from '../../utils/database';

const SettingsExtras = sequelize.define('settings_extras', {
   id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
   },
   level: {
      type: Sequelize.INTEGER,
   },
   name: {
      type: Sequelize.STRING,
      allowNull: false,
   },
   description: {
      type: Sequelize.STRING,
      allowNull: false,
   },
   status: {
      type: Sequelize.BOOLEAN,
   },
   option: {
      type: Sequelize.INTEGER,
   },
   fixed_price: {
      type: Sequelize.FLOAT,
   },
   price_group_id: {
      type: Sequelize.INTEGER,
   },
   img_url: {
      type: Sequelize.STRING,
   },
   is_visible_online: {
      type: Sequelize.BOOLEAN,
   },
   is_default_selected: {
      type: Sequelize.BOOLEAN,
   },
   is_online_mandatory: {
      type: Sequelize.BOOLEAN,
   },
   is_apply_tax: {
      type: Sequelize.BOOLEAN,
   },
   is_apply_discounts: {
      type: Sequelize.BOOLEAN,
   },
   brand_ids: {
      type: Sequelize.STRING,
   },
}, {
   timestamps: false
});

export default SettingsExtras;