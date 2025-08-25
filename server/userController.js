import User from "./User.js";
import Contact from "./Contact.js";
import CallContact from "./CallContact.js";
import crypto from "crypto";
import express from "express";
import nodemailer from "nodemailer";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import Messages from "./server.js";
import fs from 'fs'; // File system module
import path from 'path';
import Friend from "./FriendRequest.js";

dotenv.config();

const sender = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;
const app = express();

app.use(express.json());
app.use(cors());

const generateSecureOTP = (length = 6) => {
  return crypto.randomInt(100000, 999999).toString();
};

const otpSend = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: sender,
    pass: emailPass,
  },
});

// Temporary storage for OTPs
const otpStorage = new Map();

export const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const otp = generateSecureOTP();
   const existUser=await User.findOne({email:email});
   if(existUser){
    res.status(500).json({ success: false, message: "Failed to send OTP" });
   }else{
    await otpSend.sendMail({
      from: `"MindChat" <${sender}>`,
      to: email,
      subject: `MindChat - Code : ${otp}`,
      html: `<div style="font-family: Arial, sans-serif; line-height: 1.5;">
      <div style="padding: 20px; text-align: center;">
      <img src="https://mindchat-one.vercel.app/Images/app.png" alt="Mind Chat Logo"
           style="max-width: 150px; height: 110px; width: 110px;">
    </div>
      <h2>Your Signup Code</h2>
      <p>Please use the following OTP code to complete your verification for signup in MindChat</p>
      <div style="font-size: 24px; font-weight: bold; margin: 20px 0;">
        ${otp}
      </div>
      <p>This code is valid for the next 10 minutes.</p>
      <p>If you did not request this code, please ignore this email.</p>
    </div>`,
    });

    otpStorage.set(email, otp);
    setTimeout(() => otpStorage.delete(email), 300000); // OTP expires in 5 minutes

    res.status(201).json({ success: true, message: "OTP sent successfully" });
   }
   
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ success: false, message: "Failed to send OTP" });
  }
};


export const VerifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    // Validate input
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: "Email and OTP are required" });
    }

    // Check if OTP exists for the given email
    if (!otpStorage.has(email)) {
      return res.status(400).json({ success: false, message: "OTP not found or expired" });
    }

    // Verify OTP
    const storedOtp = otpStorage.get(email);
    if (storedOtp === otp) {
      otpStorage.delete(email); // Remove OTP after successful verification
      return res.status(200).json({ success: true, message: "OTP verified successfully" });
    } else {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const Register = async (req, res) => {
  try {
    const { username, email, phone, password} = req.body;

   

    otpStorage.delete(email);
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, phone,password:hashedPassword});
    await newUser.save();

    res.status(201).json({ success: true, message: "User registered successfully!" });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};




// forgot password is starting from here 
export const sendFpOTP = async (req, res) => {
  try {

    const { email } = req.body;
    const otp = generateSecureOTP();
   const existUser=await User.findOne({email});
   if(!existUser){
    res.status(500).json({ success: false, message: "Failed to send OTP" });
   }else{
   
    await otpSend.sendMail({
       from: `"MindChat" <${sender}>`,
      to: email,
      subject: `MindChat - OTP : ${otp}`,
      html: `<div style="font-family: Arial, sans-serif; line-height: 1.5;">
      <div style="padding: 20px; text-align: center;">
      <img src="https://mindchat-one.vercel.app/Images/app.png" alt="Mind Chat Logo"
           style="max-width: 150px; height: 110px; width: 110px;">
    </div>
      <h2>Your OTP Code</h2>
      <p>Please use the following OTP code to complete your verification for reset password.</p>
      <div style="font-size: 24px; font-weight: bold; margin: 20px 0;">
        ${otp}
      </div>
      <p>This code is valid for the next 10 minutes.</p>
      <p>If you did not request this code, please ignore this email.</p>
    </div>`,
    });

    otpStorage.set(email, otp);
    setTimeout(() => otpStorage.delete(email), 300000); // OTP expires in 5 minutes

     res.status(201).json({ success: true, message: "OTP sent successfully" });
   }
   
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ success: false, message: "Failed to send OTP" });
  }
};

