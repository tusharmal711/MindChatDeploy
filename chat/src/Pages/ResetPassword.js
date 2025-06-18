
import { useState,useEffect} from "react";
import { toast, ToastContainer } from "react-toastify";
import { useLocation,useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
const ResetPassword=()=>{
    const navigate=useNavigate();
 const location = useLocation();
 const email = location.state?.email || localStorage.getItem("resetEmail");

     const [password,setPassword]=useState("");
     const [reset,setReset]=useState(false);
    
 const backendUrl = process.env.REACT_APP_BACKEND_URL;
 const Reset= async (e) => {
    e.preventDefault();
    try {
      
     const response = await axios.post(`${backendUrl}api/reset`, {
  email,
  password,
});

      if (response.status === 201) {
        toast.success("Password successfully reset !", { position: "top-right" });
        setReset(true);
        
      }
    } catch (error) {
      toast.error("Sorry , password not reset !", { position: "top-right" });
    }
  };
  useEffect(() => {
    if (reset) {
      const timer = setTimeout(() => {
         navigate("/login");
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [reset]);



    return(
        <div>
      <div className="logo">
      <div className="img">
      <img src="./Images/app.png" alt="Not found" />
      </div>
      </div>


<div className="container rpass">
  <h2>Reset Password</h2>
  <ToastContainer />
  <form onSubmit={Reset}>
      <div className="input-field mobile">    
          <input type="password" placeholder="Enter new password..." value={password} onChange={(e)=>{setPassword(e.target.value)}} required />
      </div>
      <button type="submit"  className="login" >Reset Password</button> 
  </form>
</div>





        </div>
    )
}
export default ResetPassword;