import { Sequelize } from 'sequelize';

import sequelize from '../utils/database';

const AllAddresses = sequelize.define('all_addresses', {
   id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
   },
   number: {
      type: Sequelize.STRING,
   },
   street: {
      type: Sequelize.STRING,
   },
   plantation: {
      type: Sequelize.STRING,
   },
   property_name: {
      type: Sequelize.STRING,
   },
   property_type: {
      type: Sequelize.STRING,
   },
   price: {
      type: Sequelize.STRING,
   },
   guests: {
      type: Sequelize.STRING,
   },
   bedrooms: {
      type: Sequelize.STRING,
   },
   rental_company: {
      type: Sequelize.STRING,
   },
   xploriefif: {
      type: Sequelize.STRING,
   },
   xplorievoucher: {
      type: Sequelize.STRING,
   },
   geolat: {
      type: Sequelize.STRING,
   },
   geolong: {
      type: Sequelize.STRING,
   },
});

export default AllAddresses;