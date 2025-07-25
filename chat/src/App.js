import { BrowserRouter, Routes, Route, useLocation, useNavigate , Navigate } from "react-router-dom";
import Cookies from "js-cookie";
import { useEffect ,useState} from "react";
import PrivateRoute from "./Pages/PrivateRoute";
import Home from './Pages/Home.js';
import Signup from './Pages/Signup.js';
import Login from './Pages/Login.js';
import Dash from "./Pages/Dashboard.js";
import Chatboard from "./Pages/Chatboard.js";
import ForgotPassword from "./Pages/ForgotPassword.js";
import Moments from './Pages/Moments.js';
import Connect from "./Pages/Connect.js";
import Calls from "./Pages/Calls.js";
import { ScrollProvider } from './ScrollContext';
import Navbar from "./Pages/Navbar.js";
import { getFCMToken } from './Pages/firebase-config.js';
import ResetPassword from "./Pages/ResetPassword.js";

function HomeRedirect() {
  const navigate = useNavigate();
  const [checked, setChecked] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const phone = sessionStorage.getItem("phone") || Cookies.get("mobile") || localStorage.getItem("phone");

    if (phone) {
      sessionStorage.setItem("phone", phone);
      setLoggedIn(true);
      navigate("/chatboard");
    } else {
      setLoggedIn(false);
    }

    setChecked(true);
  }, [navigate]);

  if (!checked) return null; // wait until auth check is done

  return loggedIn ? null : <Home />;
}

const App = () => {
  useEffect(() => {
  getFCMToken();
}, []);

  return (
     <ScrollProvider>
    <BrowserRouter>
      <MainRoutes />
    </BrowserRouter>
    </ScrollProvider>
  );
};

const MainRoutes = () => {
  const location = useLocation();

  // Define paths where Navbar should NOT be visible
  const hideNavbarRoutes = ["/", "/signup", "/login", "/dash","/forgotpassword","/reset"];
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

         <Route exact path="/moments" element={<Moments />} />
        <Route exact path="/connect" element={<Connect />} />
        <Route exact path="/calls" element={<Calls />} />
        <Route exact path="/reset" element={<ResetPassword />} />
        <Route exact path="/forgotpassword" element={<ForgotPassword />} />
     <Route
  path="/chatboard"
  element={
    <PrivateRoute>
      <Chatboard />
    </PrivateRoute>
  }
/>
        <Route exact path="/navbar" element={<Navbar />} />
      </Routes>
    </>
  );
};

export default App;
