import Reservations, {
  ReservationProductType,
  ReservationType,
} from "../models/reservations";
import { Request, Response } from "express";
import SettingsLocations, {
  SettingsLocationType,
} from "../models/settings/settings_locations";
import ProductProducts from "../models/product/product_products";
import sequelize from '../utils/database';
import ReservationPayments from '../models/reservation/reservation_payments.js';

export const createReservation = (req, res, next) => {
  Reservations.create(req.body)
  .then(newReservation => {
    res.status(201).json({ message: 'Reservation created successfully', reservation: newReservation });
  })
  .catch(error => {
    if(error.errors && error.errors[0].validatorKey == 'not_unique'){
      const message = error.errors[0].message;
      const capitalizedMessage = message.charAt(0).toUpperCase() + message.slice(1);
      res.status(409).json({ error: capitalizedMessage});
    }else res.status(500).json({ error: "Internal server error" });
  });
}

export const getReservationsData = (req, res, next) => {
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
};

export const getReservationsList = (_: Request, res: Response) => {
  try {
    Reservations.findAll({
      order: [["createdAt", "DESC"]],
    }).then((result: any) => {
      console.log("result", result);
      return res.status(201).json({ reservations: result });
    });
  } catch (error) {
    return res.status(409).json({
      error: JSON.stringify(error),
    });
  }
};

export const getReservationDetails = async (req: Request, res: Response) => {
  const id = req.params.id;
  let queryOptions = {
    where: {
      id: id
    }
  };
  
  Reservations.findOne(queryOptions)
  .then((reservation) => {
    res.status(200).json(reservation);
  })
  .catch(err => {
    res.status(502).json({error: "An error occurred"});
  });
};

export const updateReservation = (req, res, next) => {
  const updateFields = req.body;

  console.log(updateFields);

  Reservations.update(updateFields, { where: { id: req.body.id } })
  .then(newReservation => {
    res.status(201).json({ message: 'Reservation updated successfully', reservation: newReservation });
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

export const createTransaction = (req, res, next) => {
  ReservationPayments.create(req.body)
  .then(newPayment => {
    // res.status(201).json({ message: 'Transaction created successfully', transaction: newPayment });
    return ReservationPayments.findAll({ 
      attributes: [[sequelize.fn('SUM', sequelize.col('amount')), 'totalPaid']], 
      where: { reservation_id: req.body.reservation_id }, 
      raw: true 
    });
  })
  .then(totalPaid => {
    return Reservations.update({ 
      paid: totalPaid[0].totalPaid 
    }, { 
      where: { id: req.body.reservation_id } 
    });
  })
  .then((newPayment) => {
    res.status(201).json({ message: 'Transaction created successfully', transaction: newPayment });
  })
  .catch(error => {
    if(error.errors && error.errors[0].validatorKey == 'not_unique'){
      const message = error.errors[0].message;
      const capitalizedMessage = message.charAt(0).toUpperCase() + message.slice(1);
      res.status(409).json({ error: capitalizedMessage});
    }else res.status(500).json({ error: "Internal server error" });
  });
}

export const getTransactionsData = (req, res, next) => {
  ReservationPayments.findAll({where:{reservation_id:req.body.reservation_id}})
  .then((payments) => {
    let paymentsJSON = [];
    for (let i = 0; i < payments.length; i++) {
      paymentsJSON.push(payments[i].dataValues);
    }
    res.status(200).json(paymentsJSON);
  })
  .catch(err => {
    console.log(err);
    res.status(502).json({error: "An error occurred"});
  });
};