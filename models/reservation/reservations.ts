import { DataTypes } from "sequelize";

import sequelize from "../../utils/database";
import ReservationItems from './reservation_items.ts';
import CustomerCustomers from '../customer/customer_customers';
import SettingsColorcombinations from '../settings/settings_colorcombinations';
import AllAddresses from '../all_addresses';

const Reservations = sequelize.define(
  "reservations",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    order_number: {
      type: DataTypes.STRING,
    },
    brand_id: {
      type: DataTypes.INTEGER,
    },
    start_date: {
      type: DataTypes.DATE,
    },
    end_date: {
      type: DataTypes.DATE,
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
    color_id: {
      type: DataTypes.INTEGER,
    },
    paid: {
      type: DataTypes.FLOAT,
    },
    address_id: {
      type: DataTypes.INTEGER,
    },
    use_manual: {
      type: DataTypes.BOOLEAN,
    },
    manual_address: {
      type: DataTypes.STRING,
    },
    email: {
      type: DataTypes.STRING,
    },
    phone_number: {
      type: DataTypes.STRING,
    },
    driver_tip: {
      type: DataTypes.FLOAT,
    },
    textSent: {
      type: DataTypes.BOOLEAN,
    },
  },
  {
    timestamps: true,
  }
);
// Reservations.hasMany(ReservationItems, { foreignKey: 'reservation_id', as: 'reservationItems' });
Reservations.belongsTo(SettingsColorcombinations, { foreignKey: 'color_id', as: 'color' });

Reservations.belongsTo(CustomerCustomers,{
  foreignKey: 'customer_id',
  as : 'customer'
})
Reservations.belongsTo(AllAddresses,{
  foreignKey: 'address_id',
  as : 'all_addresses'
})

export default Reservations;
