import { Sequelize } from 'sequelize';

import sequelize from '../utils/database.js';

const PriceGroupDatas = sequelize.define('price_group_datas', {
   id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
   },
   group_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
   },
   season_id: {
      type: Sequelize.INTEGER,
      allowNull: true,
   },
   brand_id: {
      type: Sequelize.INTEGER,
      allowNull: true,
   },
   point_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
   },
   value: {
      type: Sequelize.INTEGER,
      allowNull: false,
   },
}, {
   timestamps: false  // Disable timestamps
});

export default PriceGroupDatas;