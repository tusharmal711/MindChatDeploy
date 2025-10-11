// create a schema
import mongoose from "mongoose";
const data=new mongoose.Schema({
    username : String , 
    email : String ,
    phone : {type : String}, 
   
    about: { type: String, default: "Hello ! I am new user in MindChat !" },
    dp:{type:String,default:"image_dp_uwfq2g.png"},
    date : {
       type : Date,
       default : Date.now
    }
   
   });
   
   
   // create a model
   const User = mongoose.model("users", data);
 

export default User;

   


