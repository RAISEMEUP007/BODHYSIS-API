import { Sequelize } from 'sequelize';

import sequelize from '../utils/database.js';

const PriceSeasons = sequelize.define('price_seasons', {
   id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
   },
   season: {
      type: Sequelize.INTEGER,
   },
   is_active: {
      type: Sequelize.BOOLEAN,
   },
}, {
   timestamps: false  // Disable timestamps
});

export default PriceSeasons;