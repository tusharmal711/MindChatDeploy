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
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
const app = express();
const server = http.createServer(app);
const FRONTEND=process.env.FRONTEND;
const io = new Server(server, {
  cors: {
    origin: "https://mindchat-one.vercel.app/",
    methods: ["GET", "POST"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  },
});
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://mindchat-one.vercel.app");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

const PORT = process.env.PORT || 7000;
const MONGOURL = process.env.MONGO_URL;

app.use(express.json());
app.use(cors());
app.use("/api", route);
app.use(express.static('public'));



app.use('/uploads', express.static('public/uploads', {
  setHeaders: (res, path, stat) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
  }
}));



// Home Route
app.get("/", (req, res) => {
  res.send("Welcome to the home page");
});


cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});


const upload = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => {
      let folder = 'uploads/documents';
      let resource_type = 'auto'; // Let Cloudinary decide

      if (file.mimetype.startsWith('image')) {
        folder = 'uploads/images';
        resource_type = 'image';
      } else if (file.mimetype.startsWith('video')) {
        folder = 'uploads/videos';
        resource_type = 'video';
      }else if(file.mimetype.startsWith('document')){
        folder='uploads/documents';
        resource_type='raw';
      }

      return {
        folder,
        resource_type,
        format: file.mimetype.split("/")[1],
      };
    },
  }),
});








// Ensure 'uploads' folder exists
// const publicDir = path.join(process.cwd(), "public");
// const uploadDir = path.join(publicDir, "uploads");

// if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir);
// if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// // Multer configuration for file uploads
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, uploadDir),
//   filename: (req, file, cb) =>
//     cb(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname)),
// });
// const upload = multer({ storage });

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
app.post("/api/sendImageMessage", upload.fields([
  { name: "image", maxCount: 1 },
  { name: "video", maxCount: 1 },
  { name: "document", maxCount: 1 },
]), async (req, res) => {
  try {
    const messageData = JSON.parse(req.body.messageData);

    // Get the file URL (whichever exists)
    const filePath =
      (req.files["image"] ? req.files["image"][0].path : null) ||
      (req.files["video"] ? req.files["video"][0].path : null) ||
      (req.files["document"] ? req.files["document"][0].path : null) ||
      messageData.text; // If no file, keep text

    // Save message to MongoDB (all files stored in `text` field)
    const newMessage = new Messages({
      userName: messageData.userName,
      text: filePath, // Store the file URL or the text
      room: messageData.room,
      timeStamp: messageData.timeStamp,
      userId: messageData.userId, // Sender's user ID
      deletedFor: [],
    });

    await newMessage.save();

    // Emit message to the chat room
    io.to(messageData.room).emit("receive_message", {
      ...messageData,
      text: filePath, // Send file URL or text to frontend
    });

    res.json({
      success: true,
      message: "Message saved",
      fileUrl: filePath, // Return the file URL if uploaded
    });

  } catch (error) {
    console.error("Error uploading:", error);
    res.status(500).json({
      success: false,
      message: "Upload failed",
      error: error.message,
    });
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

import admin from "firebase-admin";






admin.initializeApp({
  credential: admin.credential.cert({
    type: process.env.FIREBASE_TYPE,
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: process.env.FIREBASE_AUTH_URI,
    token_uri: process.env.FIREBASE_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_CERT_URL,
    client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
    universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN,
  }),
});


// 🔔 FCM Send Function
const sendFCM = async (token, title, body) => {
  const message = {
    token,
    notification: {
      title,
      body,
    },
  };

  return await admin.messaging().send(message);
};

// 🧩 API Endpoint for Notification
app.post("/notify", async (req, res) => {
  const { token, title, body } = req.body;

  try {
    await sendFCM(token, title, body);
    res.status(200).send("Notification sent!");
  } catch (error) {
    console.error("FCM Error:", error);
    res.status(500).send("Failed to send notification");
  }
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on: http://localhost:${PORT}`);
});
