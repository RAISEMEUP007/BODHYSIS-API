import express from "express";
import sequelize from "./utils/database.js";
import router from "./routes/routes.js";
import dotenv from "dotenv";
import cors from "cors";
import multer from "multer";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ALLOW_ORIGIN,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

console.log(`Database host is ${process.env.DB_HOST}`);
console.log(`Database name is ${process.env.DB_NAME}`);
console.log(`Database username is ${process.env.DB_USERNAME}`);
console.log(`Database password is ${process.env.DB_PASSWORD}`);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use((_, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use("/uploads", express.static("uploads"));
app.use(router);

sequelize.sync();

app.listen(5000);
