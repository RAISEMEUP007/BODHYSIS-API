import { Sequelize } from 'sequelize';

import sequelize from '../utils/database.js';

const PriceGroup = sequelize.define('price_groups', {
   id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
   },
   price_group: {
      type: Sequelize.STRING,
      allowNull: false,
   },
}, {
   timestamps: false  // Disable timestamps
 });

export default PriceGroup;