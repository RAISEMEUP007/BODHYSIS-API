import { DataTypes } from "sequelize";

import sequelize from '../../utils/database';
import ProductCategories from './product_categories.js';
import ProductFamilies from './product_families.js';
import ProductLines from './product_lines.js';
import SettingsLocations from '../settings/settings_locations.js';

const ProductProducts = sequelize.define('product_products', {
   id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
   },
   product: {
      type: DataTypes.INTEGER,
      allowNull: false,
   },
   category_id: {
      type: DataTypes.INTEGER,
   },
   family_id: {
      type: DataTypes.INTEGER,
   },
   line_id: {
      type: DataTypes.INTEGER,
   },
   size: {
      type: DataTypes.STRING,
   },
   quantity: {
      type: DataTypes.STRING, 
   }, 
   description: {
      type: DataTypes.STRING,
   },
   item_id: {
      type: DataTypes.STRING,
   },
   barcode: {
      type: DataTypes.STRING,
   },
   serial_number: {
      type: DataTypes.STRING,
   },
   home_location: {
      type: DataTypes.INTEGER,
   },
   current_location: {
      type: DataTypes.INTEGER,
   },
   status: {
      type: DataTypes.INTEGER,
   },
}, {
   timestamps: false
});

export interface ProductType {
   id: number;
   product: string
   category_id: number
   family_id: number
   line_id: number
   size: number
   quantity: number
   description: number
   item_id: number
   barcode: string
   serial_number: string
   home_location: number
   current_location: number
   price_group_id: number
   status: number
}

ProductProducts.belongsTo(ProductCategories, { foreignKey: 'category_id', as: 'category' });
ProductProducts.belongsTo(ProductFamilies, { foreignKey: 'family_id', as: 'family' });
ProductProducts.belongsTo(ProductLines, { foreignKey: 'line_id', as: 'line' });
ProductProducts.belongsTo(SettingsLocations, { foreignKey: 'home_location', as: 'home_location_tbl' });
ProductProducts.belongsTo(SettingsLocations, { foreignKey: 'current_location', as: 'current_location_tbl' });
ProductFamilies.hasMany(ProductProducts, { foreignKey: 'family_id', as: 'products' });

export default ProductProducts;