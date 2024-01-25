import { Sequelize } from 'sequelize';

import sequelize from '../../utils/database';

const SettingsDateformats = sequelize.define('settings_dateformats', {
   id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
   },
   dateformat: {
      type: Sequelize.STRING,
      allowNull: false,
   },
}, {
   timestamps: false
});

export default SettingsDateformats;