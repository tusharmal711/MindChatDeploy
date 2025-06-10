import { BrowserRouter, Routes, Route, useLocation,useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Home from './Pages/Home.js';
import Signup from './Pages/Signup.js';
import Login from './Pages/Login.js';
import Dash from "./Pages/Dashboard.js";
import Chatboard from "./Pages/Chatboard.js";

import Navbar from "./Pages/Navbar.js";


const App = () => {
  return (

    <BrowserRouter>
  
      <MainRoutes />
    </BrowserRouter>
  );
};
function HomeRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const phone = localStorage.getItem("phone");

    if (token && phone) {
      navigate("/chatboard");
    } else {
      navigate("/login"); // or show home/landing page
    }
  }, [navigate]);

  return null; // or a loader component
}
const MainRoutes = () => {
  const location = useLocation();

  // Define paths where Navbar should NOT be visible
  const hideNavbarRoutes = ["/", "/signup", "/login", "/dash",];
  const shouldShowNavbar = !hideNavbarRoutes.includes(location.pathname);

  return (
    <>
      {/* Conditionally render Navbar */}
      {shouldShowNavbar && <Navbar />}

      <Routes>
        {/* Routes without Navbar */}
        <Route exact path="/" element={<HomeRedirect />} />
        <Route exact path="/signup" element={<Signup />} />
        <Route exact path="/login" element={<Login />} />
        <Route exact path="/dash" element={<Dash />} />
        
        {/* Routes with Navbar */}
        <Route exact path="/chatboard" element={<Chatboard />} />
        <Route exact path="/navbar" element={<Navbar />} />
      </Routes>
    </>
  );
};

export default App;
