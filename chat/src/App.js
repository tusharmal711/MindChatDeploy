import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

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
        <Route exact path="/" element={<Home />} />
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
