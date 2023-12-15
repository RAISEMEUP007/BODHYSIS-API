import { Sequelize } from 'sequelize';

import sequelize from '../../utils/database.js';

const SettingsCountries = sequelize.define('settings_countries', {
   id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
   },
   country: {
      type: Sequelize.STRING,
      allowNull: false,
   },
}, {
   timestamps: false  // Disable timestamps
});


export default SettingsCountries;