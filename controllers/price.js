import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import sgMail from '@sendgrid/mail';
import sequelize from '../utils/database.js';

import PriceGroup from '../models/price_group.js';
import PricePoints from '../models/price_points.js';
import PriceGroupDatas from '../models/price_group_datas.js';

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

const getHeaderData = (req, res, next) => {
    return PricePoints.findAll()
    .then((pionts) => {
        const pointsArr = pionts.map(item => item.dataValues.duration + " " + item.dataValues.duration_type);
        res.status(200).json(pointsArr);
    })
    .catch(err => {
        res.status(502).json({message: "An error occurred"});
    });
};

const getTableData = (req, res, next) => {
    return sequelize.query(
      `
      SELECT
        t1.id AS group_id,
        t1.price_group,
        t1.is_free,
        t1.extra_day,
        t3.id AS point_id,
        t2.value
      FROM
        price_groups AS t1
        LEFT JOIN price_group_datas AS t2 ON t1.id = t2.group_id
        LEFT JOIN price_points AS t3 ON t2.point_id = t3.id
      ORDER BY group_id, point_id
      `,
      { type: sequelize.QueryTypes.SELECT }
    )
    .then(datas => {
        if(datas.length > 0){
            PricePoints.findAll()
            .then((pionts) => {
                const pointsArr = pionts.map(item => item.dataValues);
                
                var doubleArraiedDtas = {};
                var resData = {};

                datas.map((data, index)=>{
                    doubleArraiedDtas[data.price_group] = {};
                });
                datas.map((data, index)=>{
                    if(data.point_id) doubleArraiedDtas[data.price_group][data.point_id] = data;
                    resData[data.price_group] = {
                        is_free: data.is_free,
                        extra_day: data.extra_day,
                        data: []
                    };
                });

                for(var price_group in doubleArraiedDtas){
                    var dataFirst = doubleArraiedDtas[price_group];
                    pointsArr.map((point, index) => {
                        var dataSecond = dataFirst[point.id];
                        if(dataSecond) {
                            resData[price_group].data.push(dataSecond.value);
                        }else{
                            resData[price_group].data.push("");
                        }
                    })
                }
                res.status(200).json(resData);
            })
            .catch(err => {
                res.status(502).json({message: "An error occurred"});
            });
        }else{
            res.status(200).json({datas});
        }
    })
    .catch(error => {
        res.status(502).json({message: "An error occurred"});
    });
};

export { createPriceGroup, addPricePoint, getTableData, getHeaderData };