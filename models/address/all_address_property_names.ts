import { Sequelize } from 'sequelize';

import sequelize from '../../utils/database';

const AllAddressPropertyNames = sequelize.define('all_address_property_names', {
   id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
   },
   property_name: {
      type: Sequelize.STRING,
   },
}, {
   timestamps: false
});

export default AllAddressPropertyNames;