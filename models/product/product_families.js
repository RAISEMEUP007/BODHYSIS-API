import { Sequelize } from 'sequelize';

import sequelize from '../../utils/database.js';
import ProductCategories from './product_categories.js';

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
   category_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
   },
   img_url: {
      type: Sequelize.STRING,
   },
   summary: {
       type: Sequelize.STRING,
   },
   price_group_id: {
      type: Sequelize.INTEGER,
   },
   description: {
      type: Sequelize.STRING,
   },
}, {
   timestamps: false
});

ProductFamilies.belongsTo(ProductCategories, { foreignKey: 'category_id', as: 'category' });

export default ProductFamilies;