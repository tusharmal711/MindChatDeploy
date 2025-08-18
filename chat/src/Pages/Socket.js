import { io } from "socket.io-client";

export const socket = io("http://localhost:3001/", {
  transports: ["websocket"], // Forces WebSocket connection
  withCredentials: true, // Allows cross-origin credentials
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 2000
});


