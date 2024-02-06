import Reservations, {
  ReservationProductType,
  ReservationType,
} from "../models/reservations";
import { Request, Response } from "express";
import SettingsLocations, {
  SettingsLocationType,
} from "../models/settings/settings_locations";
import ProductProducts from "../models/product/product_products";

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
  try {
    const reservationModel = await Reservations.findOne({
      where: {
        id,
      },
    });
    const reservation: ReservationType = reservationModel?.toJSON();

    console.log("reservation", reservation);

    const locationModel = await SettingsLocations.findOne({
      where: {
        id: reservation.start_location_id,
      },
    });

    const location = await locationModel?.toJSON();

    const productsResult = [];

    for (let i = 0; i < reservation.products.length; ++i) {
      if (reservation.products[i].product_id) {
        const product = await ProductProducts.findOne({
          where: {
            id: reservation.products[i].product_id,
          },
        });
        console.log("product", product?.toJSON());

        const json = product.toJSON();
        if (product) {
          productsResult.push({
            ...json,
            quantity: reservation.products[i].quantity ?? 0,
            price: reservation.products[i].price ?? 0,
          });
        }
      }
    }
    const result = {
      ...reservation,
      start_location_name: location.location,
      end_location_name: location.location,
      products: productsResult,
    };
    return res.status(201).json(result);
  } catch (error) {
    return res.status(409).json({
      error: JSON.stringify(error),
    });
  }
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
