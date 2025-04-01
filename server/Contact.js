import mongoose from "mongoose";
const UserSchema = new mongoose.Schema({
    phone:{ type: String, required: true},
    username: { type: String, required: true },
    mobile: { type: String, required: true },
   room : {type:String},
   
    createdAt: { type: Date, default: Date.now },
  });
  UserSchema.index({ phone: 1, mobile: 1 }, { unique: true });
  const Contact = mongoose.model("Contact", UserSchema);
  export default Contact;
 