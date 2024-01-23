import Reservations from "../models/reservations.js";

export const createReservation = (req, res, next) => {
  try {
    const {
      products,
      promo_code,
      start_location_id,
      end_location_id,
      start_date,
      end_date,
      customer_id,
    } = req.body;

    // Check required params
    if (
      !products.length ||
      !start_location_id ||
      !end_location_id ||
      !start_date ||
      !end_date||
      !customer_id
    ) {
      res.status(409).json({
        error:
          "Bad request. Products, start_location_id, end_location_id, start_date, end_date, or customer_id was missing.",
      });
      return;
    }
    // Check each product for validity
    let productsValid = true;
    for (let i = 0; i < products.length; ++i) {
      let p = products[i];
      if (!p.product_id || !p.quantity) {
        productsValid = false;
      }
    }
    if (!productsValid) {
      res.status(409).json({
        error:
          "Bad request. Products must contain both a product_id and quantity attribute.",
      });
      return
    }
    Reservations.create(req.body).then((result) => {
      res.status(201).json({ message: 'Reservation created successfully', reservation: result })
      return
    })
  } catch (error) {
    res.status(409).json({
      error: JSON.stringify(error),
    });
    return
  }
};
