import { Sequelize } from 'sequelize';

import sequelize from '../../utils/database';
import ProductCategories from './product_categories';
import ProductLines from './product_lines';
import ProductDisplayGroupOrder from './product_display_group_orders';

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
ProductFamilies.hasMany(ProductDisplayGroupOrder, {
  foreignKey: 'display_name',
  sourceKey: 'display_name',
  as: 'group_orders'
});

ProductDisplayGroupOrder.belongsTo(ProductFamilies, {
  foreignKey: 'display_name',
  targetKey: 'display_name',
});

export default ProductFamilies;