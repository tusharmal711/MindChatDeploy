import "../CSS/Signup.css";
import { useNavigate } from "react-router-dom";
import { useState} from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Signup = () => {
  const backendUrl = process.env.REACT_APP_BACKEND_URL; 
  const [user, setUser] = useState({ username: "", email: "", phone: "", password: "" });
  const [otp, setOtp] = useState("");

  
  const navigate = useNavigate();


  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  // Handle OTP input change
 

   

 

  // Send OTP when clicking Signup
  const sendOTP = async (e) => {
    e.preventDefault();
    try {
      
      const response = await axios.post(`${backendUrl}api/sendOTP`, { email: user.email });

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
        email: user.email,
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
      }
    } catch (error) {
      toast.error("Signup failed!", { position: "top-right" });
    }
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
            <input type="number" placeholder="Mobile No" name="phone" onChange={handleChange} required />
          </div>
          <div className="input-field password">
            <input type="password" placeholder="Password" name="password" onChange={handleChange} required />
          </div>
          <div className="otp">
            <input type="number" onChange={(e)=>setOtp(e.target.value)} id="otp" placeholder="# Code" /><button type="submit"  id="sc">Send Code</button>
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
