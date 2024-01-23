import { DataTypes } from "sequelize";

import sequelize from '../utils/database';
import PriceBrands from './price_brands.js';
import PriceSeasons from './price_seasons.ts';
import PriceTables from './price_tables.js';

const PriceLogic = sequelize.define('price_logic', {
   id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
   },
   brand_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
   },
   season_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
   },
   table_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
   },
   start_date: {
      type: DataTypes.DATE,
   },
   end_date: {
      type: DataTypes.DATE,
   },
}, {
   timestamps: false,
   tableName: 'price_logic' 
});

PriceLogic.belongsTo(PriceBrands, { foreignKey: 'brand_id', as: 'brand' });
PriceLogic.belongsTo(PriceSeasons, { foreignKey: 'season_id', as: 'season' });
PriceLogic.belongsTo(PriceTables, { foreignKey: 'table_id', as: 'priceTable' });

export interface PriceLogicType {
   id: number
   brand_id: number
   season_id: number
   table_id: number
   start_date: string
   end_date: string
}

export default PriceLogic;