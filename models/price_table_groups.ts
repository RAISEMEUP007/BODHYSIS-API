import { Sequelize } from 'sequelize';
import { DataTypes } from "sequelize";

import sequelize from '../utils/database';
import PriceGroup from './price_group.js';
import PriceTables from './price_tables.js';

const PriceTableGroups = sequelize.define('price_table_groups', {
   id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
   },
   is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
   },
   table_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
   },
   group_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
   },
   is_free: {
      type: DataTypes.BOOLEAN,
   },
   extra_day: {
      type: DataTypes.INTEGER,
   },
   cloned_id: {
      type: DataTypes.INTEGER,
   },
}, {
   timestamps: false  // Disable timestamps
});
PriceTableGroups.belongsTo(PriceGroup, { foreignKey: 'table_id', as: 'pricegroup' });
PriceGroup.hasMany(PriceTableGroups, { foreignKey: 'group_id', as: 'price_table_group' });

PriceTableGroups.belongsTo(PriceTables, { foreignKey: 'group_id', as: 'pricetable' });

export default PriceTableGroups;