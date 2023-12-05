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
   table_id: {
      type: Sequelize.INTEGER,
      allowNull: true,
   },
   is_free: {
      type: Sequelize.BOOLEAN,
   },
   extra_day: {
      type: Sequelize.INTEGER,
   },
}, {
   timestamps: false  // Disable timestamps
});

export default PriceGroup;