import { Sequelize } from 'sequelize';

import sequelize from '../../utils/database';

const SettingsDiscountCodes = sequelize.define('settings_discountcodes', {
   id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
   },
   code: {
      type: Sequelize.STRING,
   },
   type: {
      type: Sequelize.INTEGER,
   },
   amount: {
      type: Sequelize.INTEGER,
   },
   valid_start_date: {
      type: Sequelize.DATE,
   },
   valid_end_date: {
      type: Sequelize.DATE,
   },
}, {
   timestamps: false
});


export default SettingsDiscountCodes;