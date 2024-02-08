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

// export const createReservation = (req: Request, res: Response) => {
//   try {
//     const {
//       promo_code,
//       start_location_id,
//       end_location_id,
//       start_date,
//       end_date,
//       customer_id,
//     } = req.body;
//     // Check required params
//     const products: Array<ReservationProductType> = req.body.products;
//     if (
//       !products.length ||
//       !start_location_id ||
//       !end_location_id ||
//       !start_date ||
//       !end_date ||
//       !customer_id
//     ) {
//       res.status(409).json({
//         error:
//           "Bad request. Products, start_location_id, end_location_id, start_date, end_date, or customer_id was missing.",
//       });
//       return;
//     }
//     // Check each product for validity
//     let productsValid = true;
//     for (let i = 0; i < products.length; ++i) {
//       let p = products[i];
//       if (!p.product_id || !p.quantity || !p.product_name || isNaN(p.price)) {
//         productsValid = false;
//       }
//     }
//     if (!productsValid) {
//       res.status(409).json({
//         error:
//           "Bad request. Products must contain both a product_id, quantity, product_name and quantity attribute.",
//       });
//       return;
//     }
//     Reservations.create(req.body).then((result: any) => {
//       return res.status(201).json({
//         message: "Reservation created successfully",
//         reservation: result,
//       });
//     });
//   } catch (error) {
//     return res.status(409).json({
//       error: JSON.stringify(error),
//     });
//   }
// };

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
    t1.customer_id,
    t2.first_name,
    t2.last_name,
    CONCAT(t2.first_name, ' ', t2.last_name) AS full_name,
    t1.brand_id,
    t3.brand,
    t1.start_location_id,
    t4.location AS start_location,
    t1.end_location_id,
    t4.location AS end_location,
    t1.start_date,
    t1.end_date,
    t1.promo_code,
    t1.stage,
    t1.note
  FROM
    reservations AS t1
    LEFT JOIN customer_customers AS t2
    ON t1.customer_id = t2.id
    LEFT JOIN price_brands AS t3
    ON t1.brand_id = t3.id
    LEFT JOIN settings_locations AS t4
    ON t1.start_location_id = t4.id
    LEFT JOIN settings_locations AS t5
    ON t1.end_location_id = t5.id
  LIMIT 200
  `;

  sequelize.query(
    query,
    { type: sequelize.QueryTypes.SELECT }
  )
  .then((reservations) => {
    // console.log(reservations);
    // let reservationsJSON = [];
    // for (let i = 0; i < reservations.length; i++) {
    //   reservationsJSON.push(reservations[i].dataValues);
    // }
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

// export const getReservationDetails = async (req: Request, res: Response) => {
//   const id = req.params.id;
//   try {
//     const reservationModel = await Reservations.findOne({
//       where: {
//         id,
//       },
//     });
//     const reservation: ReservationType = reservationModel?.toJSON();

//     console.log("reservation", reservation);

//     const locationModel = await SettingsLocations.findOne({
//       where: {
//         id: reservation.start_location_id,
//       },
//     });

//     const location = await locationModel?.toJSON();

//     const productsResult = [];

//     for (let i = 0; i < reservation.products.length; ++i) {
//       if (reservation.products[i].product_id) {
//         const product = await ProductProducts.findOne({
//           where: {
//             id: reservation.products[i].product_id,
//           },
//         });
//         console.log("product", product?.toJSON());

//         const json = product.toJSON();
//         if (product) {
//           productsResult.push({
//             ...json,
//             quantity: reservation.products[i].quantity ?? 0,
//             price: reservation.products[i].price ?? 0,
//           });
//         }
//       }
//     }
//     const result = {
//       ...reservation,
//       start_location_name: location.location,
//       end_location_name: location.location,
//       products: productsResult,
//     };
//     return res.status(201).json(result);
//   } catch (error) {
//     return res.status(409).json({
//       error: JSON.stringify(error),
//     });
//   }
// };

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

/*
export interface ReservationType {
  id: number
  start_date: String
  end_date: String
  promo_code?: string
  start_location_id: number
  end_location_id: number
  price_index: number
  duration: number,
  products: Array<ReservationProductType>
  customer_id: number
  total_price: number
}
*/

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