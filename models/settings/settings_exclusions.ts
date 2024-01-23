import { Sequelize } from 'sequelize';

import sequelize from '../../utils/database';

const SettingsExclusions = sequelize.define('settings_exclusions', {
   id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
   },
   discountcode_id: {
      type: Sequelize.INTEGER
   },
   description: {
      type: Sequelize.STRING,
   },
   from_date: {
      type: Sequelize.DATE,
   },
   to_date: {
      type: Sequelize.DATE,
   },
}, {
   timestamps: false
});


export default SettingsExclusions;