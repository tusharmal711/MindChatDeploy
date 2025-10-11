
import { useNavigate } from "react-router-dom";
import { useState} from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Cookies from "js-cookie";
import { FaRegEye } from "react-icons/fa";
import { FaRegEyeSlash } from "react-icons/fa";

const Signup = () => {
  const backendUrl = process.env.REACT_APP_BACKEND_URL; 
  const [user, setUser] = useState({ username: "", email: "", phone: ""});
  const [otp, setOtp] = useState("");

  
  const navigate = useNavigate();
 const [showPassword,setShowPassword]=useState(false);

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  // Handle OTP input change
 

   

 

  // Send OTP when clicking Signup
  const sendOTP = async (e) => {
    e.preventDefault();
    try {
      
      const response = await axios.post(`${backendUrl}api/sendOTP`, {phone: user.phone });

      if (response.status === 201) {
        toast.success("OTP sent successfully!", { position: "top-right" });
       
        
      }
    } catch (error) {
      toast.error("User is already exist !", { position: "top-right" });
    }
  };

  // Verify OTP before registration
  const verifyOTP = async (e) => {
    let inputs = document.getElementsByTagName("input");

    for (let i = 0; i < inputs.length; i++) {
        if (inputs[i].value === "") {
            inputs[i].classList.add("border");
        }
    }
    
    if(otp===""){
      // toast.error("Please enter Code!", { position: "top-right" });
     
    }else{

    
    try {
      const response = await axios.post(`${backendUrl}api/verifyOTP`, {
        phone: user.phone,
        otp: otp,
      });

      if (response.status === 200) {
        toast.success("OTP Verified!", { position: "top-right" });
        isRegister(); // Call registration function after OTP verification
      } else if(response.status===400) {
        toast.error("Invalid OTP!", { position: "top-right" });
      }
    } catch (error) {
      toast.error("Entered invalid otp !!", { position: "top-right" });
    }
  }
  };
   const togglePassword = () => {
    setShowPassword(prev => !prev);
  };


  // Register user after OTP verification
  const isRegister = async () => {
    try {
      const response = await axios.post(`${backendUrl}api/register`, user, {
        headers: { "Content-Type": "application/json" },
      });

      if (response.status === 201) {
        toast.success("Signup successful!", { position: "top-right" });
        sessionStorage.setItem("phone",user.phone);
        navigate("/chatboard");
         Cookies.set("mobile", user.phone); // Persist login
      sessionStorage.setItem("phone", user.phone);
      localStorage.setItem("phone", user.phone);
      }
    } catch (error) {
      toast.error("Signup failed!", { position: "top-right" });
    }
  };



const getBorderColor = () => {
  const {phone}=user;
   if (!phone) return "1px solid silver";
    if (phone.length < 10) return "2px solid rgb(255, 221, 0)";
    if (phone.length === 10) return "2px solid green";
    if (phone.length > 10) return "2px solid #ff3838";
    return "";
  };


const getOtpColor = () => {

   if (!otp) return "1px solid silver";
    if (otp.length < 6) return "rgb(255, 221, 0)";
    if (otp.length === 6) return "green";
    if (otp.length > 6) return "red";
    return "";
  };



  return (
    <div>
      
      <div className="logo">
        <div className="img">
          <img src="./Images/app.png" alt="Not found" />
        </div>
       
      </div>
      <div className="container">
        <ToastContainer />
        <h2>Signup Here</h2>
        <form onSubmit={sendOTP}>
          <div className="input-field username">
            <input type="text" placeholder="Username" name="username" onChange={handleChange} required />
          </div>
          <div className="input-field email">
            <input type="email" placeholder="Email Id" name="email" onChange={handleChange} required />
          </div>
          <div className="input-field mobile">
            <input type="number" placeholder="Mobile No (10 digits)" name="phone" onChange={handleChange} required
             style={{
        border: `${getBorderColor()}`,
        borderRadius: "5px",
         color:"black",
        outline: "none"
      }}
            />
          </div>
         
          <div className="otp">
            <input type="number" onChange={(e)=>setOtp(e.target.value)} id="otp" placeholder="# Code"  style={{
       
         color: `${getOtpColor()}`,
        borderRadius: "5px",
        
        outline: "none"
      }}/><button type="submit"  id="sc">Send Code</button>
          </div>
          <button type="button" onClick={verifyOTP} className="signup">Signup</button>
          <div className="al">
            <span id="al">Already have an account?</span>
          </div>
          <button type="button" className="login" onClick={() => navigate("/login")}>
            Login
          </button>
        </form>
      </div>

      
    </div>
  );
};

export default Signup;
