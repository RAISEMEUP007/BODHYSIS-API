import { NextFunction,Response,Request } from "express";
import Reservations from "../models/reservation/reservations";
import sequelize from "../utils/database";
import { Op } from "sequelize";

export const getOrders= (req:Request, res:Response, next:NextFunction) => {
  try {
    Reservations.findAll({
      order: [["createdAt", "DESC"]],
      where: {
        stage: { [Op.or]: [2, 3, 4],}
      },
      include:[{
        model: sequelize.models['customer_customers'],
        as: "customer",
        attributes:['id','first_name','last_name'],
      },
    {
      model: sequelize.models['settings_locations'],
      as :'location'
    }]
    }).then((result: any) => {
      return res.status(201).json(result);
    });
  } catch (error) {
    return res.status(409).json({
      error: JSON.stringify(error),
    });
  }
}

export const getOrdersById= (req:Request, res:Response, next:NextFunction) => {
  const orderId = req.params.id
  try {
    Reservations.findOne({
      order: [["createdAt", "DESC"]],
      where: {
        id: orderId
      },
      include:[{
        model: sequelize.models['customer_customers'],
        as: "customer",
        attributes:['id','first_name','last_name'],
      },
    {
      model: sequelize.models['settings_locations'],
      as :'location'
    }]
    }).then((result: any) => {
      return res.status(201).json(result);
    });
  } catch (error) {
    return res.status(409).json({
      error: JSON.stringify(error),
    });
  }
}