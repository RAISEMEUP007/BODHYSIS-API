import { DataTypes } from "sequelize";

import sequelize from "../../utils/database";

const SettingsLocations = sequelize.define(
  "settings_locations",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    location: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    timestamps: false,
  }
);

export type SettingsLocationType = {
  id: number;
  location: string;
};

export default SettingsLocations;
