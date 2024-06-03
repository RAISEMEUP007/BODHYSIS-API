import { Request, Response } from "express";
import sequelize from '../utils/database';
import puppeteer from 'puppeteer';
import bwipjs from 'bwip-js'; 

import { getAvaliableQuantitiesByLine, getAvaliableQuantitiesByFamilyIds, getAvaliableQuantityByfamily, getProductFamilyIdsByDisplayName, getPFDByDisplayName } from "./product";
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
import SettingsStoreDetails from '../models/settings/settings_storedetails.js';
import SettingsDocuments from '../models/settings/settings_documents.js';

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
  if(searchOptions && searchOptions.status_filter){
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
    SUM(t8.quantity) as quantity,
    t1.stage,
    t1.color_id
  FROM
    reservations AS t1
    LEFT JOIN customer_customers AS t2
    ON t1.customer_id = t2.id
    LEFT JOIN price_brands AS t3
    ON t1.brand_id = t3.id
    LEFT JOIN settings_discountcodes AS t6
    ON t1.promo_code = t6.id
    LEFT JOIN reservation_items AS t8
    ON t1.id = t8.reservation_id
  WHERE
    t1.start_date >= :start_date
    AND t1.start_date <= :end_date
    ${searchOptions && searchOptions.customer ? `AND CONCAT(t2.first_name, ' ', t2.last_name) LIKE :customer` : ''}
    ${searchOptions && searchOptions.brand ? `AND t3.brand LIKE :brand` : ''}
    ${searchOptions && searchOptions.order_number ? `AND t1.order_number LIKE :order_number` : ''}
    ${searchOptions && searchOptions.stage && Array.isArray(searchOptions.stage) ? `AND t1.stage IN (:stage)` : searchOptions && searchOptions.stage ? `AND (t1.stage = :stage OR :stage IS NULL OR :stage = '')` : ''}
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
    console.error(err);
    res.status(502).json({error: "An error occurred"});
  });
};

export const getReservationsList = (_: Request, res: Response) => {
  try {
    Reservations.findAll({
      order: [["createdAt", "DESC"]],
    }).then((result: any) => {
      return res.status(201).json(result);
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
    console.error(err);
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
        console.error(error);
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
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  });
}

export const updateReservationItem = (req, res, next) => {

  const updateFields = req.body;

  ReservationItems.update(req.body, {
    where: {
      id: req.body.id,
    }
  })
  .then(() => {
    res.status(200).json({ message: 'Reservation item updated successfully' });
  })
  .catch(error => res.status(500).json({ error: error.message }));
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
    console.error(error);
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
    console.error(err);
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
    console.error(error);
    return res.status(500).json({ error: 'An error occurred while verifying quantities' });
  }
};

export const verifyQuantityByDisplayName = async (req, res, next) => {
  const { start_date, end_date, display_name, category_id, quantity, pre_quantity } = req.body;

  if (quantity <= 0) {
    return res.status(400).json({ error: 'Quantity should be greater than 0' });
  }

  try {
    const familyIds = await getProductFamilyIdsByDisplayName(category_id, display_name);
    const availableQuantity = await getAvaliableQuantityByfamily(familyIds);
    const stageAmount = await getStageAmountByDisplayName(start_date, end_date, display_name);

    const inventoryAmount = availableQuantity || 0;
    const out_amount = stageAmount?.out_amount??0;
    const remainingQuantity = inventoryAmount - out_amount;

    const quantities = {
      remainingQuantity,
    }

    if (quantity + (pre_quantity || 0) > remainingQuantity) {
      return res.status(400).json({ error: 'Out of Stock', quantities });
    }

    res.status(200).json({ message: 'In Stock', quantities });
    next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'An error occurred while verifying quantities' });
  }
};

// const getStageAmount = (startDate, endDate, line_id = null) => {
//   let lineIdCondition = '';
//   let replacements = { start_date: startDate, end_date: endDate };

//   if (Array.isArray(line_id)) {
//     lineIdCondition = 'AND t1.line_id IN (:line_id)';
//     replacements.line_id = line_id;
//   } else if (Number.isInteger(line_id)) {
//     lineIdCondition = 'AND t1.line_id = :line_id';
//     replacements.line_id = line_id;
//   }

