import { DataTypes } from "sequelize";

import sequelize from "../../utils/database";
import ReservationItems from './reservation_items.ts';
import CustomerCustomers from "../customer/customer_customers";

const Reservations = sequelize.define(
  "reservations",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    // customer_id: {
    //   type: DataTypes.INTEGER,
    // },
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
    promo_code: {
      type: DataTypes.STRING,
    },
    stage: {
      type: DataTypes.INTEGER,
    },
    note: {
      type: DataTypes.STRING,
    },
    subtotal: {
      type: DataTypes.FLOAT,
    },
    discount_amount: {
      type: DataTypes.FLOAT,
    },
    tax_rate: {
      type: DataTypes.FLOAT,
    },
    tax_amount: {
      type: DataTypes.FLOAT,
    },
    total_price: {
      type: DataTypes.FLOAT,
    },
    price_table_id: {
      type: DataTypes.INTEGER,
    },
    paid: {
      type: DataTypes.FLOAT,
    },
  },
  {
    timestamps: true,
  }
);
// Reservations.hasMany(ReservationItems, { foreignKey: 'reservation_id', as: 'reservationItems' });

Reservations.belongsTo(CustomerCustomers,{
  foreignKey: 'customer_id',
  as : 'customer'
})
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
