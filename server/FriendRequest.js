// create a schema
import mongoose from "mongoose";
const data=new mongoose.Schema({
    sender : String , 
    receiver : String ,
    text : String , 
    date : {
       type : Date,
       default : Date.now
    }
   
   });
   
   
   // create a model
   const Friend = mongoose.model("friends", data);
 

export default Friend;

   


