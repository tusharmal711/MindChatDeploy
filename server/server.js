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
const allowedOrigins = [
  "https://mindchat-one.vercel.app",
  "http://localhost:3000"
];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  },
});

const PORT = process.env.PORT || 7000;
const MONGOURL = process.env.MONGO_URL;

app.use(express.json());
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin like mobile apps or curl
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
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
  messageId: String,
  userName: String,
  text: String,
  room: String,
  msgStatus : String,
  timeStamp: String,
 
});
const Messages = mongoose.model("Messages", messageSchema);
export default Messages;
// Socket.io connection
const roomUsers = {};
const phoneToSocket = new Map();
const ongoingCalls = new Map();
io.on("connection", async (socket) => {




  console.log("User connected:", socket.id);

  socket.on("join_room", async (room) => {
    socket.join(room);
   socket.room = room;
  

    const clients = await io.in(room).fetchSockets();
   
    // If more than 1 user is in the room, notify everyone they're online
    if (clients.length > 1) {
     console.log("bc");
      io.to(room).emit("show_online", "Online");
    } else {
       socket.emit("show_online", "Offline"); // Only user in room
       
     
    }

    // Fetch and send previous messages for the room
    const messages = await Messages.find({ room }).sort({ timeStamp: 1 }).limit(50);
    socket.emit("chat_history", messages);
  });

  socket.on("send_message", async (data) => {
    const {messageId,userName, text, room, msgStatus, timeStamp } = data;

    // Save text message to MongoDB
    const newMessage = new Messages({messageId, userName, text, room, msgStatus,timeStamp });
    await newMessage.save();

    // Broadcast to the roomd
    io.to(room).emit("receive_message", data);
  });

  socket.on("typing", ({ room, userName }) => {
    socket.to(room).emit("show_typing", userName);
  });



  
  socket.on("stop_typing", ({ room }) => {
    socket.to(room).emit("hide_typing");
  });





  // You can update the database here if needed

  // Notify others in the room
socket.on("message_seen", ({ messageId, room }) => {
  io.to(room).emit("message_seen_ack", { messageId });
   console.log("Server got message_seen for:", messageId, "in room:", room);
});







// socket.on("join_call", ({ myPhone, targetPhone }) => {
//   console.log(`[JOIN_CALL] ${myPhone} is trying to call ${targetPhone}`);

//   if (!myPhone || !targetPhone) {
//     console.log(`[JOIN_CALL] Missing myPhone or targetPhone`);
//     return;
//   }

//   const mySocket = phoneToSocket.get(myPhone);
//   const targetSocket = phoneToSocket.get(targetPhone);

//   console.log(`[JOIN_CALL] mySocket:`, mySocket ? mySocket : "undefined");
//   console.log(`[JOIN_CALL] targetSocket:`, targetSocket ? targetSocket : "undefined");

//   if (!mySocket || !targetSocket) {
//     const offlineType = !mySocket ? "caller-offline" : "target-offline";
//     console.log(`[JOIN_CALL] ${offlineType} emitted`);
//     socket.emit(offlineType);
//     return;
//   }

//   // Check if target is already in a call
//   if (ongoingCalls.has(targetPhone)) {
//     console.log(`[JOIN_CALL] Target ${targetPhone} is already in a call with ${ongoingCalls.get(targetPhone)}`);
    
//   }

//   ongoingCalls.set(myPhone, targetPhone);
//   ongoingCalls.set(targetPhone, myPhone);
//   io.to(mySocket).emit("you-are-caller");
//   console.log(`[JOIN_CALL] Emitting 'you-are-caller' to ${myPhone}`);
  
// io.to(targetSocket).emit("you-are-callee");
//   console.log(`[JOIN_CALL] Emitting 'you-are-callee' to ${targetPhone}`);


//   console.log(`[JOIN_CALL] ${mySocket} is calling ${targetSocket} successfully`);
// });

// socket.on("end_call", () => {
//   const otherPhone = ongoingCalls.get(socket.phone);
//   if (otherPhone) {
//     const otherSocket = phoneToSocket.get(otherPhone);
//     if (otherSocket)  io.to(otherSocket).emit("call-ended");
//     ongoingCalls.delete(otherPhone);
//   }
//   ongoingCalls.delete(socket.phone);
//   console.log(`${socket.phone} ended the call`);
// });



















socket.on("register", (phone) => { 
  socket.phone = phone; 
  phoneToSocket.set(phone, socket.id); 
  console.log(`[REGISTER] Phone ${phone} registered with socket ID ${socket.id}`);
});


socket.on("join_call", async ({ roomId, myPhone , targetPhone}) => {
 
   if (!roomId || !myPhone || !targetPhone) return;
   socket.phone = myPhone;
   
  if (socket.alreadyJoined) return;
  socket.alreadyJoined = true;

 console.log("join_call called");

const [phone1, phone2] = roomId.split("_"); // both numbers in this call
console.log("socket.phone =", socket.phone);

console.log(roomId);
  const contactPhone = targetPhone;
console.log(targetPhone);



  const mySocket = phoneToSocket.get(myPhone);
  const targetSocket = phoneToSocket.get(targetPhone);


  console.log(`[JOIN_CALL] mySocket:`, mySocket ? mySocket : "undefined");
  console.log(`[JOIN_CALL] targetSocket:`, targetSocket ? targetSocket : "undefined");

  if (!mySocket || !targetSocket) {
    const offlineType = !mySocket ? "caller-offline" : "target-offline";
    console.log(`[JOIN_CALL] ${offlineType} emitted`);
    socket.emit(offlineType);
    return;
  }

  // Check if target is already in a call
  if (ongoingCalls.has(contactPhone)) {
    console.log(`[JOIN_CALL] Target ${targetPhone} is already in a call with ${ongoingCalls.get(targetPhone)}`);
     socket.emit("another-call");
  }





  socket.join(roomId);
  socket.roomId = roomId;

  const clients = await io.in(roomId).fetchSockets();

  if (clients.length === 1) {
    
    socket.emit("you-are-caller"); // first user becomes caller
   
     if (targetSocket) {
   
    socket.to(targetSocket).emit("ping-test", myPhone);
    console.log(`[JOIN_CALL] Incoming call sent to ${targetPhone}`);
  }
     console.log(`incomming-call from ${myPhone} to ${targetSocket}`);
  } else if (clients.length === 2) {
    console.log("callee joined");
 ongoingCalls.set(myPhone, targetPhone);
  ongoingCalls.set(targetPhone, myPhone);

    // Notify the new user that they are callee
    socket.emit("you-are-callee");
    console.log("connected");
    // Notify the existing user that a peer joined
    socket.to(roomId).emit("user-joined");
  }
});

socket.on("duration",({duration , roomId})=>{
socket.to(roomId).emit("duration",{duration});
})




// Backend
socket.on("reject", ({ targetPhone }) => {
    const targetSocket = phoneToSocket.get(targetPhone);
    if (targetSocket) {
        io.to(targetSocket).emit("reject");
        console.log(`[CALL_REJECTED] ${socket.phone} rejected call to ${targetPhone}`);
    }
    // Reset ongoing call if necessary
    ongoingCalls.delete(socket.phone);
});



 socket.on("missed-call", ({ targetPhone }) => {
    const targetSocketId = onlineUsers.get(targetPhone);
    if (targetSocketId) {
      io.to(targetSocketId).emit("call-missed", { from: socket.id });
    }
  });




   // Relay WebRTC offer
socket.on("offer", ({ offer, roomId }) => {
  console.log("offer-received-from server side");
  socket.to(roomId).emit("offer", { offer });
});

socket.on("answer", ({ answer, roomId }) => {
  socket.to(roomId).emit("answer", { answer });
});

socket.on("ice-candidate", ({ candidate, roomId }) => {
  socket.to(roomId).emit("ice-candidate", { candidate });
});

socket.on("caller-canceled", ({from,to}) => {
    const targetSocket = phoneToSocket.get(to);

     socket.to(targetSocket).emit("caller-canceled",{from});
     console.log("missed-call");
})
  // End call
  socket.on("end-call", ({roomId}) => {
    console.log("caller-exit");
    io.to(roomId).emit("end-call");
    io.socketsLeave(roomId); // Force all out of the room
     socket.alreadyJoined = false;
    delete socket.roomId;
  });

socket.on("video-status", ({ isVideoOff , roomId }) => {
  socket.to(roomId).emit("video-status", { isVideoOff });
});

socket.on("mute-status", ({ isMuted , roomId }) => {
  socket.to(roomId).emit("mute-status", { isMuted });
});




  
// Handle delete for everyone event
socket.on('delete_for_everyone', ({ room }) => {
  socket.to(room).emit('chats_deleted', { room });
});



  socket.on("disconnect", async() => {

    console.log("User Disconnected:", socket.id);
     const room = socket.room;
    if (room) {
      const clients = await io.in(room).fetchSockets();
      if (clients.length <= 1) {
        io.to(room).emit("show_online", "Offline");
      }
    }

console.log(`[DISCONNECT] ${socket.id} disconnected`);

  // Clear from phoneToSocket
  if (socket.phone) {
    phoneToSocket.delete(socket.phone);
  }

  // Clear from ongoingCalls
  if (socket.phone && ongoingCalls.has(socket.phone)) {
    const partner = ongoingCalls.get(socket.phone);
    ongoingCalls.delete(socket.phone);
    ongoingCalls.delete(partner);

    // Inform partner that call ended
    const partnerSocket = phoneToSocket.get(partner);
    if (partnerSocket) {
      io.to(partnerSocket).emit("caller-exit");
    }

    console.log(`[DISCONNECT] Cleared call between ${socket.phone} and ${partner}`);
  }

 socket.alreadyJoined = false;




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
      messageId: messageData.messageId,
      userName: messageData.userName,
      text: filePath, // Store the file URL or the text
      room: messageData.room,
      timeStamp: messageData.timeStamp,
      msgStatus:messageData.msgStatus
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








// Delete a single message
app.post('/api/deleteMsg', async (req, res) => {
  try {
    const { room, deleteType, messageId } = req.body;

    if (deleteType === "forEveryone") {
      // Delete for everyone - remove from database
      await Messages.findOneAndUpdate(
    { messageId: messageId, room: room },
    {
      $set: {
        text: "🚫 This message was deleted",
      },
    }
  );

      // Notify all clients in the room
      io.to(room).emit("message_deleted", { messageId });
      
    } else {
      // Delete for me only - just update the frontend state
      // (No database change needed)
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).json({ error: "Failed to delete message" });
  }
});




// GET last message for multiple rooms
app.post("/api/getLastMessages", async (req, res) => {
  const { rooms } = req.body; // rooms = ["123_456", "123_789", ...]

  try {
    const lastMessages = await Promise.all(
      rooms.map(async (room) => {
        const message = await Messages.find({ room })
          .sort({  _id: -1 })
          .limit(1)
          .lean();
        return message[0] || null;
      })
    );

    res.json({ success: true, lastMessages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});




app.post('/api/updateSeen', async (req, res) => {
  try {
    const { room } = req.body;

    if (!room) {
      return res.status(400).json({ success: false, message: "Room ID missing" });
    }

    await Messages.updateMany({ room }, { $set: { msgStatus: "seen" } });
io.to(room).emit("message_updated", {
room:room,
  msgStatus: "seen"
});
    res.status(200).json({ success: true, message: "Message status updated to seen" });
  } catch (error) {
    console.error("Update Seen Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});



app.post('/api/phoneDp', async (req, res) => {
  try {
    const { phone } = req.body;
    const user = await User.findOne({ phone });

    if (!user) {
      return res.status(404).json({ dp: null });
    }

    console.log("User DP:", user.dp);
    return res.status(200).json({ dp: user.dp }); // ✅ return here
  } catch (error) {
    console.error("Error in /api/phoneDp:", error.message);
    return res.status(500).json({ message: error.message });
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

const tokenMap = {}; // Stored in memory — resets when server restarts

app.post("/register-token", (req, res) => {
  const { mobile, token } = req.body;
  if (mobile && token) {
    tokenMap[mobile] = token;
    console.log(`Token registered for ${mobile}: ${token}`);
    res.send({ success: true });
  } else {
    res.status(400).send({ error: "Missing mobile or token" });
  }
});

app.post("/notify", async (req, res) => {
  const { mobile, title, body} = req.body;

  // 📍 Get the FCM token from in-memory map
  const token = tokenMap[mobile];

  if (!token) {
    return res.status(404).send(" No token found for this number");
  }

  // 📦 Compose full message payload
  const message = {
    token,
    notification: {
      title,
      body,
     
       // optional: will be undefined if not passed
    // },
    // android: {
    //   notification: {
    //     icon: icon || "default",
    //     sound: sound || "default",
    //   },
    // },
    // webpush: {
    //   notification: {
    //     icon: icon || "./Images/app.png",
    //     sound: sound || "default",
    //   },
    // },
    // apns: {
    //   payload: {
    //     aps: {
    //       sound: sound || "default",
    //     },
    //   },
    // },
    },
    android : {
        priority : "high"
    },
     webpush: {
       headers : {
        Urgency : "high",
       },
       notification: {
      icon: "https://mindchat-one.vercel.app/Images/app.png", // ✅ Full HTTPS URL only
      sound : "https://mindchat-one.vercel.app/Sounds/notifications.mp3",
         badge: "https://mindchat-one.vercel.app/Images/app.png",
         vibrate : [200,100,200],
    },
    fcm_options: {
      link: "https://mindchat-one.vercel.app/", // 🔗 URL to open when clicked
    },
  },
  
  
  
  
  }

  try {
    await admin.messaging().send(message);
    res.send("✅ Notification sent to " + mobile);
  } catch (err) {
    console.error("❌ FCM Error:", err);

    // 🧹 Clean up invalid token
    if (err.errorInfo?.code === 'messaging/registration-token-not-registered') {
      delete tokenMap[mobile];
      console.log(`🧹 Removed invalid token for ${mobile}`);
    }

    res.status(500).send("❌ Failed to send notification");
  }
});



// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on: http://localhost:${PORT}`);
});
