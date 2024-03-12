import sequelize from '../utils/database';
import { NextFunction,Response,Request } from "express";
import Reservations from "../models/reservation/reservations";

export const getOrders= (req:Request, res:Response, next:NextFunction) => {
  return res.json(["order1", "order2", "order3"])
}

export const getOrdersData = (req:Request, res:Response, next:NextFunction) => {
  const query = `
    SELECT
    t1.id,
    -- t1.customer_id,
    -- t2.first_name,
    -- t2.last_name,
    CONCAT(t2.first_name, ' ', t2.last_name) AS full_name,
    -- t1.brand_id,
    -- t3.brand,
    -- t1.start_location_id,
    t4.location AS start_location,
    -- t1.end_location_id,
    t5.location AS end_location,
    t1.start_date,
    t1.end_date,
    -- t1.promo_code,
    t6.code AS discount_code,
    -- t1.note,
    -- t1.subtotal,
    -- t1.discount_amount,
    -- t1.tax_rate,
    -- t1.tax_amount,
    -- t1.total_price,
    t1.stage
  FROM
    reservations AS t1
    LEFT JOIN customer_customers AS t2
    ON t1.customer_id = t2.id
    -- LEFT JOIN price_brands AS t3
    -- ON t1.brand_id = t3.id
    LEFT JOIN settings_locations AS t4
    ON t1.start_location_id = t4.id
    LEFT JOIN settings_locations AS t5
    ON t1.end_location_id = t5.id
    LEFT JOIN settings_discountcodes AS t6
    ON t1.promo_code = t6.id
  WHERE t1.stage IN (2, 3, 4)
  ORDER BY t1.createdAt DESC
  LIMIT 200
  `;

  sequelize.query(
    query,
    { type: sequelize.QueryTypes.SELECT }
  )
  .then((reservations) => {
    res.status(200).json(reservations);
  })
  .catch(err => {
    console.log(err);
    res.status(502).json({error: "An error occurred"});
  });
}