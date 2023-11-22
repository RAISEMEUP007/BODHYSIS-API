import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import sgMail from '@sendgrid/mail';

import PriceGroup from '../models/price_group.js';
import PricePoints from '../models/price_points.js';

dotenv.config();

const createPriceGroup = (req, res, next) => {
    PriceGroup.findOne({ where : {
        price_group: req.body.group,
    }})
    .then(price_group => {
        if (price_group == req.body.group) {
            return res.status(409).json({message: "This group already exists"});
        } else if (req.body.group) {
            return PriceGroup.create(({
                price_group: req.body.group,
            }))
            .then(() => {
                res.status(200).json({message: "Added Successfully"});
            })
            .catch(err => {
                console.log(err);
                res.status(502).json({message: "An error occurred"});
            });
        }
    })
    .catch(err => {
        console.log('error', err);
    });
};

const addPricePoint = (req, res, next) => {
    // PricePoints.findOne({ where : {
    //     point: req.body.duration,
    // }})
    // .then(duration => {
    //     // if (duration) {
    //     //     return res.status(409).json({message: "This group already exists"});
    //     // } else if (req.body.group) {
    //     //     return PriceGroup.create(({
    //     //         price_group: req.body.group,
    //     //     }));
    //     // }
    // })
    // .catch(err => {
    //     console.log('error', err);
    // });
    return PricePoints.create(({
        duration: req.body.duration,
        duration_type: req.body.durationType,
    }))
    .then(() => {
        res.status(200).json({message: "Added Successfully"});
    })
    .catch(err => {
        console.log(err);
        res.status(502).json({message: "An error occurred"});
    });
};

export { createPriceGroup, addPricePoint };