import { Sequelize } from 'sequelize';

import sequelize from '../../utils/database';

const AllAddressStreets = sequelize.define('all_address_streets', {
   id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
   },
   street: {
      type: Sequelize.STRING,
   },
}, {
   timestamps: false
});

export default AllAddressStreets;