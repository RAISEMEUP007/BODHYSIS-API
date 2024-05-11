import { Sequelize } from 'sequelize';

import sequelize from '../../utils/database';

const Forecasting = sequelize.define('forecasting', {
   id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
   },
   address_id: {
      type: Sequelize.INTEGER,
   },
   date: {
      type: Sequelize.DATE,
   },
   booked_guests: {
      type: Sequelize.INTEGER,
   },
   max_guests: {
      type: Sequelize.INTEGER,
   },
   percentage: {
      type: Sequelize.FLOAT,
   },
   last_updated_source_url: {
      type: Sequelize.STRING,
   },
}, {
    tableName: 'forecasting' 
});

export default Forecasting;