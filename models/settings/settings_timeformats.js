import { Sequelize } from 'sequelize';

import sequelize from '../../utils/database.js';

const SettingsTimeformats = sequelize.define('settings_timeformats', {
   id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
   },
   timeformat: {
      type: Sequelize.STRING,
      allowNull: false,
   },
}, {
   timestamps: false
});

export default SettingsTimeformats;