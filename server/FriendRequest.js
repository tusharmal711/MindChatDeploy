// create a schema
import mongoose from "mongoose";
const data=new mongoose.Schema({
    sender : String , 
    receiver : String ,
    status : {
    type: String,
    default: "no"  
  }, 
    seen: { type: Boolean, default: false },
    date : {
       type : Date,
       default : Date.now
    },
    updatedDate : {
       type : Date,
       default : Date.now
    },
   
   });
   
   
   // create a model
   const Friend = mongoose.model("friends", data);
 

export default Friend;

   


