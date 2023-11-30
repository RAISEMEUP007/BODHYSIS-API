import { Sequelize } from 'sequelize';

import sequelize from '../utils/database.js';

const PriceTables = sequelize.define('price_tables', {
   id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
   },
   table_name: {
      type: Sequelize.INTEGER,
   },
}, {
   timestamps: false  // Disable timestamps
});

export default PriceTables;