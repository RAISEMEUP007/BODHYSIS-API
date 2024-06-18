import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import sequelize from '../utils/database';
import { Op } from 'sequelize';
import ExcelJS from 'exceljs'

import AllAddresses from '../models/all_addresses';
import Forecasting from '../models/marketing/forecasting';
import SettingsStoreDetails from '../models/settings/settings_storedetails.js';

dotenv.config();

export const searchAddress = async (req, res, next) => {
  try {
    const { str, store_id } = req.params;
    const searchWords = str.split(' ');

    const storeDetail = await SettingsStoreDetails.findOne({
      where: {
        id: store_id
      }
    })

    const use_beach_address = storeDetail?.use_beach_address ? true : false;

    const addressResults = await Promise.all([
      // AllAddresses.findAll({
      //   where: {
      //     [Op.or]: [
      //       { number: { [Op.like]: `%${str}%` } },
      //       { property_name: { [Op.like]: `%${str}%` } },
      //       { street: { [Op.like]: `%${str}%` } },
      //       { plantation: { [Op.like]: `%${str}%` } }
      //     ]
      //   },
      //   limit: 10
      // }),
      ...searchWords.map(async (word) => {

        let whereCondition = {
          [Op.or]: [
            { number: { [Op.like]: `${word}%` } },
            { property_name: { [Op.like]: `%${word}%` } },
            { street: { [Op.like]: `%${word}%` } },
            { plantation: { [Op.like]: `%${word}%` } }
          ]
        }

        if (!use_beach_address) {
          whereCondition[Op.and] = [
            { plantation: { [Op.notLike]: '%Beach & Tennis%' }}
          ];
        }

        return await AllAddresses.findAll({
          where: whereCondition,
          order: ['number', 'street', 'property_name', 'plantation'],
          limit: 20
        });
      })
    ]);

    let addresses = addressResults.flat();
    addresses = addresses.slice(0, 20);

    res.json(addresses);
  } catch (error) {
    console.error('Error in address search:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

export const createAddress = (req, res, next) => {
  AllAddresses.create(req.body)
  .then(newAddress => {
    res.status(201).json({ message: 'Address created successfully', address: newAddress });
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

export const updateAddress = (req, res, next) => {
  const updateFields = req.body;

  AllAddresses.update(updateFields, { where: { id: req.body.id } })
  .then(newAddress => {
    res.status(201).json({ message: 'Address updated successfully', address: newAddress });
  })
  .catch(error => {
    if(error.errors && error.errors[0].validatorKey == 'not_unique'){
      const message = error.errors[0].message;
      const capitalizedMessage = message.charAt(0).toUpperCase() + message.slice(1);
      res.status(409).json({ error: capitalizedMessage});
    }else res.status(500).json({ error: "Internal server error" });
  });
}

export const getAddressesData = (req, res, next) => {
  const { searchKey } = req.body;
  const queryOptions = {
    order: ['plantation', 'street', 'number', 'property_name'],
  };
  if (searchKey) {
    queryOptions.where = {
      [Op.or]: [
        { number: { [Op.like]: `%${searchKey}%` } },
        { street: { [Op.like]: `%${searchKey}%` } },
        { plantation: { [Op.like]: `%${searchKey}%` } },
        { property_name: { [Op.like]: `%${searchKey}%` } }
      ]
    };
  }
  AllAddresses.findAll(queryOptions)
  .then((addresses) => {
    res.status(200).json(addresses);
  })
  .catch(err => {
    console.error(err);
    res.status(502).json({error: "An error occurred"});
  });
};

const executeQueryForWeek = (weekStartDate, weekEndDate) => {
  const query = `
    SELECT
      t1.id,
      count(t3.id) as quantity
    FROM
      all_addresses as t1
      INNER JOIN reservations as t2
        ON t1.id = t2.address_id
      INNER JOIN reservation_items as t3
        ON t2.id = t3.reservation_id
    WHERE t2.start_date < '${weekEndDate} 23:59:59'
      AND t2.end_date > '${weekStartDate} 00:00:00'
    GROUP BY t1.id
  `;

  return sequelize.query(query, { type: sequelize.QueryTypes.SELECT });
};

export const getReservationSummary = async (req, res, next) => {
  const year = new Date().getFullYear();
  const weeksArray = getWeeksInYear(year);

  for (const week of weeksArray) {
    const { start_date: startDate, end_date: endDate } = week;

    try {
      const result = await executeQueryForWeek(startDate, endDate);
      week.queryResult = result; 
    } catch (error) {
      console.error(`Error executing query for week ${startDate} to ${endDate}:`, error);
    }
  }

  res.send(weeksArray);
};

const getWeeksInYear = (year) => {
  const weeksArray = [];
  let currentDate = new Date(year - 1, 11, 31);

  while (currentDate.getDay() !== 6) {
    currentDate.setDate(currentDate.getDate() - 1);
  }

  const lastDayOfYear = new Date(year, 11, 31);

  while (currentDate < lastDayOfYear) {
    const weekStart = new Date(currentDate);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    if (weekEnd > lastDayOfYear) {
      break;
    }

    const formattedStartDate = `${(weekStart.getMonth() + 1).toString().padStart(2, '0')}/${weekStart.getDate().toString().padStart(2, '0')}/${weekStart.getFullYear().toString().slice(-2)}`;
    const formattedEndDate = `${(weekEnd.getMonth() + 1).toString().padStart(2, '0')}/${weekEnd.getDate().toString().padStart(2, '0')}/${weekEnd.getFullYear().toString().slice(-2)}`;


    weeksArray.push({ 
      start_date: weekStart.toISOString().split('T')[0], 
      end_date: weekEnd.toISOString().split('T')[0],
      formattedStartDate: formattedStartDate,
      formattedEndDate: formattedEndDate,
    });

    currentDate.setDate(currentDate.getDate() + 7);
  }

  return weeksArray;
};

const getWeeksArrayInRange = (startDate, endDate) => {
  const weeksArray = [];
  let currentDate = new Date(`${startDate} 00:00:00`);

  while (currentDate <= new Date(`${endDate}  00:00:00`)) {
    const weekStart = currentDate;
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    
    if (weekEnd > new Date(`${endDate}  00:00:00`)) {
      break;
    }

    const formattedStartDate = `${(weekStart.getMonth() + 1).toString().padStart(2, '0')}/${weekStart.getDate().toString().padStart(2, '0')}/${weekStart.getFullYear().toString().slice(-2)}`;
    const formattedEndDate = `${(weekEnd.getMonth() + 1).toString().padStart(2, '0')}/${weekEnd.getDate().toString().padStart(2, '0')}/${weekEnd.getFullYear().toString().slice(-2)}`;

    weeksArray.push({ 
      start_date: weekStart.toISOString().split('T')[0], 
      end_date: weekEnd.toISOString().split('T')[0],
      formattedStartDate: formattedStartDate,
      formattedEndDate: formattedEndDate,
    });

    currentDate.setDate(currentDate.getDate() + 7);
  }

  return weeksArray;
};

const getDaysArrayInRange = (startDate, endDate) => {
  const daysArray = [];
  let currentDate = new Date(`${startDate} 00:00:00`);

  while (currentDate <= new Date(`${endDate}  00:00:00`)) {
    if (currentDate > new Date(`${endDate}  00:00:00`)) {
      break;
    }

    const date = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${currentDate.getDate().toString().padStart(2, '0')}`;
    const formattedDate = `${(currentDate.getMonth() + 1).toString().padStart(2, '0')}/${currentDate.getDate().toString().padStart(2, '0')}/${currentDate.getFullYear().toString().slice(-2)}`;

    daysArray.push({ 
      date, formattedDate,
    });

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return daysArray;
};

export const deleteAddress = (req, res, next) => {
  AllAddresses.destroy({ where: { id: req.body.id } })
    .then((result) => {
      if (result === 1) {
        res.status(200).json({ message: "Address deleted successfully" });
      } else {
        res.status(404).json({ error: "Address not found" });
      }
    })
    .catch((error) => {
      res.status(500).json({ error: "Internal server error" });
    });
};

export const createForecasting = async (req, res, next) => {
  try {
    const { address_id, booked_guests, date, last_scrapper_source_url } = req.body;
 
    let fields = {
      address_id,
      booked_guests,
      date,
      last_scrapper_source_url,
    };
 
    const addressDetail = await AllAddresses.findOne({where:{id:address_id}});
    if(addressDetail?.guests){
      fields.max_guests = addressDetail.guests;
      fields.percentage = Math.round(booked_guests/addressDetail.guests * 100)/100;
    }else {
      fields.max_guests = null;
      fields.percentage = 0;
    }
 
    const newForecasting = await Forecasting.create(fields);
    res.status(201).json({ message: 'Forecasting created successfully', forecasting: newForecasting });
  } catch (error) {
    console.error(error);
    if (error.errors && error.errors[0].validatorKey === 'not_unique') {
      const message = error.errors[0].message;
      const capitalizedMessage = message.charAt(0).toUpperCase() + message.slice(1);
      res.status(409).json({ error: capitalizedMessage });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
}

export const updateForecasting = async (req, res, next) => {
  try {
    const { id, address_id, booked_guests, date, last_scrapper_source_url } = req.body;
    const updateFields = {
      address_id,
      booked_guests,
      date,
      last_scrapper_source_url,
    };

    const addressDetail = await AllAddresses.findOne({where:{id:address_id}});
    if(addressDetail?.guests){
      fields.max_guests = addressDetail.guests;
      fields.percentage = Math.round(booked_guests/addressDetail.guests * 100)/100;
    }else {
      fields.max_guests = null;
      fields.percentage = 0;
    }

    const updatedForecasting = await Forecasting.update(updateFields, { where: { id: id } });
    if (updatedForecasting[0] === 1) {
      res.status(200).json({ message: 'Forecasting updated successfully', forecasting: updatedForecasting });
    } else {
      res.status(404).json({ error: 'Forecasting not found' });
    }
  } catch (error) {
    if (error.errors && error.errors[0].validatorKey === 'not_unique') {
      const message = error.errors[0].message;
      const capitalizedMessage = message.charAt(0).toUpperCase() + message.slice(1);
      res.status(409).json({ error: capitalizedMessage });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export const deleteForecasting = (req, res, next) => {
  Forecasting.destroy({ where: { id: req.body.id } })
    .then((result) => {
      if (result === 1) {
        res.status(200).json({ message: "Address deleted successfully" });
      } else {
        res.status(404).json({ error: "Address not found" });
      }
    })
    .catch((error) => {
      res.status(500).json({ error: "Internal server error" });
    });
};

// export const getForecastingData = async (req, res, next) => {
//   try{
//     const { searchOptions } = req.body;
//     const queryOptions = {
//       order: ['plantation', 'street', 'number', 'property_name'],
//       where: {
//         plantation: { [Op.notLike]: '%Beach & Tennis%' }
//       },
//       logging:true
//     };

//     if(searchOptions.xploriefif) queryOptions.where.xploriefif = true;
//     if(searchOptions.xplorievoucher) queryOptions.where.xplorievoucher = true;

//     const addresses = await AllAddresses.findAll(queryOptions);

//     const year = new Date().getFullYear();
//     const weeksArray = getWeeksArrayInRange(searchOptions.start_date, searchOptions.end_date);

//     let totalNights = 0;

//     for (const week of weeksArray) {
//       const { start_date: startDate, end_date: endDate } = week;

//       try {
//         const result = await weeklySummary(startDate, endDate);
//         week.queryResult = result;
//       } catch (error) {
//         console.error(`Error executing query for week ${startDate} to ${endDate}:`, error);
//       }
//     }

//     for (const address of addresses){
//       address.dataValues.queryResult = [];
//       for (const week of weeksArray){
//         const { queryResult } = week;
//         let filteredData = queryResult.find((result) => address.id === result.address_id);
//         if(filteredData) totalNights += filteredData.nights
//         address.dataValues.queryResult.push(filteredData || null);
//       }
//     }

//     res.send({weeksArray:getWeeksArrayInRange(searchOptions.start_date, searchOptions.end_date), gridData:addresses, totalNights});
//   } catch (error) {
//     console.error(error);
//     if (error.errors && error.errors[0].validatorKey === 'not_unique') {
//       const message = error.errors[0].message;
//       const capitalizedMessage = message.charAt(0).toUpperCase() + message.slice(1);
//       res.status(409).json({ error: capitalizedMessage });
//     } else {
//       res.status(500).json({ error: 'Internal server error' });
//     }
//   }
// };

export const getForecastingData = async (req, res, next) => {
  try{
    const { searchOptions } = req.body;
    const queryOptions = {
      order: ['plantation', 'street', 'number', 'property_name'],
      where: {
        plantation: { [Op.notLike]: '%Beach & Tennis%' }
      },
    };

    if(searchOptions.xploriefif) queryOptions.where.xploriefif = true;
    if(searchOptions.xplorievoucher) queryOptions.where.xplorievoucher = true;

    const addresses = await AllAddresses.findAll(queryOptions);

    const year = new Date().getFullYear();
    const daysArray = getDaysArrayInRange(searchOptions.start_date, searchOptions.end_date);
    const dailySummary = await getDailySummary(searchOptions.start_date, searchOptions.end_date);

    let totalNights = 0;

    for (const address of addresses){
      address.dataValues.queryResult = [];
      let dailySummaryByAddress = dailySummary.filter((summary) => address.id === summary.address_id);
      for (const day of daysArray){
        let filteredData = dailySummaryByAddress.find((result) =>{
          return day.date == result.date 
        });
        if(filteredData){
          totalNights ++; 
          address.dataValues.queryResult.push({
            percentage: filteredData.percentage,
            nights: 1,
          });
        }else {
          address.dataValues.queryResult.push(null);
        }
      }
    }

    res.send({daysArray, gridData:addresses, totalNights});
  } catch (error) {
    console.error(error);
    if (error.errors && error.errors[0].validatorKey === 'not_unique') {
      const message = error.errors[0].message;
      const capitalizedMessage = message.charAt(0).toUpperCase() + message.slice(1);
      res.status(409).json({ error: capitalizedMessage });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

export const exportForecastingData = async (req, res, next) => {

  try{
    const queryOptions = {
      order: ['plantation', 'street', 'number', 'property_name'],
      where: {
        plantation: { [Op.notLike]: '%Beach & Tennis%' }
      },
    };

    const addresses = await AllAddresses.findAll(queryOptions);

    const year = new Date().getFullYear();
    const daysArray = getDaysArrayInRange(req.query.start_date, req.query.end_date);
    const dailySummary = await getDailySummary(req.query.start_date, req.query.end_date);

    const workbook = new ExcelJS.Workbook();
    workbook.removeWorksheet('My sheet')
    const worksheet = workbook.addWorksheet('My sheet')

    const columns = [
      { header: 'Plantation/Area', key: 'plantation', width: 20 },
      { header: 'Xploriefif', key: 'xploriefif', width: 10 },
      { header: 'Xplorievoucher', key: 'xplorievoucher', width: 15 },
      { header: 'Number', key: 'number', width: 10 },
      { header: 'Street', key: 'street', width: 25},
      { header: 'Property_name', key: 'property_name', width: 25 },
      { header: 'Weekly Potential', key: 'weekly_potential', width: 15 },
      { header: 'Guests', key: 'guests', width: 10},
    ];

    for (const day of daysArray){
      columns.push({header: day.formattedDate, key: day.date, width: 10})
    }

    worksheet.columns = columns;

    for (const address of addresses){
      let row = {...address.dataValues};
      if(row.xploriefif == true) row.xploriefif = 1;
      else if(row.xploriefif == false) row.xploriefif = 0;

      if(row.xplorievoucher == true) row.xplorievoucher = 1;
      else if(row.xplorievoucher == false) row.xplorievoucher = 0;

      let dailySummaryByAddress = dailySummary.filter((summary) => address.id === summary.address_id);
      for (const day of daysArray){
        let filteredData = dailySummaryByAddress.find((result) =>{
          return day.date == result.date 
        });
        if(filteredData){
          // address.dataValues.queryResult.push({
          //   percentage: filteredData.percentage,
          //   nights: 1,
          // });
          row[day.date] = 1
        }else {
          // address.dataValues.queryResult.push(null);
          row[day.date] = ""
        }
      }

      worksheet.addRow(row)
    }

    const buffer = await workbook.xlsx.writeBuffer();

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `Content-Disposition': 'attachment; filename="export.xlsx"`);
    res.send(buffer);

  } catch (error) {
    console.error(error);
    if (error.errors && error.errors[0].validatorKey === 'not_unique') {
      const message = error.errors[0].message;
      const capitalizedMessage = message.charAt(0).toUpperCase() + message.slice(1);
      res.status(409).json({ error: capitalizedMessage });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

const weeklySummary = (weekStartDate, weekEndDate) => {
  const query = `
    SELECT
      t1.address_id,
      avg(t1.booked_guests) as potential,
      avg(t1.percentage) as percentage,
      count(DISTINCT t1.date) as nights
    FROM
      forecasting as t1
    WHERE t1.date < '${weekEndDate} 23:59:59'
      AND t1.date > '${weekStartDate} 00:00:00'
    GROUP BY t1.address_id
  `;

  return sequelize.query(query, { type: sequelize.QueryTypes.SELECT });
};

const getDailySummary = (startDate, endDate) => {
  const query = `
    SELECT
      *
    FROM
      forecasting as t1
    WHERE t1.date BETWEEN '${startDate}' AND '${endDate}'
    ORDER BY t1.address_id, t1.date
  `;

  return sequelize.query(query, { type: sequelize.QueryTypes.SELECT });
};