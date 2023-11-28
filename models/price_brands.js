import { Sequelize } from 'sequelize';

import sequelize from '../utils/database.js';

const PriceBrands = sequelize.define('price_brands', {
   id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
   },
   brand: {
      type: Sequelize.INTEGER,
   },
}, {
   timestamps: false  // Disable timestamps
});

export default PriceBrands;