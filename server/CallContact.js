// create a schema
import mongoose from "mongoose";
const data = new mongoose.Schema({
  caller: String,
  callee: String,
  time: String,
  status : String, 
  seen: { type: Boolean, default: false },  
}, { timestamps: true }); 
   // create a model
   const CallContact = mongoose.model("call-contact", data);
 

export default CallContact;

   