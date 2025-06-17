import { useNavigate} from "react-router-dom";
import { useState,useEffect} from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ForgotPassword = ()=>{
    const [email,setEmail]=useState("");
    const navigate = useNavigate();
 const [otp, setOtp] = useState("");

 const [verified,setVerified]=useState(false);
 const backendUrl = process.env.REACT_APP_BACKEND_URL;
 const sendFpOTP = async (e) => {
    e.preventDefault();
    try {
      
      const response = await axios.post(`${backendUrl}api/sendFpOTP`, { email: email });

      if (response.status === 201) {
        toast.success("OTP sent successfully!", { position: "top-right" });
       
        
      }
    } catch (error) {
      toast.error("User is not signed up !", { position: "top-right" });
    }
  };


    const verifyOTP = async (e) => {
    
      
      try {
        const response = await axios.post(`${backendUrl}api/verifyOTP`, {
          email: email,
          otp: otp,
        });
  
        if (response.status === 200) {
          toast.success("OTP Verified!", { position: "top-right" });
          
          setVerified(true);
        
        } else if(response.status===400) {
          toast.error("Invalid OTP!", { position: "top-right" });
        }
      } catch (error) {
        toast.error("Entered invalid otp !!", { position: "top-right" });
      }
    }
    
  

  useEffect(() => {
    if (verified) {
      const timer = setTimeout(() => {
        localStorage.setItem("resetEmail", email);
         navigate("/reset", { state: { email } });
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [verified]);







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
  <form onSubmit={sendFpOTP}>
    
      <div className="input-field mobile">
          
          <input type="email" placeholder="Enter your signed up email id..." value={email} onChange={(e)=>{setEmail(e.target.value)}} required />
      </div>
     
      <div className="otp">
            <input type="number" value={otp} onChange={(e)=>{setOtp(e.target.value)}} id="otp" placeholder="# OTP" /><button type="submit"  id="sc">Send OTP</button>
     </div>
    
      <button type="button" onClick={verifyOTP} className="login" >Verify OTP</button>
     
     
      
  </form>

</div>


    </div>
   )
}
export default ForgotPassword;