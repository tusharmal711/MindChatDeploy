import User from "./User.js";
import Contact from "./Contact.js";
import crypto from "crypto";
import express from "express";
import nodemailer from "nodemailer";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import Messages from "./server.js";
import fs from 'fs'; // File system module
import path from 'path';

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
      from: sender,
      to: email,
      subject: "Mind Chat - OTP Verification",
      text: `Your OTP code is: ${otp}`,
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


// login credential is starting from here 
export const isLogin = async (req, res) => {
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
      from: sender,
      to: user.email,
      subject: "Mind Chat - OTP Verification",
      text: `Your OTP code is: ${otp}`,
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

    if (!isExist) {
      const newUser = new Contact({ phone, username, mobile });
      await newUser.save();
    }

    // Ensure the sender also exists in the receiver’s contact list
    const isReverseExist = await Contact.findOne({ phone: mobile, mobile: phone });

    if (!isReverseExist) {
      const newContact = new Contact({ phone: mobile, username: "Unknown", mobile: phone });
      await newContact.save();
    }

    return res.status(201).json({ message: "Contact updated successfully" });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};





// API to Get All Contacts
export const fetch = async (req, res) => {
  try {
    const {phone}=req.body;
    const addedUser = await Contact.find({"phone" : phone});
    res.status(200).json(addedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



export const fetchDp = async (req, res) => {
  try {
    
    const user = await User.findOne({ phone: req.query.mobile}).lean();;

    if (!user) return res.status(404).json({ dp: null, about: "" });

    res.status(200).json({ dp: user.dp, about: user.about }); // Send DP and About
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


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

