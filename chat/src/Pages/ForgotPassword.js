import { useNavigate,Link } from "react-router-dom";
import { useState} from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Cookies from "js-cookie";
const ForgotPassword = ()=>{
    const navigate = useNavigate();
   return (
    <div>
          <div className="logo">
      <div className="img">
      <img src="./Images/app.png" alt="Not found" />
      </div>
  

  </div>

<div className="container fpass">
  <h2>Forgot Password ?</h2>
  <ToastContainer />
  <form>
    
      <div className="input-field mobile">
          
          <input type="email" placeholder="Enter your signed up email id..."required />
      </div>
     
      <div className="otp">
            <input type="number"  id="otp" placeholder="# Code" /><button type="submit"  id="sc">Send Code</button>
          </div>
    
      <button type="button"  className="login" >Verify OTP</button>
     
      <div className="line"></div>
      <button  className="signup rotp">Resend OTP</button>
  </form>

</div>

    </div>
   )
}
export default ForgotPassword;