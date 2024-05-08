import { Request, Response } from "express";
import sequelize from '../utils/database';
import puppeteer from 'puppeteer';

import { getAvaliableQuantitiesByLine, getAvaliableQuantitiesByFamilyIds } from "./product";
import Reservations from "../models/reservation/reservations";
import ReservationPayments from '../models/reservation/reservation_payments';
import ReservationItems from '../models/reservation/reservation_items';
import ReservationItemsExtras from '../models/reservation/reservation_items_extras';
import ProductLines from '../models/product/product_lines';
import ProductFamilies from '../models/product/product_families';
import SettingsExtras from '../models/settings/settings_extras';
import CustomerCustomers from '../models/customer/customer_customers';
import CustomerDeliveryAddress from '../models/customer/customer_delivery_address';
import SettingsColorcombinations from '../models/settings/settings_colorcombinations';
import AllAddresses from '../models/all_addresses';
import ProductProducts from '../models/product/product_products';

export const createReservation = async (req, res, next) => {
  try {
    const lastReservation = await Reservations.findOne({
      order: [['order_number', 'DESC']]
    });

    let orderIndex = 1;

    const today = new Date();
    const currentYear = today.getFullYear().toString().slice(-2);
    const currentMonth = (today.getMonth() + 1).toString().padStart(2, '0');

    if (lastReservation && lastReservation.order_number && lastReservation.order_number.substr(0, 4) === `${currentYear}${currentMonth}`) {
      if (!isNaN(parseInt(lastReservation.order_number.substr(-4)))) {
        orderIndex = parseInt(lastReservation.order_number.substr(-4)) + 1;
      }
    }

    const orderNumber = `${currentYear}${currentMonth}-${orderIndex.toString().padStart(4, '0')}`;

    const newReservation = await Reservations.create({
      ...req.body,
      order_number: orderNumber,
    });

    if (req.body.items && req.body.items.length > 0) {
      const reservationItemsPromises = req.body.items.map(async (item) => {
        const newItem = await ReservationItems.create({
          reservation_id: newReservation.id,
          family_id: item.id,
          display_name: item.display_name,
          quantity: item.quantity,
          price_group_id: item.price_group_id,
          price: item.price,
          size: item.size,
        });

        item.id = newItem.id;
        await saveReservationItemsExtras(item.id, item.extras);

        return item;
      });

      const newItems = await Promise.all(reservationItemsPromises);

      res.status(201).json({ message: 'Reservation created successfully', reservation: newReservation, items: newItems });
    } else {
      res.status(201).json({ message: 'Reservation created successfully', reservation: newReservation });
    }
  } catch (error) {
    console.error(error);

    if (error.errors && error.errors[0].validatorKey === 'not_unique') {
      const message = error.errors[0].message.charAt(0).toUpperCase() + error.errors[0].message.slice(1);
      res.status(409).json({ error: message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

export const getReservationsData = (req, res, next) => {
  const searchOptions = req.body.searchOptions;
  switch(searchOptions.status_filter){
    case 1:
      searchOptions.stage = 3;
      break;
    case 2:
      searchOptions.stage = 3;
      break;
    case 3:
      searchOptions.stage = 1;
      break;
    case 4:
      searchOptions.stage = 2;
      break;
  }

  const query = `
    SELECT
    t1.id,
    t1.order_number,
    -- t1.customer_id,
    -- t2.first_name,
    -- t2.last_name,
    CONCAT(t2.first_name, ' ', t2.last_name) AS full_name,
    -- t1.brand_id,
    t3.brand,
    -- t1.start_location_id,
    t4.location AS start_location,
    -- t1.end_location_id,
    -- t5.location AS end_location,
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
    -- CONCAT(t7.address1, ' ', t7.address2, ' ', t7.city, ' ', t7.state) as delivery_address,
    -- t7.address1 as delivery_address,
    SUM(t8.quantity) as quantity,
    t1.stage
  FROM
    reservations AS t1
    LEFT JOIN customer_customers AS t2
    ON t1.customer_id = t2.id
    LEFT JOIN price_brands AS t3
    ON t1.brand_id = t3.id
    LEFT JOIN settings_locations AS t4
    ON t1.start_location_id = t4.id
    -- LEFT JOIN settings_locations AS t5
    -- ON t1.end_location_id = t5.id
    LEFT JOIN settings_discountcodes AS t6
    ON t1.promo_code = t6.id
    LEFT JOIN customer_delivery_address AS t7
    ON t1.delivery_address_id = t7.id
    LEFT JOIN reservation_items AS t8
    ON t1.id = t8.reservation_id
  WHERE
    t1.start_date >= :start_date
    AND t1.start_date <= :end_date
    ${searchOptions.customer ? `AND CONCAT(t2.first_name, ' ', t2.last_name) LIKE :customer` : ''}
    ${searchOptions.brand ? `AND t3.brand LIKE :brand` : ''}
    ${searchOptions.order_number ? `AND t1.order_number LIKE :order_number` : ''}
    ${Array.isArray(searchOptions.stage) ? `AND t1.stage IN (:stage)` : searchOptions.stage ? `AND (t1.stage = :stage OR :stage IS NULL OR :stage = '')` : ''}
  GROUP BY t1.id
  ORDER BY t1.order_number DESC
  `;

  sequelize.query(
    query,
    { 
      replacements: {
        start_date: searchOptions.start_date,
        end_date: searchOptions.end_date + ' 23:59:59',
        customer: `%${searchOptions.customer}%`,
        brand: `%${searchOptions.brand}%`,
        order_number: `%${searchOptions.order_number}%`,
        stage: searchOptions.stage,
      },
      type: sequelize.QueryTypes.SELECT 
    }
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
      include: [
        { 
          model: ProductFamilies, 
          as: 'families', 
          attributes: ['family', 'display_name'],
        },
        {
          model: ReservationItemsExtras,
          as: 'item_extras',
          include: {
            model: SettingsExtras,
            as: 'extras'
          }
        }
      ],
    },
    {
      model: CustomerCustomers,
      as: 'customer',
    },
    {
      model: AllAddresses,
      as: 'all_addresses',
    },
    {
      model: SettingsColorcombinations,
      as: 'color',
    }],
    where: {
      id: id
    },
  };
  
  Reservations.findOne(queryOptions)
  .then((reservation) => {
    const transformedReservation = {
      ...reservation.toJSON(),
      items: reservation.items.map(item => ({
        ...item.toJSON(),
        family: item?.families?.family??'',
        // display_name: item?.families?.display_name??'',
        price_group_id: item.price_group_id,
        extras: item.item_extras.length>0? item.item_extras.map(item_extra=>item_extra.extras).sort((a, b)=>a.id - b.id) : [],
      }))
      .map(item => ({
        ...item,
        families: undefined,
        item_extras: undefined
      }))
      .sort((a, b) => a.display_name.localeCompare(b.display_name)) 
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
                family_id: item.family_id,
                display_name: item.display_name,
                price_group_id: item.price_group_id,
                quantity: item.quantity,
                price: item.price,
              })
              .then(updatedItem => {
                item.id = updatedItem.id;
                saveReservationItemsExtras(item.id, item.extras)
                  .then(() => resolve(item))
                  .catch(error => reject(error));
              })
              .catch(error => reject(error));
            } else {
              ReservationItems.create({
                reservation_id: req.body.id,
                display_name: item.display_name,
                family_id: item.family_id,
                price_group_id: item.price_group_id,
                quantity: item.quantity,
                price: item.price,
                size: item.size,
              })
              .then(newItem => {
                item.id = newItem.id;
                saveReservationItemsExtras(item.id, item.extras)
                  .then(() => resolve(item))
                  .catch(error => reject(error));
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

const saveReservationItemsExtras = (reservationItemId, extras) => {
  return new Promise((resolve, reject) => {
    ReservationItemsExtras.destroy({ where: { item_id: reservationItemId } })
      .then(() => {
        if (!extras || !Array.isArray(extras) || extras.length === 0) {
          resolve();
        } else {
          Promise.all(extras.map(extra => 
            ReservationItemsExtras.create({
              item_id: reservationItemId,
              extra_id: extra.id,
            })
          ))
            .then(() => {
              resolve();
            })
            .catch(error => {
              reject(error);
            });
        }
      })
      .catch(error => {
        reject(error);
      });
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

  console.log(req.body);

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
      const out_amount = stageInfo.out_amount || 0;
      const totalReserved = parseInt(out_amount);
      const remainingQuantity = availableQuantity - totalReserved;

      if (requestedQuantity > remainingQuantity) {
        hasInsufficientQuantity = true;
      }

      response.push({
        line: item.line + ' ' + item.size,
        requested: requestedQuantity,
        available: remainingQuantity || 0,
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

export const exportReservation = async (req, res, next) => {
  const id = req.params.id;

  let queryOptions = {
    include: [{ 
      model: ReservationItems, 
      as: 'items',
      include: [
        { 
          model: ProductFamilies, 
          as: 'families', 
          attributes: ['family', 'display_name'],
        },
        {
          model: ReservationItemsExtras,
          as: 'item_extras',
          include: {
            model: SettingsExtras,
            as: 'extras'
          }
        }
      ],
    },
    {
      model: CustomerCustomers,
      as: 'customer',
    },
    {
      model: AllAddresses,
      as: 'all_addresses',
    },
    {
      model: SettingsColorcombinations,
      as: 'color',
    }],
    where: {
      id: id
    },
  };
  
  const reservationRow = await Reservations.findOne(queryOptions);

  const reservation = {
    ...reservationRow.toJSON(),
    items: reservationRow.items.map(item => ({
      ...item.toJSON(),
      family: item?.families?.family??'',
      display_name: item?.families?.display_name??'',
      summary: item?.families?.summary??'',
      price_group_id: item.price_group_id,
      extras: item.item_extras.length>0? item.item_extras.map(item_extra=>item_extra.extras).sort((a, b)=>a.id - b.id) : [],
    }))
    .map(item => ({
      ...item,
      families: undefined,
      item_extras: undefined
    }))
    .sort((a, b) => a.display_name.localeCompare(b.display_name)) 
  };

  const stage = [
    'DRAFT',
    'PROVISIONAL',
    'CONFIRMED',
    'CHECKEDOUT',
    'CHECKEDIN',
  ];

  const totalHours = (reservation.end_date.getTime() - reservation.start_date.getTime()) / (1000 * 60 * 60);
  const days = Math.floor(totalHours / 24);

  try {
    let htmlContent = ` 
      <h1 style="text-align: center;">HHI Rentals LLC</h1>
      <h4 style="text-align: center;">59B New Orleans Road, Hilton Head, SC, 29928, US 843.785.2730</h4>
      <table>
        <tr><td width="150" style="padding:2px 30px 2px 0; font-weight:700;">Reservation</td><td>${reservation.order_number}</td></tr>
        <tr><td width="150" style="padding:2px 30px 2px 0; font-weight:700;">Invoice</td><td></td></tr>
        <tr><td width="150" style="padding:2px 30px 2px 0; font-weight:700;">Stage</td><td>${stage[reservation.stage]}</td></tr>
        <tr><td width="150" style="padding:2px 30px 2px 0; font-weight:700;">Type</td><td></td></tr>
        <tr><td width="150" style="padding:2px 30px 2px 0; font-weight:700;">First Name</td><td>${reservation.customer?.first_name??''}</td></tr>
        <tr><td width="150" style="padding:2px 30px 2px 0; font-weight:700;">Last Name</td><td>${reservation.customer?.last_name??''}</td></tr>
        <tr><td width="150" style="padding:2px 30px 2px 0; font-weight:700;">Email</td><td>${reservation.customer?.email??''}</td></tr>
        <tr><td width="150" style="padding:2px 30px 2px 0; font-weight:700;">Phone Number</td><td>+1 ${reservation.customer?.phone_number??''}</td></tr>
        <tr><td width="150" style="padding:2px 30px 2px 0; font-weight:700;">Delivery Street / Unit Number</td><td>${reservation.all_addresses?.number??''} ${reservation.all_addresses?.street??''}</td></tr>
        <tr><td width="150" style="padding:2px 30px 2px 0; font-weight:700;">Delivery Street / Property Name</td><td>${reservation.all_addresses?.property_name??''}</td></tr>
        <tr><td width="150" style="padding:2px 30px 2px 0; font-weight:700;">From</td><td>${new Date(reservation.start_date).toLocaleString('en-US', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                }) + ' @ 08:00 AM'??''}</td></tr>
        <tr><td width="150" style="padding:2px 30px 2px 0; font-weight:700;">From Location</td><td></td></tr>
        <tr><td width="150" style="padding:2px 30px 2px 0; font-weight:700;">To</td><td>${new Date(reservation.end_date).toLocaleString('en-US', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                }) + ' @ 08:00 AM'??''}</td></tr>
        <tr><td width="150" style="padding:2px 30px 2px 0; font-weight:700;">Duration</td><td>${days} Day(s)</td></tr>
        <tr><td width="150" style="padding:2px 30px 2px 0; font-weight:700;">Total Price</td><td>${reservation.total_price.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td></tr>
        <tr><td width="150" style="padding:2px 30px 2px 0; font-weight:700;">Total Rec'd</td><td></td></tr>
        <tr><td width="150" style="padding:2px 30px 2px 0; font-weight:700;">Balance</td><td></td></tr>
      </table>
      <table style="border-collapse: collapse; margin-top:50px;">
        <thead>
          <tr style="border-bottom: 2px solid black">
            <th width="200" style="text-align:left;">Bike</th>
            <th width="500" style="text-align:left;">Description</th>
            <th width="80" style="text-align:left;">Size</th>
            <th width="50" style="text-align:left;">Tax</th>
            <th width="80" style="text-align:left;">Price</th>
          </tr>
        </thead>
        <tbody>`;

    htmlContent += reservation.items.map(item=>(
      `<tr style="border-bottom: 1px solid #999;">
        <td style="padding: 10px 4px;">${item.display_name}</td>
        <td style="padding: 10px 4px;">${item.summary}</td>
        <td style="padding: 10px 4px;">${item.size || ''}</td>
        <td style="padding-left: 10px;"><sup><i>1</i></sup></td>
        <td style="text-align:right;">${item.price.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
      </tr>`
    )).join('');;

    htmlContent += `</tbody>
      </table>
      <div style="display:flex; justify-content:flex-end; border-top: 2px solid #999;">
        <table style="border-collapse: collapse; margin-top:12px;">
          <tr>
            <td style="text-align:right; padding-right:20px;" width="200"><b>Subtotal (excl. tax)</b></td>
            <td style="text-align:right;">${reservation.subtotal.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
          </tr>
          <tr>
            <td style="text-align:right; padding-right:20px;"><sup>*</sup> Discount</td>
            <td style="text-align:right;">-${reservation.discount_amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
          </tr>
          <tr>
            <td style="text-align:right; padding-right:20px;"><b>Discounted Subtotal</b></td>
            <td style="text-align:right;">${(reservation.subtotal - reservation.discount_amount).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
          </tr>
          <tr>
            <td style="text-align:right; padding-right:20px;"><sup>2</sup>delivery</td>
            <td style="text-align:right;">$0.00</td>
          </tr>
          <tr>
            <td style="text-align:right; padding-right:20px;"><sup>1</sup>gst</td>
            <td style="text-align:right;">$0.00</td>
          </tr>
          <tr>
            <td style="text-align:right; padding-right:20px;"><b>Total Tax</b></td>
            <td style="text-align:right;">${reservation.tax_amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
          </tr>
          <tr>
            <td style="text-align:right; padding-right:20px; padding-top:16px; font-size:18px; font-weight:700;">Total</td>
            <td style="text-align:right;  padding-top:16px; font-size:18px; font-weight:700;">${reservation.total_price.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
          </tr>
        </table>
      </div>
      <Section style="margin: 50px 0;">
        <p>TERMS AND CONDITIONS</p>
        <p></p>
      </Section>
      <Section style="margin: 50px 0;">
        <p>CONDITIONS OF RENTAL</p>
        <p>In the context of the rental agreement with HHI Rentals, LLC, the term "equipment" refers to all items available for rent by the company to the Customer. It is important to note that the equipment is leased to the Customer, with no transfer of right, title, or interest, and will continue to be the property of HHI Rentals, LLC. The term "Customer" specifically denotes the inpidual identified in the rental agreement and any other inpiduals for whom they have procured equipment. The inpidual identified in the rental agreement confirms that they are at least 18 years old and possess the authority to legally commit to these Terms and Conditions on behalf of ALL members in their party.  </p>
      </Section>
      <Section style="margin: 50px 0;">
        <p>WAIVER OF LIABILITY</p>
        <p>In the rental agreement, it is understood and accepted that the use of the equipment exposes the Customer to potential hazards. In acknowledgment of the inherent risks related to the rental and use of the equipment, the Customer affirms, on behalf of themselves and all inpiduals included in the reservation, that they are physically and mentally capable of participating in the activity and using the equipment. The Customer further acknowledges that they are engaging in these activities willingly and voluntarily. They knowingly and freely assume all such risks, both those that are known and unknown, including, but not limited to, personal bodily and mental injury, accidents, illnesses, and even death, even if such occurrences arise from the negligence of parties released from liability as outlined herein. The Customer also takes on full responsibility for their participation, assuming all risks and responsibilities referred to above. Additionally, the Customer accepts all responsibility for any damage to or loss of personal property (their own or that of others caused by the Customer) resulting from any accidents that may occur.  
         In exchange for the services or equipment provided, the Customer, acting on behalf of their heirs, successors, assigns, next of kin, and personal representatives, hereby releases and forever discharges and absolves HHI Rentals, LLC, its DBAs, principals, directors, trustees, officers, owners, agents, and employees from any liability arising from the activity. The Customer waives any claims for damages resulting from any cause, encompassing but not limited to personal, bodily, or mental injury, disability, death, and loss or damage to person or property, whether caused by the negligence of the aforementioned released parties or otherwise. Furthermore, the Customer agrees to indemnify and safeguard HHI Rentals, LLC, its DBAs, principals, directors, trustees, officers, owners, agents, and employees from all claims, judgments, and costs, including attorney's fees, accrued in connection with any legal action initiated due to the Customer's use of the equipment.  </p>
      </Section>
      <Section style="margin: 50px 0;">
        <p>HELMETS</p>
        <p>HHI Rentals, LLC advises Customers to use a helmet when riding any type of bicycle. Helmets are provided for Customer use, or Customers can choose to bring their own. Customers who opt not to use a helmet do so voluntarily and assume any associated risks.</p>
      </Section>
      <Section style="margin: 50px 0;">
        <p>PAYMENTS</p>
        <p>All payments shall be made in full at the time of order. Orders may be canceled up to fourteen (14) days prior to delivery date. After that time, all orders are final and no rain checks or refunds will be given. Customer may purchase **cancelation insurance** which provides a full refund for any reason. *Cancelation insurance* applies only to the items for which it was purchased. For a full refund, *cancelation insurance* must be purchased on each item for which it is offered. Once equipment is delivered, should Customer not be able to utilize equipment for the full rental period for any reason, no refund for unused time will be given. *Cancelation insurance* does not apply once items are delivered. All sales are final and no refunds or returns for rented or purchased items.  </p>
      </Section>
      <Section style="margin: 50px 0;">
        <p>DELIVERY, RIDE OFF, & PICKUP</p>
        <p>Delivery and pick-up of equipment is included on all orders over  $50 within the traditional tourist destination areas of Hilton Head. Delivery fee for less than $50 or to areas outside of the traditional tourist areas is $25 each trip plus any applicable gate fees. HHI Rentals, LLC reserves the right to include delivery at a lower amount or refuse to deliver to non-tourist areas at its sole discretion. HHI Rentals, LLC may add the Sea Pines bike fee on the invoice, if not added by customer at time of order. Should there be a gate fee associated with entrance to a private neighborhood for which HHI Rentals, LLC does not have a commercial pass, Customer shall provide a pass or pay the cost associated with obtaining such pass. Customer must provide delivery address at time of order.</p>
        <p>Customer agrees to pay a switch-out fee if they order the wrong size, style, or quantity of equipment. However, they may exchange the equipment at one of HHI Rental, LLC's facilities at no additional charge.</p>
        <p>Customer may ride off from HHI Rentals, LLC's facility at 59B New Orleans Road or Hilton Head Beach and Tennis stand only. No ride-off rentals are allowed from any other location. All Customers staying at Hilton Head Resort must pick up from and return items to one of our facilities. We do not provide delivery or pickup at Hilton Head Resort. Failure to return items will result in a $100 charge.</p>
        <p>All orders end at 8:00 AM on the last day listed on the agreement. We will begin pickup as early as 8:00 AM so please ensure the bikes and equipment are locked where we left them. If we attempt to pick up the items and they are not available, we will charge an amount equal to the current 1 day rental rate on all items listed in the order as a fee for the second trip. During times of high demand, HHI Rentals, LLC reserves the right to deliver orders for Saturday delivery the following Sunday morning without any discount owed to or right to cancel by Customer.</p>
        <p>Customer agrees HHI Rentals, LLC has the right to terminate this agreement and the rental contract at any time due to Customer's actions or improper conduct and re-take possession of equipment. HHI Rentals, LLC and its DBAs may enter the property or premises where the equipment is located to effect its return without liability for trespassing.  </p>
      </Section>
      <Section style="margin: 50px 0;">
        <p>CUSTOMER INSPECTION</p>
        <p> Customer agrees and acknowledges they are to inspect equipment upon receipt and should they find any equipment not in proper mechanical or aesthetic condition, they shall immediately notify HHI Rentals, LLC through one of its DBAs. Upon use of equipment, Customer accepts the condition of equipment as is, agrees it is in proper functioning condition, and accepts responsibility for the care of equipment while in Customer's possession. Customer further understands equipment may not have visibility enhancement equipment, such as reflectors, blinking lights, or other lights, and agrees to use of equipment in its delivered condition.  </p>
      </Section>
      <Section style="margin: 50px 0;">
        <p>RESPONSIBILITY FOR DAMAGE, LOSS AND/OR LATE RETURN</p>
        <p> Customer agrees that they will return equipment in the same condition as it was at rental, normal wear and tear excepted. Customer assumes liability for any and all damage or loss of equipment and damage or loss to personal property, accident/injury to other persons related to the use of equipment. It is Customer's responsibility to prevent damage, loss, or theft of equipment. Customer shall not misuse or abuse equipment and agrees to not subject equipment to any water, unsafe use, use while under the effect of alcohol or drugs, and not assign its rights to use of equipment. Customer shall comply with all laws, ordinances, and regulations governing use of equipment and return equipment to the same location as it was delivered to them at the end of their rental period clean and undamaged. Customer is responsible for the cost of excessive cleaning and to repair any damage to equipment while in Customer's possession at the normal shop rate plus retail cost of repair parts required to return equipment to is condition at time of rental, unless Damage Waiver purchased at time of rental. Customer agrees any bicycle ridden in wet sand is subject to a minimum $75 cleaning and repair charge. Should equipment be lost or stolen, Customer agrees to pay the current replacement cost. There are no warranties, expressed or implied, in connection with the use of the rented equipment. Should equipment not be returned or available for pickup at the agreed day and time, Customer shall be charged an additional fee equal to the one day rental rate for all items on the order for each day not available for pickup. Customer agrees HHI Rentals, LLC may charge the credit card on file for any damage, loss, or late return fees.  </p>
      </Section>
      <Section style="margin: 50px 0;">
        <p>CHOICE OF LAW AND VENUE</p>
        <p> Certainly! The rental and this agreement shall be governed and interpreted solely in accordance with the law of the State of South Carolina. Any litigation involving the use of equipment shall be brought solely within the State of South Carolina and shall be in the exclusive jurisdiction of the courts of Beaufort County South Carolina. If any provision is deemed invalid or unenforceable, the remainder of this agreement remains in full force and effect.  </p>
      </Section>
      <Section style="margin: 50px 0;">
        <p>USE OF EQUIPMENT</p>
        <p> Certainly! Here's the summary of the additional terms: 1. **Safe Usage and Compliance**: - Customer agrees to use equipment in a safe manner in accordance with all South Carolina traffic laws and regulations, as well as the regulations of the Town of Hilton Head and neighborhood requirements. - Customer shall not use phones or cameras while riding. - Customer shall only ride on open paths, trails, and roads and shall not trespass. 2. **Protection from Water Damage**: - Customer shall not subject equipment to any body of water, including the ocean, and is responsible for all water damage. 3. **Equipment Modification and Safe Use**: - Customer agrees not to modify, change, add, or remove items from equipment. - Customer is responsible for the safe use of equipment for all members of its group and shall ensure their safe use of equipment. - Customers understand how to use the equipment. 4. **Child Safety and Compliance**: - Customer agrees no child will be left unattended in any child seat, carrier, highchair, pack and play, crib, or any other equipment. - Customer agrees to comply with the minimum/maximum age and weight standards listed in HHI Rentals' online order page. This comprehensive summary covers the key points of the additional terms for the agreement.  </p>
      </Section>
      <Section style="margin: 50px 0;">
        <p>ACCEPTANCE OF TERMS AND CONDITIONS</p>
        <p> Customer understands and agrees to its acceptance of HHI Rentals, LLC's Terms and Conditions by either checking the acceptance box during online or kiosk ordering; having the Terms and Conditions link emailed to Customer with their confirmation email; and/or through their use of equipment constitutes the equivalent of a legal signature confirming their agreement to all Terms and Conditions set forth in this agreement. Should Customer not agree with these Terms and Conditions, Customer shall not utilize any equipment and immediately contact HHI Rentals, LLC at the number listed in its rental communications.  </p>
      </Section>
      <p><span>Signed:</span><span style="display:inline-block; margin-left:12px; width:200px; border-bottom:1px dotted gray;"></span></p>
      <p style="padding-top:8px; border-top:1px solid black; text-align:center;">bikerentalmanager.com - Printed: ${new Date().toLocaleString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })} - Language: en</p>
    `;

    const outputPath = `uploads/${reservation.order_number}.pdf`;

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    const pdfOptions = {
      path: outputPath,
      format: 'A4',
      margin: {
        top: '40px',
        bottom: '40px',
        left: '40px',
        right: '40px'
      }
    };

    await page.setContent(htmlContent);
    const pdfBuffer = await page.pdf(pdfOptions);

    await browser.close();

    res.setHeader('Content-Type', 'application/pdf');
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error exporting reservation:', error);
    res.status(500).send('Error exporting reservation');
  }
};

export const scanBarcode = async (req, res, next) => {
  try {
    let barcode = req.body.barcode;
    let reservation_id = req.body.reservation_id;
    let queryOptions = {
      include: [
        {
          model: ProductFamilies,
          as: 'family',
          attributes: ['family', 'display_name'],
        },
      ],
      where: { 
        barcode: barcode,
      },
    };

    const product = await ProductProducts.findOne(queryOptions);
 
    if(!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    console.log("product.status---------------------------------------------");
    console.log(product.status);
    if(product.status == 2){
      return res.status(403).json({ error: "This product is already checked out" });
    }else if(product.status != 0 && product.status != 1 && product.status != 3){
      return res.status(403).json({ error: "This product is currently unavailable" });
    }
    
    const displayName = product.family.display_name;

    console.log("product---------------------------------");
    console.log(product.status);
    console.log(displayName);

    const availableProductItem = await ReservationItems.findOne({
      where:{
        reservation_id: reservation_id,
        display_name: displayName,
        barcode: null,
        status: null
      }
    })

    console.log("availableProductItem---------------------------------");
    console.log(availableProductItem);

    if(!availableProductItem) {
      return res.status(404).json({ error: "This product is not associated with this reservation" });
    }

    await product.update({
      status: 2,
    });

    await availableProductItem.update({
      barcode: product.barcode,
      status: 3
    });

    res.status(200).json({ 
      item_id: availableProductItem.id,
      barcode: product.barcode,
      message: "Updated the item status successfully" 
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "An error occurred" });
  }
};

export const checkedInBarcode = async (req, res, next) => {
  try {
    let barcode = req.body.barcode;
    let reservation_id = req.body.reservation_id;
    let queryOptions = {
      include: [
        {
          model: ProductFamilies,
          as: 'family',
          attributes: ['family', 'display_name'],
        },
      ],
      where: { 
        barcode: barcode,
      },
    };

    const product = await ProductProducts.findOne(queryOptions);
 
    if(!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    if(product.status == 3){
      return res.status(403).json({ error: "This product is already checked in" });
    }else if(product.status != 2){
      return res.status(403).json({ error: "This product is not checked out. Only checked in product can be checked out." });
    }
    
    const displayName = product.family.display_name;

    console.log("product---------------------------------");
    console.log(product.status);
    console.log(displayName);

    const availableProductItem = await ReservationItems.findOne({
      where:{
        reservation_id: reservation_id,
        display_name: displayName,
        barcode: barcode,
        status: 3
      }
    })

    console.log("availableProductItem---------------------------------");
    console.log(availableProductItem);

    if(!availableProductItem) {
      return res.status(404).json({ error: "This product is not associated with this reservation" });
    }

    await product.update({
      status: 3,
    });

    await availableProductItem.update({
      barcode: product.barcode,
      status: 4
    });

    res.status(200).json({ 
      item_id: availableProductItem.id,
      barcode: product.barcode,
      message: "Updated the item status successfully" 
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "An error occurred" });
  }
};