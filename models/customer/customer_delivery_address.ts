import { Sequelize } from 'sequelize';

import sequelize from '../../utils/database';
import AllAddresses from '../all_addresses';

const CustomerDeliveryAddress = sequelize.define('customer_delivery_address', {
   id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
   },
   customer_id: {
      type: Sequelize.INTEGER,
   },
   address_id: {
      type: Sequelize.INTEGER,
   },
   is_used: {
      type: Sequelize.BOOLEAN,
   },
}, {
   timestamps: false,
   tableName: 'customer_delivery_address' 
});

CustomerDeliveryAddress.belongsTo(AllAddresses, { foreignKey: 'address_id', as: 'all_addresses' });

export default CustomerDeliveryAddress;