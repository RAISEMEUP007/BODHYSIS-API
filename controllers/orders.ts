import { NextFunction,Response,Request } from "express";

export const getOrders= (req:Request, res:Response, next:NextFunction) => {
  return res.json(["order1", "order2", "order3"])
}