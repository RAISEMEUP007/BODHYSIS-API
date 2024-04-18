import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import sequelize from '../utils/database';
import { Op } from 'sequelize';

import AllAddresses from '../models/all_addresses.js';

dotenv.config();

export const searchAddress = async (req, res, next) => {
  try {
    const { str } = req.params;
    const searchWords = str.split(' ');

    const addressResults = await Promise.all([
      AllAddresses.findAll({
        where: {
          [Op.or]: [
            { number: { [Op.like]: `%${str}%` } },
            { property_name: { [Op.like]: `%${str}%` } },
            { street: { [Op.like]: `%${str}%` } },
            { plantation: { [Op.like]: `%${str}%` } }
          ]
        },
        limit: 10 // Limit the results to 10 addresses
      }),
      ...searchWords.map(async (word) => {
        return await AllAddresses.findAll({
          where: {
            [Op.or]: [
              { number: { [Op.like]: `%${word}%` } },
              { property_name: { [Op.like]: `%${word}%` } },
              { street: { [Op.like]: `%${word}%` } },
              { plantation: { [Op.like]: `%${word}%` } }
            ]
          },
          limit: 10 // Limit the results to 10 addresses
        });
      })
    ]);

    let addresses = addressResults.flat(); // Flatten the array of arrays
    addresses = addresses.slice(0, 10);

    res.json(addresses);
  } catch (error) {
    console.error('Error in address search:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
