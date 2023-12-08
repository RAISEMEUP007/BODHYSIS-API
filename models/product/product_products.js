import { Sequelize } from 'sequelize';

import sequelize from '../../utils/database.js';
import ProductCategories from './product_categories.js';
import ProductFamilies from './product_families.js';
import ProductLines from './product_lines.js';

const ProductProducts = sequelize.define('product_products', {
   id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
   },
   product: {
      type: Sequelize.STRING,
      allowNull: false,
   },
   category_id: {
      type: Sequelize.INTEGER,
   },
   family_id: {
      type: Sequelize.INTEGER,
   },
   line_id: {
      type: Sequelize.INTEGER,
   },
   size: {
      type: Sequelize.STRING,
   },
   quantity: {
      type: Sequelize.STRING, 
   }, 
   description: {
      type: Sequelize.STRING,
   },
   item_id: {
      type: Sequelize.STRING,
   },
   barcode: {
      type: Sequelize.STRING,
   },
   serial_number: {
      type: Sequelize.STRING,
   },
   home_location: {
      type: Sequelize.STRING,
   },
   current_location: {
      type: Sequelize.STRING,
   },
   price_group_id: {
      type: Sequelize.INTEGER,
   },
   status: {
      type: Sequelize.INTEGER,
   },
}, {
   timestamps: false
});

ProductProducts.belongsTo(ProductCategories, { foreignKey: 'category_id', as: 'category' });
ProductProducts.belongsTo(ProductFamilies, { foreignKey: 'family_id', as: 'family' });
ProductProducts.belongsTo(ProductLines, { foreignKey: 'line_id', as: 'line' });


export default ProductProducts;