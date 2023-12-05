import { Sequelize } from 'sequelize';

import sequelize from '../../utils/database.js';
import PriceCategories from './product_categories.js';

const ProductFamilies = sequelize.define('product_families', {
   id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
   },
   category_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
   },
   family: {
      type: Sequelize.STRING,
      allowNull: false,
   },
   img_url: {
      type: Sequelize.STRING,
   },
   description: {
      type: Sequelize.STRING,
   },
}, {
   timestamps: false  // Disable timestamps
});

ProductFamilies.belongsTo(PriceCategories, { foreignKey: 'category_id', as: 'category' });

export default ProductFamilies;