import { Request, Response } from "express";
import sequelize from '../utils/database';
import Reservations, {
  ReservationProductType,
  ReservationType,
} from "../models/reservation/reservations";
import { getAvaliableQuantitiesByLine } from "./product.ts";

import ReservationPayments from '../models/reservation/reservation_payments.js';
import ReservationItems from '../models/reservation/reservation_items.js';
import ProductLines from '../models/product/product_lines.js';

export const createReservation = (req, res, next) => {
  Reservations.create(req.body)
  .then(newReservation => {
    if(req.body.items){
      const reservationItemsPromises = req.body.items.map(item => {
        return ReservationItems.create({
          reservation_id: newReservation.id,
          line_id: item.id,
          quantity: item.quantity,
          price_group_id: item.price_group_id,
          price: item.price,
        });
      });

      return Promise.all(reservationItemsPromises)
      .then(newItems => {
        res.status(201).json({ message: 'Reservation created successfully', reservation: newReservation, items: newItems });
      });
    }else{
      res.status(201).json({ message: 'Reservation created successfully', reservation: newReservation });
    }
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
};

export const getReservationsList = (_: Request, res: Response) => {
  try {
    Reservations.findAll({
      order: [["createdAt", "DESC"]],
    }).then((result: any) => {
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
    include: [{ 
      model: ReservationItems, 
      as: 'items',
      // attributes: [sequelize.literal('items.id AS rid'), 'reservation_id', 'line_id', 'price_group_id', 'quantity', 'price'],
      include: { model: ProductLines, as: 'lines', attributes: ['line', 'price_group_id', 'size'] },
    }],
    where: {
      id: id
    }
  };
  
  Reservations.findOne(queryOptions)
  .then((reservation) => {
    const transformedReservation = {
      ...reservation.toJSON(),
      items: reservation.items.map(item => ({
        ...item.toJSON(),
        line: item.lines.line,
        price_group_id: item.lines.price_group_id,
        size: item.lines.size,
      }))
    };
    res.status(200).json(transformedReservation);
  })
  .catch(err => {
    console.log(err);
    res.status(502).json({error: "An error occurred"});
  });
};

export const updateReservation = (req, res, next) => {
  const updateFields = req.body;
  Reservations.update(updateFields, { where: { id: req.body.id } })
  .then(updatedCount => {
    if (req.body.items) {
      const reservationItemsPromises = req.body.items.map(item => {
        return new Promise((resolve, reject) => {
          ReservationItems.findOne({ where: { id: item.id } })
          .then(foundItem => {
            if (foundItem) {
              foundItem.update({
                line_id: item.line_id,
                price_group_id: item.price_group_id,
                quantity: item.quantity,
                price: item.price,
              })
              .then(updatedItem => {
                item.id = updatedItem.id;
                resolve( item);
              })
              .catch(error => reject(error));
            } else {
              ReservationItems.create({
                reservation_id: req.body.id,
                line_id: item.line_id,
                price_group_id: item.price_group_id,
                quantity: item.quantity,
                price: item.price,
              })
              .then(newItem => {
                item.id = newItem.id;
                resolve(item);
              })
              .catch(error => reject(error));
            }
          })
          .catch(error => reject(error));
        });
      });

      Promise.all(reservationItemsPromises)
      .then(newItems => {
        res.status(201).json({ message: 'Reservation updated successfully', items: newItems });
      })
      .catch(error => {
        console.log(error);
        if (error.name === 'SequelizeUniqueConstraintError') {
          const message = error.errors[0].message;
          const capitalizedMessage = message.charAt(0).toUpperCase() + message.slice(1);
          res.status(409).json({ error: capitalizedMessage });
        } else {
          res.status(500).json({ error: "Internal server error" });
        }
      });
    } else {
      res.status(201).json({ message: 'Reservation updated successfully', });
    }
  })
  .catch(error => {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  });
}

export const removeReservationItem = (req, res, next) => {
  console.log(req.body);
  ReservationItems.destroy({ where: { id: req.body.id } })
  .then((result) => {
    if (result === 1) {
      res.status(200).json({ message: "Reservation item deleted successfully" });
    } else {
      res.status(404).json({ error: "Reservation item not found" });
    }
  })
  .catch((error) => {
    if(error.original.errno == 1451 || error.original.code == 'ER_ROW_IS_REFERENCED_2' || error.original.sqlState == '23000'){
      res.status(409).json({ error: "It cannot be deleted because it is used elsewhere"});
    }else res.status(500).json({ error: "Internal server error" });
  });
};

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

export const verifyQuantity = async (req, res, next) => {
  const { start_date, end_date, items } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Request body must have a non-empty array of items' });
  }

  try {
    const idsArray = items.map(item => item.id);
    const availableQuantities = await getAvaliableQuantitiesByLine(idsArray);
    const stageAmount = await getStageAmount(start_date, end_date, idsArray);
    // const availableQuantities = await getAvaliableQuantitiesByLine(idsArray);
    // const stageAmount = await getStageAmount(start_date, end_date, idsArray);

    const response = [];
    let hasInsufficientQuantity = false;

    for (const item of items) {
      const itemId = item.id;
      const requestedQuantity = item.quantity;
      const availableQuantity = availableQuantities[itemId] || 0;
      const stageInfo = stageAmount[itemId] || {};
      const { out_amount } = stageInfo;
      const totalReserved = parseInt(out_amount);
      const remainingQuantity = availableQuantity - totalReserved;

      if (requestedQuantity > remainingQuantity) {
        hasInsufficientQuantity = true;
      }

      response.push({
        line: item.line + ' ' + item.size,
        requested: requestedQuantity,
        available: remainingQuantity
      });
    }

    if (hasInsufficientQuantity) {
      return res.status(400).json({ error: 'Insufficient quantity for one or more items', quantities: response });
    }

    res.status(200).json({ message: 'All quantities verified', quantities: response });
    next();
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: 'An error occurred while verifying quantities' });
  }
};

const getStageAmount = (startDate, endDate, line_id = null) => {
  let lineIdCondition = '';
  let replacements = { start_date: startDate, end_date: endDate };

  if (Array.isArray(line_id)) {
    lineIdCondition = 'AND t1.line_id IN (:line_id)';
    replacements.line_id = line_id;
  } else if (Number.isInteger(line_id)) {
    lineIdCondition = 'AND t1.line_id = :line_id';
    replacements.line_id = line_id;
  }

  const query = `
    SELECT
      t1.line_id,
      t2.stage,
      SUM(IF(t2.stage IN (1, 2), t1.quantity, 0)) AS reserved,
      SUM(IF(t2.stage = 3, t1.quantity, 0)) AS checked_out,
      SUM(IF(t2.stage = 4, t1.quantity, 0)) AS checked_in,
      (SUM(IF(t2.stage IN (1, 2), t1.quantity, 0)) + SUM(IF(t2.stage = 3, t1.quantity, 0))) - SUM(IF(t2.stage = 4, t1.quantity, 0)) AS out_amount
    FROM
      reservation_items AS t1
      INNER JOIN reservations AS t2
        ON t1.reservation_id = t2.id
    WHERE
      t2.start_date < :end_date
      AND t2.end_date > :start_date
      AND t2.stage IN (1, 2, 3, 4)
      ${lineIdCondition}
    GROUP BY t1.line_id, t2.stage;
  `;

  return sequelize.query(query, {
    replacements,
    type: sequelize.QueryTypes.SELECT
  }).then(stageAmounts => {
    const formattedResults = stageAmounts.reduce((acc, cur) => {
      acc[cur.line_id] = {
        line_id: cur.line_id,
        stage: cur.stage,
        reserved: cur.reserved,
        checked_out: cur.checked_out,
        checked_in: cur.checked_in,
        out_amount: cur.out_amount
      };
      return acc;
    }, {});
    return formattedResults;
  }).catch(error => {
    console.error(error);
    throw new Error('An error occurred while fetching stage amounts');
  });
}
