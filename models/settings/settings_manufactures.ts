import { Sequelize } from 'sequelize';

import sequelize from '../../utils/database';

const SettingsManufactures = sequelize.define('settings_manufactures', {
   id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
   },
   manufacture: {
      type: Sequelize.STRING,
      allowNull: false,
   },
   description: {
      type: Sequelize.STRING,
   },
}, {
   timestamps: false
});


export default SettingsManufactures;