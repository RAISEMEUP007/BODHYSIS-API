import { Sequelize } from 'sequelize';

import sequelize from '../../utils/database';

const SettingsProductCompatibilities = sequelize.define('settings_productcompatibilities', {
   id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
   },
   display_name: {
      type: Sequelize.STRING,
   },
   extra_id: {
      type: Sequelize.INTEGER,
   },
   is_connected: {
      type: Sequelize.BOOLEAN,
   },
}, {
   timestamps: false
});

export default SettingsProductCompatibilities;