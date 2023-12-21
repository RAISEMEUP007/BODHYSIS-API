import { Sequelize } from 'sequelize';

import sequelize from '../../utils/database.js';

const SettingsReservationTypes = sequelize.define('settings_reservation_types', {
   id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
   },
   name: {
      type: Sequelize.STRING,
      allowNull: false,
   },
   start_stage: {
      type: Sequelize.INTEGER,
   },
   img_url: {
      type: Sequelize.STRING,
   },
   print_size: {
      type: Sequelize.INTEGER,
   },
}, {
   timestamps: false
});

export default SettingsReservationTypes;