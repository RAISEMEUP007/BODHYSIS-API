import { DataTypes } from "sequelize";

import sequelize from '../utils/database';

const PriceTables = sequelize.define('price_tables', {
   id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
   },
   table_name: {
      type: DataTypes.INTEGER,
   },
}, {
   timestamps: false  // Disable timestamps
});


export interface PriceTableType {
   id: number;
   table_name: number
}

export default PriceTables;