import { Sequelize } from 'sequelize';

import sequelize from '../../utils/database';

const ReservationPayments = sequelize.define('reservation_payments', {
   id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
   },
   is_refund: {
      type: Sequelize.BOOLEAN,
   },
   reservation_id: {
      type: Sequelize.INTEGER,
   },
   customer_id: {
      type: Sequelize.INTEGER,
   },
   method: {
      type: Sequelize.STRING,
   },
   amount: {
      type: Sequelize.FLOAT,
   },
   note: {
      type: Sequelize.STRING,
   },
   payment_intent: {
      type: Sequelize.STRING,
   },
   refunded: {
      type: Sequelize.FLOAT,
   },
   charge: {
      type: Sequelize.STRING,
   },
}, {
   // timestamps: false
});


export default ReservationPayments;