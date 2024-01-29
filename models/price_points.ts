import { Sequelize } from 'sequelize';

import sequelize from '../utils/database';

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
   table_id: {
      type: Sequelize.INTEGER,
      allowNull: true,
   },
   duration_type: {
      type: Sequelize.INTEGER,
      allowNull: false,
   },
}, {
   timestamps: false  // Disable timestamps
});

export default PricePoints;