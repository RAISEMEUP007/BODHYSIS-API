import { DataTypes, } from 'sequelize';

import sequelize from '../utils/database';
import User from './user';

interface RefreshToken {
  id: string;
  refresh_token: string;
  user_id: number;
  ModelDefined: number;  
}
const UserRefreshToken = sequelize.define('user_refresh_token', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
 },
  user_id: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'id',
    },
  },
 ç: {
  type: DataTypes.INTEGER,
},
refresh_token: {
  type: DataTypes.STRING,
  allowNull: false,
},
})

UserRefreshToken.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});

export default UserRefreshToken;