import { Sequelize } from 'sequelize';

import sequelize from '../../utils/database';
import ProductCategories from './product_categories.js';
import ProductLines from './product_lines.js';

const ProductFamilies = sequelize.define('product_families', {
   id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
   },
   family: {
      type: Sequelize.STRING,
      allowNull: false,
   },
   display_name: {
      type: Sequelize.STRING,
   },
   category_id: {
      type: Sequelize.INTEGER,
   },
   img_url: {
      type: Sequelize.STRING,
   },
   notes: {
       type: Sequelize.STRING,
   },
   summary: {
       type: Sequelize.STRING,
   },
   description: {
      type: Sequelize.STRING,
   },
}, {
   timestamps: false
});

ProductFamilies.belongsTo(ProductCategories, { foreignKey: 'category_id', as: 'category' });

export default ProductFamilies;