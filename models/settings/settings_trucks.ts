import { Sequelize } from 'sequelize';

import sequelize from '../../utils/database';

const SettingsTrucks = sequelize.define('settings_trucks', {
   id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
   },
   name: {
      type: Sequelize.STRING,
   },
   short_name: {
      type: Sequelize.STRING,
   },
   barcode: {
      type: Sequelize.STRING,
   },
}, {
   timestamps: false
});


export default SettingsTrucks;