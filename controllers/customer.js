import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import sgMail from '@sendgrid/mail';
import sequelize from '../utils/database.js';

import CustomerCustomers from '../models/customer/customer_customers.js';
import SettingsLocations from '../models/settings/settings_locations.js';
import SettingsCountries from '../models/settings/settings_countries.js';
import SettingsLanguages from '../models/settings/settings_languages.js';

dotenv.config();

export const createCustomer = (req, res, next) => {
  CustomerCustomers.create(req.body)
  .then(newcustomer => {
    res.status(201).json({ message: 'Customer created successfully', customer: newcustomer });
  })
  .catch(error => {
    if(error.errors && error.errors[0].validatorKey == 'not_unique'){
      const message = error.errors[0].message;
      const capitalizedMessage = message.charAt(0).toUpperCase() + message.slice(1);
      res.status(409).json({ error: capitalizedMessage});
    }else res.status(500).json({ error: "Internal server error" });
  });
}

export const updateCustomer = (req, res, next) => {
  CustomerCustomers.update(req.body, { where: { id: req.body.id } })
  .then(newcustomer => {
    res.status(201).json({ message: 'Customer created successfully', customer: newcustomer });
  })
  .catch(error => {
    if(error.errors && error.errors[0].validatorKey == 'not_unique'){
      const message = error.errors[0].message;
      const capitalizedMessage = message.charAt(0).toUpperCase() + message.slice(1);
      res.status(409).json({ error: capitalizedMessage});
    }else res.status(500).json({ error: "Internal server error" });
  });
}

export const getCustomersData = (req, res, next) => {
  let queryOptions = {
    include: [
      {
        model: SettingsCountries,
        as: 'country',
        attributes: ['country'],
      },
      {
        model: SettingsLanguages,
        as: 'language',
        attributes: ['language'],
      },
      {
        model: SettingsLocations,
        as: 'home_location_tbl',
        attributes: ['location'],
      },
    ],
  };
  CustomerCustomers.findAll(queryOptions)
  .then((customers) => {
    let customersJSON = [];
    for (let i = 0; i < customers.length; i++) {
      customersJSON.push(customers[i].dataValues);
    }   
    res.status(200).json(customersJSON);
  })
  .catch(err => {
    res.status(502).json({error: "An error occurred"});
  });
};

export const deleteCustomer = (req, res, next) => {
  CustomerCustomers.destroy({ where: { id: req.body.id } })
  .then((result) => {
    if (result === 1) {
      res.status(200).json({ message: "Customer deleted successfully" });
    } else {
      res.status(404).json({ error: "Customer not found" });
    }
  })
  .catch((error) => {
    if(error.original.errno == 1451 || error.original.code == 'ER_ROW_IS_REFERENCED_2' || error.original.sqlState == '23000'){
      res.status(409).json({ error: "It cannot be deleted because it is used elsewhere"});
    }else res.status(500).json({ error: "Internal server error" });
  });
};