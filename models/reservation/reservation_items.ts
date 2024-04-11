import { DataTypes } from "sequelize";

import sequelize from "../../utils/database";
import Reservations from './reservations.ts';
import ProductFamilies from '../product/product_families.ts';

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
    family_id: {
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

ReservationItems.belongsTo(ProductFamilies, { foreignKey: 'family_id', as: 'families' });

export default ReservationItems;
