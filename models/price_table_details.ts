import { Sequelize } from 'sequelize';
import { DataTypes } from "sequelize";

import sequelize from '../utils/database';

const PriceTableDetails = sequelize.define('price_table_details', {
   id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
   },
   table_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
   },
   group_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
   },
   point_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
   },
   value: {
      type: DataTypes.INTEGER,
      allowNull: false,
   },
}, {
   timestamps: false  // Disable timestamps
});


export interface PriceGroupDataType {
   id: number
   group_id: number
   table_id: number
   point_id: number
   value: Array<number>
}

export default PriceTableDetails;