import { Sequelize } from 'sequelize';

import sequelize from '../../utils/database';

const SettingsLanguages = sequelize.define('settings_languages', {
   id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
   },
   language: {
      type: Sequelize.STRING,
      allowNull: false,
   },
}, {
   timestamps: false
});


export default SettingsLanguages;