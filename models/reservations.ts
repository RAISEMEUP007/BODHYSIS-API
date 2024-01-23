import { DataTypes } from "sequelize";

import sequelize from "../utils/database";

const Reservations = sequelize.define(
  "reservation",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    start_date: {
      type: DataTypes.STRING,
    },
    end_date: {
      type: DataTypes.STRING,
    },
    promo_code: {
      type: DataTypes.STRING,
    },
    start_location_id: {
      type: DataTypes.INTEGER,
    },
    end_location_id: {
      type: DataTypes.INTEGER,
    },
    products: {
      type: DataTypes.JSON,
    },
    customer_id: {
      type: DataTypes.INTEGER,
    },
  },
  {
    timestamps: true,
  }
);

export interface ReservationType {
  id: Number;
  start_date: String
  end_date: String
  promo_code?: string
  start_location_id: number;
  end_location_id: number
  products: Array<{quantity: number, product_id: number}>
  customer_id: number
}

export default Reservations;
