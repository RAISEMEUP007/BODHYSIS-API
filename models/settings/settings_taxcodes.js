import { Sequelize } from 'sequelize';

import sequelize from '../../utils/database.js';

const SettingsTaxcodes = sequelize.define('settings_taxcodes', {
   id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
   },
   code: {
      type: Sequelize.STRING,
      allowNull: false,
   },
   description: {
      type: Sequelize.STRING,
   },
   rate: {
      type: Sequelize.FLOAT,
   },
   is_suspended: {
      type: Sequelize.BOOLEAN,
   },
}, {
   timestamps: false
});


export default SettingsTaxcodes;