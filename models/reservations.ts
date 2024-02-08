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
    customer_id: {
      type: DataTypes.INTEGER,
    },
    brand_id: {
      type: DataTypes.INTEGER,
    },
    start_location_id: {
      type: DataTypes.INTEGER,
    },
    end_location_id: {
      type: DataTypes.INTEGER,
    },    
    start_date: {
      type: DataTypes.STRING,
    },
    end_date: {
      type: DataTypes.STRING,
    },
    items: {
      type: DataTypes.JSON,
    },
    promo_code: {
      type: DataTypes.STRING,
    },
    stage: {
      type: DataTypes.INTEGER,
    },
    note: {
      type: DataTypes.STRING,   
    }
  },
  {
    timestamps: true,
  }
);

export interface ReservationProductType {
  quantity: number;
  product_id: number;
  price: number;
  product_name: string;
}

export interface ReservationType {
  id: number;
  start_date: String;
  end_date: String;
  promo_code?: string;
  start_location_id: number;
  end_location_id: number;
  price_index: number;
  duration: number;
  products: Array<ReservationProductType>;
  customer_id: number;
  total_price: number;
}

export default Reservations;