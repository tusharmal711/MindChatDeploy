import { io } from "socket.io-client";
import Cookies from "js-cookie";
import { useEffect } from "react";
export const socket = io("http://localhost:3001/", {
  transports: ["websocket"], // Forces WebSocket connection
  withCredentials: true, // Allows cross-origin credentials
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 2000
});

const myPhone = Cookies.get("mobile") || sessionStorage.getItem("phone");

socket.on("connect", () => {
  console.log("Connected with ID:", socket.id); 
  socket.emit("register", myPhone);            
});
