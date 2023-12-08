import { Sequelize } from 'sequelize';

import sequelize from '../../utils/database.js';

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
   }
}, {
   timestamps: false  // Disable timestamps
});


export default ProductCategories;