//   const query = `
//     SELECT
//       t1.line_id,
//       t2.stage,
//       SUM(IF(t2.stage IN (1, 2), t1.quantity, 0)) AS reserved,
//       SUM(IF(t2.stage = 3, t1.quantity, 0)) AS checked_out,
//       SUM(IF(t2.stage = 4, t1.quantity, 0)) AS checked_in,
//       (SUM(IF(t2.stage IN (1, 2), t1.quantity, 0)) + SUM(IF(t2.stage = 3, t1.quantity, 0))) - SUM(IF(t2.stage = 4, t1.quantity, 0)) AS out_amount
//     FROM
//       reservation_items AS t1
//       INNER JOIN reservations AS t2
//         ON t1.reservation_id = t2.id
//     WHERE
//       t2.start_date < :end_date
//       AND t2.end_date > :start_date
//       AND t2.stage IN (1, 2, 3, 4)
//       ${lineIdCondition}
//     GROUP BY t1.line_id, t2.stage;
//   `;

//   return sequelize.query(query, {
//     replacements,
//     type: sequelize.QueryTypes.SELECT
//   }).then(stageAmounts => {
//     const formattedResults = stageAmounts.reduce((acc, cur) => {
//       acc[cur.line_id] = {
//         line_id: cur.line_id,
//         stage: cur.stage,
//         reserved: cur.reserved,
//         checked_out: cur.checked_out,
//         checked_in: cur.checked_in,
//         out_amount: cur.out_amount
//       };
//       return acc;
//     }, {});
//     return formattedResults;
//   }).catch(error => {
//     console.error(error);
//     throw new Error('An error occurred while fetching stage amounts');
//   });
// }

const getStageAmountByDisplayName = async (startDate, endDate, display_name = "") => {
  let lineIdCondition = '';
  let replacements = { start_date: startDate, end_date: endDate, display_name };
 
  // if (Array.isArray(family_id)) {
  //   lineIdCondition = 'AND t1.family_id IN (:family_id)';
  //   replacements.family_id = family_id;
  // } else if (Number.isInteger(family_id)) {
  //   lineIdCondition = 'AND t1.family_id = :family_id';
  //   replacements.family_id = family_id;
  // }

  const query = `
    SELECT
      SUM(IF(t2.stage IN (1, 2), t1.quantity, 0)) AS reserved,
      SUM(IF(t2.stage = 3, t1.quantity, 0)) AS checked_out,
      SUM(IF(t2.stage = 4, t1.quantity, 0)) AS checked_in,
      (SUM(IF(t2.stage IN (1, 2), t1.quantity, 0)) + SUM(IF(t2.stage = 3, t1.quantity, 0))) - SUM(IF(t2.stage = 4, t1.quantity, 0)) AS out_amount
    FROM
      reservation_items AS t1
      INNER JOIN reservations AS t2
        ON t1.reservation_id = t2.id
    WHERE
      t2.start_date <= :end_date
      AND t2.end_date >= :start_date
      AND t2.stage IN (1, 2, 3, 4)
      AND t1.display_name = :display_name
    -- GROUP BY t2.stage;
  `;

  try {
     const stageAmounts = await sequelize.query(query, {
       replacements,
       type: sequelize.QueryTypes.SELECT
     });

    // const formattedResults = stageAmounts.reduce((acc, cur) => {
    //   acc.reserved = cur.reserved;
    //   acc.checked_out = cur.checked_out;
    //   acc.checked_in = cur.checked_in;
    //   acc.out_amount = cur.out_amount;
    //   return acc;
    // }, {});
    return stageAmounts[0];
  } catch (error) {
    console.error(error);
    throw new Error('An error occurred while fetching stage amounts');
  }
}