// forgot password is ending here 

























// login credential is starting from here 
export const isLogin = async(req, res) => {
  try {
      const { phone, password } = req.body;

      // Check if user exists
      const user = await User.findOne({ phone });
      if (!user) {
          return res.status(400).json({ message: "User not found" });
      }

      // Compare password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
          return res.status(401).json({ message: "Invalid credentials" });
      }else{
        res.status(200).json({ message: "Login successful"});
        

      }
     
      
      // Generate JWT token
      // const token = jwt.sign({ userId: user._id, phone: user.phone }, "your_secret_key", { expiresIn: "1h" });

      // res.json({ message: "Login successful", token });
  } catch (error) {
      res.status(500).json({ message: "Server error", error });
  }
};




export const sendLoginOTP = async (req, res) => {
  try {
    const { phone } = req.body;

    // Find the user's email based on the phone number
    const user = await User.findOne({ phone }, { email: 1 });

    if (!user || !user.email) {
      return res.status(404).json({ success: false, message: "User not found !" });
    }

    const otp = generateSecureOTP();

    // Send OTP via email
await otpSend.sendMail({
  from: `"MindChat" <${sender}>`,
  to: user.email,
  subject: `MindChat - Code : ${otp}`,

  html: `<div style="font-family: Arial, sans-serif; line-height: 1.5; max-width: 600px; margin: auto;">
    <div style="padding: 20px; text-align: center;">
      <img src="https://mindchat-one.vercel.app/Images/app.png" alt="Mind Chat Logo"
           style="max-width: 150px; height: 110px; width: 110px;">
    </div>
    <div style="padding: 20px; box-shadow: rgba(0, 0, 0, 0.02) 0px 1px 3px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px;">
      <h2 style="color: #333;">Your Login Code</h2>
      <p style="font-size: 15px; color: rgb(77, 77, 77);">
        Please use the following OTP code to complete your verification for login.
      </p>
      <div style="font-size: 28px; font-weight: bold; margin: 20px 0; color: #007BFF;">
        ${otp}
      </div>
      <p style="font-size: 15px; color: rgb(77, 77, 77);">This code is valid for the next 5 minutes.</p>
      <p style="font-size: 15px; color: rgb(77, 77, 77);">If you did not request this code, please ignore this email.</p>
      <p style="font-size: 15px; color: rgb(77, 77, 77);">Thank you</p>
    </div>
  </div>`
});


    // Store OTP temporarily
    otpStorage.set(user.email, otp);
    setTimeout(() => otpStorage.delete(user.email), 300000); // OTP expires in 5 minutes

    return res.status(201).json({ success: true, message: "OTP sent successfully" });

  } catch (error) {
    console.error("Error sending OTP:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error. Failed to send OTP",
    });
  }
};






export const VerifyLoginOtp = async (req, res) => {
  const { phone, otp } = req.body;
  const user = await User.findOne({ phone }, { email: 1 });


  try {
    // Validate input
    if (!user.email || !otp) {
      return res.status(400).json({ success: false, message: "Email and OTP are required" });
    }

    // Check if OTP exists for the given email
    if (!otpStorage.has(user.email)) {
      return res.status(400).json({ success: false, message: "OTP not found or expired" });
    }

    // Verify OTP
    const storedOtp = otpStorage.get(user.email);
    if (storedOtp === otp) {
      otpStorage.delete(user.email); // Remove OTP after successful verification
      return res.status(200).json({ success: true, message: "OTP verified successfully" });
    } else {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};








// API to Add a New Contact
//  export const addContact = async (req, res) => {
  
//   try {
//     const { phone , username, mobile, bc} = req.body;

//      const user = new Contact({ phone, username, mobile , bc});
//       await user.save();
    

//     res.status(200).json({ message: "User added successfully", user });
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error });
//   }
// };


