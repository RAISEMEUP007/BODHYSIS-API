import { Sequelize, DataTypes } from "sequelize";

import sequelize from "../utils/database.js";

const Reservation = sequelize.define(
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
  },
  {
    timestamps: true,
  }
);

export default Reservation;
