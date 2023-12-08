import { Sequelize } from 'sequelize';

import sequelize from '../../utils/database.js';

const SettingsTags = sequelize.define('settings_tags', {
   id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
   },
   tag: {
      type: Sequelize.STRING,
      allowNull: false,
   },
}, {
   timestamps: false  // Disable timestamps
});


export default SettingsTags;