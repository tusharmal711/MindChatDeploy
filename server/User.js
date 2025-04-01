// create a schema
import mongoose from "mongoose";
const data=new mongoose.Schema({
    username : String , 
    email : String ,
    phone : {type : String}, 
    password : String,
    about: { type: String, default: "Hello ! I am new user in MindChat !" },
    dp:{type:String,default:"image.png"},
    date : {
       type : Date,
       default : Date.now
    }
   
   });
   
   
   // create a model
   const User = mongoose.model("users", data);
 

export default User;

   


