import { Sequelize } from 'sequelize';

import sequelize from '../../utils/database';

const SettingsCurrencies = sequelize.define('settings_currencies', {
   id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
   },
   currency: {
      type: Sequelize.STRING,
      allowNull: false,
   },
}, {
   timestamps: false
});


export default SettingsCurrencies;