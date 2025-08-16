import { BrowserRouter, Routes, Route, useLocation, useNavigate , Navigate } from "react-router-dom";
import Cookies from "js-cookie";
import { Profiler, useEffect ,useState} from "react";
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
import Profile from "./Pages/Profile.js";
import { ScrollProvider } from './ScrollContext';
import Navbar from "./Pages/Navbar.js";
import { getFCMToken } from './Pages/firebase-config.js';
import ResetPassword from "./Pages/ResetPassword.js";
import About from "./Pages/Profile-subpages/About.js";
import Friends from "./Pages/Profile-subpages/Friends.js";
import Posts from "./Pages/Profile-subpages/Posts.js";
import Photos from "./Pages/Profile-subpages/Photos.js";
import Videos from "./Pages/Profile-subpages/Videos.js";
import Reels from "./Pages/Profile-subpages/Reels.js";
import SentRequest from "./Pages/Friend-subpages/SentRequest.js";
import Notification from "./Pages/Friend-subpages/Notification.js";
import FriendRequest from "./Pages/Friend-subpages/FriendRequest.js";
import AddFriend from "./Pages/Friend-subpages/AddFriend.js";
import CallPage from "./Pages/CallPage.js";
// import VideoCall from "./Pages/Videocall.js";
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
  const hideNavbarRoutes = ["/", "/signup", "/login", "/dash","/forgotpassword","/reset","/call"];
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
       
    {/* <Route exact path="/videocall" element={<VideoCall />} /> */}

          <Route exact path="/:name/:id" element={<Profile />}>
          <Route exact path="about" element={<About />} />
          <Route exact path="friends" element={<Friends />} />
           <Route exact path="posts" element={<Posts />} />
            <Route exact path="photos" element={<Photos />} />
             <Route exact path="videos" element={<Videos />} />
              <Route exact path="reels" element={<Reels />} />

          </Route>

         
            <Route path="/call" element={<CallPage />} />
         <Route exact path="/moments" element={<Moments />} />
        <Route exact path="/connect" element={<Connect />}>
        <Route exact path="sent-request" element={<SentRequest />} />
        <Route exact path="friend-request" element={<FriendRequest />} />
        <Route exact path="notification" element={<Notification />} />
          <Route exact path="add-friend" element={<AddFriend />} />
        
        
        </Route>
        
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
