import express from 'express';
import sequelize from './utils/database.js';
import router from './routes/routes.js';
import dotenv from 'dotenv';
import cors from "cors";
import http from 'http';
import { initializeSocket } from './routes/sockets.js';

dotenv.config();

const app = express();

app.use(cors({
  origin: process.env.CORS_ALLOW_ORIGIN,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

console.log(`Database host is ${process.env.DB_HOST}`);
console.log(`Database name is ${process.env.DB_NAME}`);
console.log(`Database username is ${process.env.DB_USERNAME}`);
console.log(`Database password is ${process.env.DB_PASSWORD}`);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use(router);

const server = http.createServer(app);
initializeSocket(server);

sequelize.sync();

server.listen(process.env.BASE_PORT, () => {
  console.log(`Server is running on port ${process.env.BASE_PORT}`);
});
