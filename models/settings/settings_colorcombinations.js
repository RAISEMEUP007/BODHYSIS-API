import { Sequelize } from 'sequelize';

import sequelize from '../../utils/database';

const SettingsColorcombinations = sequelize.define('settings_colorcombinations', {
   id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
   },
   color_key: {
      type: Sequelize.STRING,
      allowNull: false,
   },
   combination: {
      type: Sequelize.INTEGER,
   },
   color: {
      type: Sequelize.STRING,
   },
}, {
   timestamps: false
});

export default SettingsColorcombinations;