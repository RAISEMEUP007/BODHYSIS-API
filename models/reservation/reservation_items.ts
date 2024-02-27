import { DataTypes } from "sequelize";

import sequelize from "../../utils/database";
import Reservations from './reservations.ts';
import ProductLines from '../product/product_lines.ts';

const ReservationItems = sequelize.define(
  "reservation_items",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    reservation_id: {
      type: DataTypes.INTEGER,
    },
    line_id: {
      type: DataTypes.INTEGER,
    },
    price_group_id: {
      type: DataTypes.INTEGER,
    },
    quantity: {
      type: DataTypes.INTEGER,
    },
    price: {
      type: DataTypes.FLOAT,
    },
  },
  {
    timestamps: true,
  }
);

ReservationItems.belongsTo(Reservations, { foreignKey: 'reservation_id', as: 'reservations' });
Reservations.hasMany(ReservationItems, { foreignKey: 'reservation_id', as: 'items' });

ReservationItems.belongsTo(ProductLines, { foreignKey: 'line_id', as: 'lines' });

export default ReservationItems;
