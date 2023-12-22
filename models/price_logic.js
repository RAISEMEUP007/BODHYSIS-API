import { Sequelize } from 'sequelize';

import sequelize from '../utils/database.js';
import PriceBrands from './price_brands.js';
import PriceSeasons from './price_seasons.js';
import PriceTables from './price_tables.js';

const PriceLogic = sequelize.define('price_logic', {
   id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
   },
   brand_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
   },
   season_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
   },
   table_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
   },
   start_date: {
      type: Sequelize.DATE,
   },
   end_date: {
      type: Sequelize.DATE,
   },
}, {
   timestamps: false,
   tableName: 'price_logic' 
});

PriceLogic.belongsTo(PriceBrands, { foreignKey: 'brand_id', as: 'brand' });
PriceLogic.belongsTo(PriceSeasons, { foreignKey: 'season_id', as: 'season' });
PriceLogic.belongsTo(PriceTables, { foreignKey: 'table_id', as: 'priceTable' });

export default PriceLogic;