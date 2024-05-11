import express from "express";
import sequelize from "./utils/database";
import router from "./routes/routes";
import dotenv from "dotenv";
import cors from "cors";
import jwt from 'jsonwebtoken';
import * as Sentry from "@sentry/node";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ALLOW_ORIGIN,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

Sentry.init({
  dsn: "https://159363fd933eaee705ee9f3d4467ab59@o382651.ingest.us.sentry.io/4507070894833664",

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
});

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

const verifyToken = (req, res, next) => {
  let token = req.headers.authorization;

  const excludedRoutes = [
    '/login',
    '/signup',
    '/resetpass',
    '/changepass',
    '/newpassword',
    '/getstoredetailbyurl',
    '/address/search',
    '/stripe/sendreservationconfirmationemail/',
    '/uploads',
    '/exportpdf',
    '/forecasting',
  ];

  const path = req.originalUrl.split('?')[0];

  if (excludedRoutes.some(route => path.includes(route))) {
    return next();
  }

  if (!token) {
    return res.status(401).json({ error: 'Authorization token is missing' });
  }

  if (token.startsWith('Bearer ')) {
    token = token.slice(7);
  }else return res.status(401).json({ error: 'Token is invalid or expired' });

  jwt.verify(token, process.env.JWT_REFRESH_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Token is invalid or expired' });
    }
    req.user = {
      email: decoded.email,
      userId: decoded.userId,
      userName: decoded.userName
    };
    next();
  });
};
app.use(verifyToken);
app.use(router);

sequelize.sync();

app.listen(process.env.BASE_PORT);
