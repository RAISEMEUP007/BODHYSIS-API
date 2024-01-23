import { Sequelize } from 'sequelize';

import sequelize from '../../utils/database';

const SettingsLocations = sequelize.define('settings_locations', {
   id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
   },
   location: {
      type: Sequelize.STRING,
      allowNull: false,
   },
}, {
   timestamps: false
});


export default SettingsLocations;