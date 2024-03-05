import { DataTypes } from "sequelize";

import sequelize from "../../utils/database";
import ReservationItems from './reservation_items.ts';
import SettingsExtras from '../settings/settings_extras.ts';

const ReservationItemsExtras = sequelize.define(
  "reservation_items_extras",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    item_id: {
      type: DataTypes.INTEGER,
    },
    extra_id: {
      type: DataTypes.INTEGER,
    },
  },
  {
    timestamps: false,
  }
);

ReservationItemsExtras.belongsTo(ReservationItems, { foreignKey: 'item_id', as: 'reservation_items' });
ReservationItems.hasMany(ReservationItemsExtras, { foreignKey: 'item_id', as: 'item_extras' });

ReservationItemsExtras.belongsTo(SettingsExtras, { foreignKey: 'extra_id', as: 'extras' });

export default ReservationItemsExtras;