// if not added then add
export const addNewContact = async (req, res) => {
  try {
    const { phone, username, mobile  } = req.body;

    if (!phone || !username || !mobile) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if the contact (receiver) exists in the sender's contact list
    const isExist = await Contact.findOne({ phone,mobile });

        const room = [phone, mobile].sort().join("_");


    if (!isExist) {
      const newUser = new Contact({ phone, username, mobile , room });
      await newUser.save();
    }

    // Ensure the sender also exists in the receiver’s contact list
    const isReverseExist = await Contact.findOne({ phone: mobile, mobile: phone });

    if (!isReverseExist) {
      const newContact = new Contact({ phone: mobile, username: "Unknown", mobile: phone , room });
      await newContact.save();
    }

    return res.status(201).json({ message: "Contact updated successfully" });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};




export const fetch = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ message: "Phone number required" });
    }

    // 1. Get all contacts of this user
    const contacts = await Contact.find({ phone });

    // 2. For each contact, get latest message in their room
    const results = await Promise.all(
      contacts.map(async (contact) => {
        const lastMessage = await Messages.findOne({ room: contact.room })
          .sort({ createdAt: -1 }) // latest message first
          .lean();

        return {
          ...contact.toObject(),
          lastMessage: lastMessage || null,
        };
      })
    );

    // 3. Sort contacts by lastMessage.createdAt
    results.sort((a, b) => {
      const timeA = a.lastMessage ? new Date(a.lastMessage.createdAt) : 0;
      const timeB = b.lastMessage ? new Date(b.lastMessage.createdAt) : 0;
      return timeB - timeA; // latest first
    });

    res.status(200).json(results);
  } catch (error) {
    console.error("Error fetching contacts with latest message:", error);
    res.status(500).json({ message: error.message });
  }
};


export const fetchDp = async (req, res) => {
  try {
    const { mobile } = req.body;
    const user = await User.findOne({ phone: mobile });

    if (!user) return res.status(404).json({ dp: null, about: "" });

    res.status(200).json({ dp: user.dp, about: user.about , username : user.username }); // Send DP and About
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// export const fetchFriendUser = async (req, res) => {
//   try {
//     const { mobile } = req.body;

//     const user = await User.findOne({ phone: mobile });

//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     res.status(200).json(user); // Send full user object
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };





export const fetchOtherDp = async (req, res) => {
  try {
    const {mobile}=req.body;
    const addedUser = await User.findOne({"phone" : mobile});
    res.status(200).json(addedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};







export const fetchId= async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ message: "Contact not found" });
    }
    res.json(contact);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch contact details" });
  }
};












