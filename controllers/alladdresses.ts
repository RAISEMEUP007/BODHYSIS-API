import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import sequelize from '../utils/database';
import { Op } from 'sequelize';

import AllAddresses from '../models/all_addresses';

dotenv.config();

export const searchAddress = async (req, res, next) => {
  try {
    const { str } = req.params;
    const searchWords = str.split(' ');

    const addressResults = await Promise.all([
      // AllAddresses.findAll({
      //   where: {
      //     [Op.or]: [
      //       { number: { [Op.like]: `%${str}%` } },
      //       { property_name: { [Op.like]: `%${str}%` } },
      //       { street: { [Op.like]: `%${str}%` } },
      //       { plantation: { [Op.like]: `%${str}%` } }
      //     ]
      //   },
      //   limit: 10
      // }),
      ...searchWords.map(async (word) => {
        return await AllAddresses.findAll({
          where: {
            [Op.or]: [
              { number: { [Op.like]: `${word}%` } },
              { property_name: { [Op.like]: `%${word}%` } },
              { street: { [Op.like]: `%${word}%` } },
              { plantation: { [Op.like]: `%${word}%` } }
            ]
          },
          order: ['number', 'street', 'property_name', 'plantation'],
          limit: 10
        });
      })
    ]);

    let addresses = addressResults.flat();
    addresses = addresses.slice(0, 10);

    res.json(addresses);
  } catch (error) {
    console.error('Error in address search:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

export const createAddress = (req, res, next) => {
  AllAddresses.create(req.body)
  .then(newAddress => {
    res.status(201).json({ message: 'Address created successfully', address: newAddress });
  })
  .catch(error => {
    console.log(error);
    if(error.errors && error.errors[0].validatorKey == 'not_unique'){
      const message = error.errors[0].message;
      const capitalizedMessage = message.charAt(0).toUpperCase() + message.slice(1);
      res.status(409).json({ error: capitalizedMessage});
    }else res.status(500).json({ error: "Internal server error" });
  });
}

export const updateAddress = (req, res, next) => {
  const updateFields = req.body;

  AllAddresses.update(updateFields, { where: { id: req.body.id } })
  .then(newAddress => {
    res.status(201).json({ message: 'Address updated successfully', address: newAddress });
  })
  .catch(error => {
    if(error.errors && error.errors[0].validatorKey == 'not_unique'){
      const message = error.errors[0].message;
      const capitalizedMessage = message.charAt(0).toUpperCase() + message.slice(1);
      res.status(409).json({ error: capitalizedMessage});
    }else res.status(500).json({ error: "Internal server error" });
  });
}

export const getAddressesData = (req, res, next) => {
 const { searchKey } = req.body;
 const queryOptions = {
   order: ['number', 'street', 'plantation', 'property_name']
 };
 if (searchKey) {
   queryOptions.where = {
     [Op.or]: [
       { number: { [Op.like]: `%${searchKey}%` } },
       { street: { [Op.like]: `%${searchKey}%` } },
       { plantation: { [Op.like]: `%${searchKey}%` } },
       { property_name: { [Op.like]: `%${searchKey}%` } }
     ]
   };
 }
 AllAddresses.findAll(queryOptions)
  .then((addresses) => {
    res.status(200).json(addresses);
  })
  .catch(err => {
    console.log(err);
    res.status(502).json({error: "An error occurred"});
  });
};

export const deleteAddress = (req, res, next) => {
  AllAddresses.destroy({ where: { id: req.body.id } })
    .then((result) => {
      if (result === 1) {
        res.status(200).json({ message: "Address deleted successfully" });
      } else {
        res.status(404).json({ error: "Address not found" });
      }
    })
    .catch((error) => {
      res.status(500).json({ error: "Internal server error" });
    });
};

