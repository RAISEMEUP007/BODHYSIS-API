import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import sgMail from '@sendgrid/mail';
import sequelize from '../utils/database.js';

import SettingsManufactures from '../models/settings/settings_manufactures.js';

dotenv.config();

export const createManufacture = (req, res, next) => {
  SettingsManufactures.create(req.body)
  .then(newfamily => {
    res.status(201).json({ message: 'Manufacture family created successfully', family: newfamily });
  })
  .catch(error => {
    console.error('Error creating manufacture family:', error);
    res.status(500).json({ error: 'Failed to create manufacture family' });
  });
}

export const updateManufacture = (req, res, next) => {
  const updateFields = req.body;

  SettingsManufactures.update(updateFields, { where: { id: req.body.id } })
  .then(newfamily => {
    res.status(201).json({ message: 'Manufacture family created successfully', family: newfamily });
  })
  .catch(error => {
    console.error('Error creating manufacture family:', error);
    res.status(500).json({ error: 'Failed to create manufacture family' });
  });
}

export const getManufacturesData = (req, res, next) => {
  SettingsManufactures.findAll()
  .then((manufactures) => {
    let manufacturesJSON = [];
    for (let i = 0; i < manufactures.length; i++) {
      manufacturesJSON.push(manufactures[i].dataValues);
    }   
    res.status(200).json(manufacturesJSON);
  })
  .catch(err => {
    console.log(err);
    res.status(502).json({error: "An error occurred"});
  });
};

export const deleteManufacture = (req, res, next) => {
  SettingsManufactures.destroy({ where: { id: req.body.id } })
    .then((result) => {
      if (result === 1) {
        res.status(200).json({ message: "Manufacture deleted successfully" });
      } else {
        res.status(404).json({ error: "Manufacture not found" });
      }
    })
    .catch((error) => {
      res.status(500).json({ error: "Internal server error" });
    });
};
