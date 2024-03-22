import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import sequelize from '../utils/database';

import User from '../models/user.js';

dotenv.config();

export const getDrivers = (req, res, next) => {
  User.findAll({
    attributes: ['id', 'name'],
    where:{
      is_driver:true,
    }
  })
  .then((users) => {
    res.status(200).json(users);
  })
  .catch(err => {
    console.log(err);
    res.status(502).json({error: "An error occurred"});
  });
};