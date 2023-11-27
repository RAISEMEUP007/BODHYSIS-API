import { Sequelize } from 'sequelize';

import sequelize from '../utils/database.js';

const PricePoints = sequelize.define('price_points', {
   id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
   },
   duration: {
      type: Sequelize.INTEGER,
      allowNull: false,
   },
   duration_type: {
      type: Sequelize.INTEGER,
      allowNull: false,
   },
}, {
   timestamps: false  // Disable timestamps
});

export default PricePoints;