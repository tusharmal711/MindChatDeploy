import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import { Server } from "socket.io";
import http from "http";
import route from "./userRoute.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import User from "./User.js";
import Contact from "./Contact.js";
dotenv.config();
const FRONTEND = process.env.FRONTEND;
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: FRONTEND,
    methods: ["GET", "POST","PUT","DELETE"],
    
  },
});
app.use((req, res, next) => {
  const allowedOrigins = ['https://mindchat-one.vercel.app']; // List of allowed origins
  const requestOrigin = req.headers.origin;

  if (allowedOrigins.includes(requestOrigin)) {
      res.setHeader('Access-Control-Allow-Origin', requestOrigin);
  }
  // Allow other common headers
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', true); // If you are sending credentials

  // Continue to the next middleware
  next();
});
app.use(cors());
const PORT = process.env.PORT || 7000;
const MONGOURL = process.env.MONGO_URL;

app.use(express.json());

app.use("/api", route);
app.use('/uploads', express.static('public/uploads'));

// Home Route
app.get("/", (req, res) => {
  res.send("Welcome to the home page");
});

// Ensure 'uploads' folder exists
const publicDir = path.join(process.cwd(), "public");
const uploadDir = path.join(publicDir, "uploads");

if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir);
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) =>
    cb(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(MONGOURL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("DB is connected");
  } catch (error) {
    console.error("DB is not connected", error.message);
    process.exit(1);
  }
};
connectDB();

// Message schema and model
const messageSchema = new mongoose.Schema({
  userName: String,
  text: String,
  room: String,
  timeStamp: String,
});
const Messages = mongoose.model("Messages", messageSchema);
export default Messages;
// Socket.io connection
io.on("connection", async (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join_room", async (room) => {
    socket.join(room);

    // Fetch and send previous messages for the room
    const messages = await Messages.find({ room }).sort({ timeStamp: 1 }).limit(50);
    socket.emit("chat_history", messages);
  });

  socket.on("send_message", async (data) => {
    const { userName, text, room, timeStamp } = data;

    // Save text message to MongoDB
    const newMessage = new Messages({ userName, text, room, timeStamp });
    await newMessage.save();

    // Broadcast to the room
    io.to(room).emit("receive_message", data);
  });

  socket.on("typing", ({ room, userName }) => {
    socket.to(room).emit("show_typing", userName);
  });

  socket.on("stop_typing", ({ room }) => {
    socket.to(room).emit("hide_typing");
  });
// Handle delete for everyone event
socket.on('delete_for_everyone', ({ room }) => {
  socket.to(room).emit('chats_deleted', { room });
});
  socket.on("disconnect", () => {
    console.log("User Disconnected:", socket.id);
  });
});

// Endpoint to handle image message uploads
app.post("/api/sendImageMessage", upload.single("image"), async (req, res) => {
  try {
    const messageData = JSON.parse(req.body.messageData);
    const imagePath = req.file ? req.file.filename : null;

    // Save image message to MongoDB
    const newMessage = new Messages({
      userName: messageData.userName,
      text: imagePath ? `uploads/${imagePath}` : messageData.text,
      room: messageData.room,
      timeStamp: messageData.timeStamp,
      userId: String, // sender's user ID
      deletedFor: [{
        type: String, // will store user IDs who deleted this message
        default: []
      }],
    });
    await newMessage.save();

    // Broadcast image message to the room
    io.to(messageData.room).emit("receive_message", {
      ...messageData,
      text: imagePath ? `uploads/${imagePath}` : messageData.text,
    });

    res.status(200).json({ message: "Image message sent successfully!" });
  } catch (error) {
    console.error("Error sending image message:", error);
    res.status(500).json({ error: "Failed to send image message." });
  }
});





app.post("/api/changeDp", upload.single("dp"), async (req, res) => {
  try {
    const email = req.body.email;
    const dp = req.file ? req.file.filename : null; // Get uploaded file name

    if (!email || !dp) {
      return res.status(400).json({ error: "Email and image are required" });
    }

    // Update user DP in MongoDB
    const updateDp = await User.updateOne({ email }, { $set: { dp } });

    if (updateDp.modifiedCount === 0) {
      return res.status(404).json({ error: "User not found or DP not updated" });
    }

    res.status(200).json({ message: "Successfully updated", dp });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});











// API to Add a New Contact
app.post("/api/addContact",async (req, res) => {
  
  try {
   
    const { phone, username, mobile , room }=req.body;

     const user = new Contact({ phone, username, mobile , room});
      await user.save();
    

    res.status(200).json({ message: "User added successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }

});


// Delete chats endpoint
app.post('/api/deleteChats', async (req, res) => {
  try {
    const { room, deleteType, userId } = req.body;
    
    if (deleteType === "forEveryone") {
      // Delete all messages in the room
      await Messages.deleteMany({ room });
      
      // Notify all participants via socket.io
      io.to(room).emit('chats_deleted', { room });
    } else {
      // Delete only for the requesting user (mark as deleted)
      await Messages.updateMany(
        { room },
        { $addToSet: { deletedFor: userId } }
      );
    }
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error deleting chats:', error);
    res.status(500).json({ error: 'Failed to delete chats' });
  }
});





// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on: http://localhost:${PORT}`);
});
