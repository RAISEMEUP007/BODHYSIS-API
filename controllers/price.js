import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import UserForgotPassword from '../models/users_forgot_password.js';
import PriceGroup from '../models/price_group.js';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import sgMail from '@sendgrid/mail';

dotenv.config();

const createpricegroup = (req, res, next) => {
    PriceGroup.findOne({ where : {
        price_group: req.body.group,
    }})
    .then(price_group => {
        if (price_group) {
            return res.status(409).json({message: "This group already exists"});
        } else if (req.body.group) {
            return PriceGroup.create(({
                price_group: req.body.group,
            }));
        }
    })
    .catch(err => {
        console.log('error', err);
    });
};

export { createpricegroup };