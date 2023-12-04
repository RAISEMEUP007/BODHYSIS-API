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
   description: {
      type: Sequelize.STRING,
   },
}, {
   timestamps: false  // Disable timestamps
});

export default ProductCategories;