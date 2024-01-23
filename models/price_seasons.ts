import { DataTypes } from "sequelize";

import sequelize from '../utils/database';

const PriceSeasons = sequelize.define('price_seasons', {
   id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
   },
   season: {
      type: DataTypes.INTEGER,
   },
   is_active: {
      type: DataTypes.BOOLEAN,
   },
}, {
   timestamps: false  // Disable timestamps
});

export interface PriceSeasonType {
   id: number
   season: number
   is_active: boolean
}

export default PriceSeasons;