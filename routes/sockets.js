import { Server } from 'socket.io';

export const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CORS_ALLOW_ORIGIN,
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('truck/location', (data) => {
      console.log("Truck location data received:", data);
    });

    socket.on('disconnect', () => {
      console.log('A user disconnected');
    });
  });
};
