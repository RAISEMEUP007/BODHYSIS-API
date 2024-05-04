import { Sequelize } from 'sequelize';

import sequelize from '../../utils/database';

const ProductDisplayGroupOrder = sequelize.define('product_display_group_orders', {
   id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
   },
   display_name: {
      type: Sequelize.STRING,
      allowNull: false,
   },
   order_index: {
      type: Sequelize.INTEGER,
   },
}, {
   timestamps: false  // Disable timestamps
});


export default ProductDisplayGroupOrder;