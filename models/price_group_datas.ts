import { Sequelize } from 'sequelize';
import { DataTypes } from "sequelize";

import sequelize from '../utils/database';

const PriceGroupDatas = sequelize.define('price_group_datas', {
   id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
   },
   group_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
   },
   table_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
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

export default PriceGroupDatas;