import { Sequelize } from 'sequelize';

import sequelize from '../../utils/database';

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
   timestamps: false
});


export default SettingsTags;