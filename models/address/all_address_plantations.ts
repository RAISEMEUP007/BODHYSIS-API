import { Sequelize } from 'sequelize';

import sequelize from '../../utils/database';

const AllAddressPlantaions = sequelize.define('all_address_plantations', {
   id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
   },
   plantation: {
      type: Sequelize.STRING,
   },
}, {
   timestamps: false
});

export default AllAddressPlantaions;