export const exportReservation = async (req, res, next) => {
  try {
    const id = req.params.id;
    const tc = req.params.tc;

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

    const storeDetail = await SettingsStoreDetails.findOne({
      where: {
        brand_id: reservation.brand_id
      }
    })

    const storeName = storeDetail?.store_name??"";

    const stage = [
      'DRAFT',
      'PROVISIONAL',
      'CONFIRMED',
      'CHECKEDOUT',
      'CHECKEDIN',
    ];

    const totalHours = (new Date(reservation.end_date).getTime() - new Date(reservation.start_date).getTime()) / (1000 * 60 * 60);
    const days = Math.floor(totalHours / 24);
    const barcodeImage = await bwipjs.toBuffer({
      bcid: 'code128',
      text: reservation.order_number,
      scale: 3,
      height: 10,
      includetext: false, 
      textxalign: 'center',
    });

    let htmlContent = ` 
      <h1 style="text-align: center;">${storeName}</h1>
      <h4 style="text-align: center;">59B New Orleans Road, Hilton Head, SC, 29928, US 843.785.2730</h4>
      <img src="data:image/png;base64,${barcodeImage.toString('base64')}" alt="Barcode Image" />
      <table style="margin-top:30px">
        <tr><td width="150" style="padding:2px 30px 2px 0; font-weight:700;">Reservation</td><td>${reservation?.order_number??''}</td></tr>
        <tr><td width="150" style="padding:2px 30px 2px 0; font-weight:700;">Invoice</td><td>${reservation?.order_number??''}</td></tr>
        <tr><td width="150" style="padding:2px 30px 2px 0; font-weight:700;">Note</td><td>${reservation?.note??''}</td></tr>
        <tr><td width="150" style="padding:2px 30px 2px 0; font-weight:700;">Stage</td><td>${stage[reservation.stage]}</td></tr>
        <tr><td width="150" style="padding:2px 30px 2px 0; font-weight:700;">Type</td><td>client</td></tr>
        <tr><td width="150" style="padding:2px 30px 2px 0; font-weight:700;">First Name</td><td>${reservation.customer?.first_name??''}</td></tr>
        <tr><td width="150" style="padding:2px 30px 2px 0; font-weight:700;">Last Name</td><td>${reservation.customer?.last_name??''}</td></tr>
        <tr><td width="150" style="padding:2px 30px 2px 0; font-weight:700;">Email</td><td>${reservation.email ? reservation.email : reservation.customer && reservation.customer.email ? reservation.customer.email : ''}</td></tr>
        <tr><td width="150" style="padding:2px 30px 2px 0; font-weight:700;">Phone Number</td><td>${reservation.phone_number ? reservation.phone_number : reservation.customer && reservation.customer.phone_number ? reservation.customer.phone_number : ''}</td></tr>`

        if(!reservation.use_manual){
          htmlContent += `<tr><td width="150" style="padding:2px 30px 2px 0; font-weight:700;">Delivery Street / Unit Number</td><td>${reservation.all_addresses?.number??''} ${reservation.all_addresses?.street??''}</td></tr>
          <tr><td width="150" style="padding:2px 30px 2px 0; font-weight:700;">Delivery Street / Property Name</td><td>${reservation.all_addresses?.property_name??''}</td></tr>`
        }

        htmlContent += `<tr><td width="150" style="padding:2px 30px 2px 0; font-weight:700;">From</td><td>${new Date(`${reservation.start_date} 0:0:0`).toLocaleString('en-US', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                  }) + ` @ ${storeDetail?.pickup_time}`??''}</td></tr>`

        if(reservation.use_manual){
          htmlContent += `<tr><td width="150" style="padding:2px 30px 2px 0; font-weight:700;">Delivery Address</td><td>${reservation.manual_address??''}</td></tr>`
        }else {
          htmlContent += `<tr><td width="150" style="padding:2px 30px 2px 0; font-weight:700;">From Location</td><td>${reservation.all_addresses?.plantation??''}</td></tr>`
        }
        
        htmlContent += `<tr><td width="150" style="padding:2px 30px 2px 0; font-weight:700;">To</td><td>${new Date(`${reservation.end_date} 0:0:0`).toLocaleString('en-US', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                }) + ` @ ${storeDetail?.dropoff_time}`??''}</td></tr>
        <tr><td width="150" style="padding:2px 30px 2px 0; font-weight:700;">Duration</td><td>${days} Day(s)</td></tr>
        <tr><td width="150" style="padding:2px 30px 2px 0; font-weight:700;">Total Price</td><td>${reservation?.total_price?.toLocaleString('en-US', { style: 'currency', currency: 'USD' })??''}</td></tr>
        <tr><td width="150" style="padding:2px 30px 2px 0; font-weight:700;">Total Rec'd</td><td>${reservation?.paid?.toLocaleString('en-US', { style: 'currency', currency: 'USD' })??''}</td></tr>
        <tr><td width="150" style="padding:2px 30px 2px 0; font-weight:700;">Balance</td><td>${(reservation.paid - reservation.total_price)?.toLocaleString('en-US', { style: 'currency', currency: 'USD' })??''}</td></tr>
      </table>
      <table style="border-collapse: collapse; margin-top:50px;">
        <thead>
          <tr style="border-bottom: 2px solid black">
            <th width="200" style="text-align:left;">Bike</th>
            <th width="500" style="text-align:left;">Extras</th>
            <th width="80" style="text-align:left;">Size</th>
            <th width="50" style="text-align:left;">Tax</th>
            <th width="70" style="text-align:left;">Price</th>
          </tr>
        </thead>
        <tbody>`;
    htmlContent += reservation.items.map(item=>{
      let extras = item.extras.map(extra=>extra.name).join(', ');
      return (
        `<tr style="border-bottom: 1px solid #999;">
          <td style="padding: 10px 4px;">${item.display_name}</td>
          <td style="padding: 10px 4px;">${extras}</td>
          <td style="padding: 10px 4px;">${item.size || ''}</td>
          <td style="padding-left: 10px;">${(item.price * reservation.tax_rate/100)?.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
          <td style="text-align:right;">${item?.price?.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
        </tr>`
      )}).join('');;

    htmlContent += `</tbody>
      </table>
      <div style="display:flex; justify-content:flex-end; border-top: 2px solid #999;">
        <table style="border-collapse: collapse; margin-top:12px;">
          <tr>
            <td style="text-align:right; padding-right:20px;" width="200"><b>Subtotal (excl. tax)</b></td>
            <td style="text-align:right;">${reservation?.subtotal?.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
          </tr>
          <tr>
            <td style="text-align:right; padding-right:20px;"><sup>*</sup> Discount</td>
            <td style="text-align:right;">- ${reservation?.discount_amount?.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
          </tr>
          <tr>
            <td style="text-align:right; padding-right:20px;"><b>Discounted Subtotal</b></td>
            <td style="text-align:right;">${(reservation.subtotal - reservation.discount_amount)?.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
          </tr>
          <tr>
            <td style="text-align:right; padding-right:20px;"><sup>2</sup>driver tip</td>
            <td style="text-align:right;">${(reservation.driver_tip || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
          </tr>
          <tr>
            <td style="text-align:right; padding-right:20px;"><sup>1</sup>gst</td>
            <td style="text-align:right;">$0.00</td>
          </tr>
          <tr>
            <td style="text-align:right; padding-right:20px;"><b>Total Tax</b></td>
            <td style="text-align:right;">${reservation.tax_amount?.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
          </tr>
          <tr>
            <td style="text-align:right; padding-right:20px; padding-top:16px; font-size:18px; font-weight:700;">Total</td>
            <td style="text-align:right;  padding-top:16px; font-size:18px; font-weight:700;">${reservation?.total_price?.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
          </tr>
        </table>
      </div>`

    if(tc == true || tc == 'true'){
      if(storeDetail.is_document){
        const documentDetail = await SettingsDocuments.findOne({
          where:{
            id: storeDetail.document_id,
          }
        })
        if(documentDetail.document_type == 1){
          htmlContent += `<Section style="margin: 50px 0;">
                  <a href="${process.env.BASE_URL + documentDetail.document_file}" download="${documentDetail.document_name}.pdf" target="_blank">
                    ${documentDetail.document_name}.pdf
                  </a>
                </section>`
        }else if(documentDetail.document_content){
          htmlContent += `<Section style="margin: 50px 0;">${documentDetail.document_content}</section>`
        }
      }else {
        htmlContent += `<Section style="margin: 50px 0;">${storeDetail.store_wavier}</section>`
      }
    }

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
    res.setHeader('Content-Disposition', 'inline; filename="'+reservation.order_number+'.pdf"');
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
    if(product.status == 2){
      return res.status(403).json({ error: "This product is already checked out" });
    }else if(product.status != 0 && product.status != 1 && product.status != 3){
      return res.status(403).json({ error: "This product is currently unavailable" });
    }
    
    const displayName = product.family.display_name;
    const availableProductItem = await ReservationItems.findOne({
      where:{
        reservation_id: reservation_id,
        display_name: displayName,
        barcode: null,
        status: null
      }
    })

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
    console.error(err);
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

    const availableProductItem = await ReservationItems.findOne({
      where:{
        reservation_id: reservation_id,
        display_name: displayName,
        barcode: barcode,
        status: 3
      }
    })

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
    console.error(err);
    res.status(500).json({ error: "An error occurred" });
  }
};

export const getAvailableSheet = async (req, res, next) => {
  try {
    let families = await getPFDByDisplayName(33);

    const today = new Date();
    const futureDate = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000);

    for(const family of families){
      family.quantities = [];
      console.log("family.display_name", family.display_name);
      for(let date = new Date(today); date <= futureDate; date.setDate(date.getDate() + 1)){
        const formattedDate = formatDate(date);
        let familyIds = await getProductFamilyIdsByDisplayName(33, family.display_name);
        let availableQuantity = await getAvaliableQuantityByfamily(familyIds);
        let stageAmount = await getStageAmountByDisplayName(formattedDate, formattedDate, family.display_name);

        let inventoryAmount = availableQuantity || 0;
        let out_amount = stageAmount?.out_amount??0;
        let remainingQuantity = inventoryAmount - out_amount;
        console.log("formattedDate", formattedDate);
        console.log("stageAmount", stageAmount);
        family.quantities.push({
          date: formattedDate,
          inventoryAmount,
          remainingQuantity,
          out_amount,
        })
      }
    }

    res.json(families);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred" });
  }
};

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}