import { Sequelize } from 'sequelize';

import sequelize from '../../utils/database';
import SettingsExtras from './settings_extras';

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
SettingsProductCompatibilities.belongsTo(SettingsExtras, { foreignKey: 'extra_id', as: 'compatibilities' });
SettingsExtras.hasMany(SettingsProductCompatibilities, {
  foreignKey: 'extra_id',
  as: 'compatibilities'
});

export default SettingsProductCompatibilities;