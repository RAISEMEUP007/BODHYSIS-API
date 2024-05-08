import { Sequelize } from 'sequelize';

import sequelize from '../../utils/database';

const ProductCategories = sequelize.define('product_categories', {
   id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
   },
   category: {
      type: Sequelize.STRING,
      allowNull: false,
   },
   img_url: {
      type: Sequelize.STRING,
   },
   description: {
      type: Sequelize.STRING,
   },
   tag_id: {
      type: Sequelize.INTEGER,
   },
   brand_ids: {
      type: Sequelize.STRING,
   },
}, {
   timestamps: false  // Disable timestamps
});


export default ProductCategories;