export const delContact = async (req, res) => {
  try {
    const  contactId  = req.params.id;
 
    if (!contactId) {
      return res.status(400).json({ message: "Contact ID is required" });
    }

    // Find and delete the contact
    const deletedContact = await Contact.findByIdAndDelete(contactId);

    if (!deletedContact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    res.status(200).json({ message: "Contact deleted successfully" });
  } catch (error) {
    console.error("Error deleting contact:", error);
    res.status(500).json({ message: "Failed to delete contact" });
  }
};





export const fetchYou = async (req, res) => {
  try {
    const {phone}=req.body;
    const fetchedYou = await User.find({"phone" : phone});
    res.status(200).json(fetchedYou);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const editContact=async (req,res)=>{
  try{
         const {phone,mobile,username}=req.body;
         const edit=await Contact.updateOne({phone,mobile},{$set : {username}});
         res.status(200).json("Successfully updated");
  }catch{
    res.status(404).json("Not updated");
  }
}


export const editAbout=async (req,res)=>{
  try{
         const {phone,email,about}=req.body;
         const edit=await User.updateOne({phone,email},{$set : {about}});
         res.status(200).json("Successfully updated");
  }catch{
    res.status(404).json("Not updated");
  }
}

export const deleteDp=async (req,res)=>{
  try{
         const {phone,email}=req.body;
         const user = await User.findOne({ phone, email });
         if (!user) return res.status(404).json("User not found");
     
        
       
         const edit = await User.updateOne(
          { phone, email }, // Find the document
          { $unset: { dp: 1 } } // Remove the 'dp' field
        );
         res.status(200).json("Successfully updated");
         
  }catch{
    res.status(404).json("Not updated");
  }
}


export const fetchHistory = async (req, res) => {
  try {
    const {room}=req.body;
    const data = await Messages.find({room});
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};




export const ResetPassword = async (req, res) => {
 


  try {
    const { email, password } = req.body;
  
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.updateOne({ email }, { $set: { password: hashedPassword } });
  
    res.status(201).json({ success: true, message: "Password successfully reset" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



export const fetchalluser = async (req, res) => {
 


  try {
  
  
   const users = await User.find({});
  
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};





export const countContactsByMobile = async (req, res) => {
  const { phone } = req.body;

  try {
    const count = await Contact.countDocuments({ phone });
    res.status(200).json({ count });
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};



export const FriendRequest = async (req, res) => {
  try {
    
    const {sender,receiver,text} = req.body;
     
    const newFriend = new Friend({sender,receiver,text : "sent you friend request"});
    const data=await newFriend.save();

    res.status(201).json({data});
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};





export const SentRequestUser = async (req, res) => {
  try {
    const {sender}=req.body;
    const addedUser = await Friend.find({sender});
    res.status(200).json(addedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};




export const ReceivedRequestUser = async (req, res) => {
  try {
    const {receiver}=req.body;
    const addedUser = await Friend.find({receiver});
    res.status(200).json(addedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};








export const SentRequestAllUser = async (req, res) => {
  try {
    const { phone } = req.body; // phone is actually an array of phones
    const addedUser = await User.find({ phone: { $in: phone } }); // use $in for array
    res.status(200).json(addedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const CancelRequest = async (req, res) => {
  try {
    const { sender, receiver } = req.body;

    // Add validation
    if (!sender || !receiver) {
      return res.status(400).json({ error: "Missing sender or receiver" });
    }

    await Friend.deleteOne({ sender, receiver });

    res.status(200).json({ message: "Friend request canceled" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}



export const FetchAllMessage = async (req, res) => {
  try {
    const { room } = req.body;

    if (!room) {
      return res.status(400).json({ message: "Room is required" });
    }

    // Only fetch the 'message' field
    const messages = await Contact.find({ room }, { message: 1, _id: 0 });
    // message: 1 → include 'message'
    // _id: 0 → exclude _id

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: error.message });
  }
};





export const CallList = async (req, res) => {
  try {
    const { caller, callee, time, status } = req.body;

    // If status is not provided, don't save
    if (!status) {
      return res.status(400).json({ 
        success: false, 
        message: "Call not saved because status is missing" 
      });
    }

    const newCall = new CallContact({ caller, callee, time, status });
    await newCall.save();

    res.status(201).json({ success: true, message: "Call saved successfully" });

  } catch (error) {
    console.error("Error during call save", error);
    res.status(500).json({ success: false, message: error.message });
  }
};



export const FetchCallList = async (req, res) => {
  try {
    const { myNumber } = req.body;

    // Find all calls where user is either caller or callee
    const calls = await CallContact.find({
      $or: [{ caller: myNumber }, { callee: myNumber }],
    })
      .sort({ createdAt: -1 }) // newest first
      .limit(30);              // fetch only latest 30

    if (!calls || calls.length === 0) {
      return res.status(404).json({ message: "No calls found" });
    }

    // Return number + time
    const callList = calls.map((call) => ({
      phone: call.caller === myNumber ? call.callee : call.caller,
      time: call.time,  // assuming your schema has a "time" field
      status: call.status,
      direction: call.caller === myNumber ? "outgoing" : "incoming",
    }));

    res.status(200).json(callList);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};






// API to Get All Contacts
export const fetchCallUsername = async (req, res) => {
  try {
    const {phone,mobile}=req.body;
    const addedUser = await Contact.findOne({phone ,mobile});
    res.status(200).json(addedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

