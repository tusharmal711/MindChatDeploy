import { BrowserRouter, Routes, Route, useLocation, useNavigate , Navigate } from "react-router-dom";
import Cookies from "js-cookie";
import { useEffect } from "react";

import Home from './Pages/Home.js';
import Signup from './Pages/Signup.js';
import Login from './Pages/Login.js';
import Dash from "./Pages/Dashboard.js";
import Chatboard from "./Pages/Chatboard.js";
import Navbar from "./Pages/Navbar.js";

function HomeRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
   const phone = sessionStorage.getItem("phone") || Cookies.get("mobile") || localStorage.getItem("phone");;

    if (phone) {
      sessionStorage.setItem("phone", phone);
      navigate("/chatboard");
    } else {
      navigate("/login");
    }
  }, [navigate]);

  return null;
}

const App = () => {
  return (
    <BrowserRouter>
      <MainRoutes />
    </BrowserRouter>
  );
};

const MainRoutes = () => {
  const location = useLocation();

  // Define paths where Navbar should NOT be visible
  const hideNavbarRoutes = ["/", "/signup", "/login", "/dash"];
  const shouldShowNavbar = !hideNavbarRoutes.includes(location.pathname);

  return (
    <>
      {/* Conditionally render Navbar */}
      {shouldShowNavbar && <Navbar />}

      <Routes>
        <Route exact path="/" element={<HomeRedirect />} />
        <Route exact path="/signup" element={<Signup />} />
        <Route exact path="/login" element={<Login />} />
        <Route exact path="/dash" element={<Dash />} />
       <Route
  path="/chatboard"
  element={
    Cookies.get("mobile") ? <Chatboard /> : <Navigate to="/login" />
  }
/>
        <Route exact path="/navbar" element={<Navbar />} />
      </Routes>
    </>
  );
};

export default App;
