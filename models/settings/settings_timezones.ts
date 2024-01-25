import { Sequelize } from 'sequelize';

import sequelize from '../../utils/database';

const SettingsTimezones = sequelize.define('settings_timezones', {
   id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
   },
   timezone: {
      type: Sequelize.STRING,
      allowNull: false,
   },
}, {
   timestamps: false
});

export default SettingsTimezones;