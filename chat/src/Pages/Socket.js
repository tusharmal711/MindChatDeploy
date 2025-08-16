import { io } from "socket.io-client";

export const socket = io("https://mindchatdeploy-2.onrender.com/", {
  transports: ["websocket"], // Forces WebSocket connection
  withCredentials: true, // Allows cross-origin credentials
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 2000
});


