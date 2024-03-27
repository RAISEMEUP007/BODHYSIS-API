import { DataTypes } from "sequelize";
import sequelize from "../../utils/database";

enum SettingsTemplatesTypes {
  Delivery = "delivery",
}

const SettingsTemplates = sequelize.define("settings_templates", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,    
  },
});

export default SettingsTemplates;
