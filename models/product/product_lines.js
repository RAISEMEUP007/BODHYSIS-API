import { Sequelize } from 'sequelize';

import sequelize from '../../utils/database.js';
import ProductCategories from './product_categories.js';
import ProductFamilies from './product_families.js';

const ProductLines = sequelize.define('product_lines', {
   id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
   },
   line: {
      type: Sequelize.STRING,
      allowNull: false,
   },
   category_id: {
      type: Sequelize.INTEGER,
   },
   family_id: {
      type: Sequelize.INTEGER,
   },
   size: {
      type: Sequelize.INTEGER,
   },
   suitability: {
       type: Sequelize.STRING,
   },
   holdback: {
      type: Sequelize.INTEGER,
   },
   shortcode: {
      type: Sequelize.STRING,
   },
   price_group_id: {
      type: Sequelize.INTEGER,
   },
}, {
   timestamps: false
});

ProductLines.belongsTo(ProductCategories, { foreignKey: 'category_id', as: 'category' });
ProductLines.belongsTo(ProductFamilies, { foreignKey: 'family_id', as: 'family' });


export default ProductLines;