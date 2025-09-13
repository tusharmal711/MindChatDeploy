// create a schema
import mongoose from "mongoose";
const data=new mongoose.Schema({
    sender : String , 
    receiver : String ,
    status : {
    type: String,
    default: "no"  
  }, 
    date : {
       type : Date,
       default : Date.now
    }
   
   });
   
   
   // create a model
   const Friend = mongoose.model("friends", data);
 

export default Friend;

   


