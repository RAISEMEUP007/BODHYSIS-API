import Reservations, { ReservationProductType } from "../models/reservations";
import { Request, Response } from "express";

export const createReservation = (req: Request, res: Response) => {
  try {
    const {
      promo_code,
      start_location_id,
      end_location_id,
      start_date,
      end_date,
      customer_id,
    } = req.body;
    // Check required params
    const products: Array<ReservationProductType> = req.body.products;
    if (
      !products.length ||
      !start_location_id ||
      !end_location_id ||
      !start_date ||
      !end_date ||
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
      if (!p.product_id || !p.quantity || !p.product_name || isNaN(p.price)) {
        productsValid = false;
      }
    }
    if (!productsValid) {
      res.status(409).json({
        error:
          "Bad request. Products must contain both a product_id, quantity, product_name and quantity attribute.",
      });
      return;
    }
    Reservations.create(req.body).then((result: any) => {
      return res.status(201).json({
        message: "Reservation created successfully",
        reservation: result,
      });
    });
  } catch (error) {
    return res.status(409).json({
      error: JSON.stringify(error),
    });
  }
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
