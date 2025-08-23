import { BrowserRouter, Routes, Route, useLocation, useNavigate , Navigate } from "react-router-dom";
import Cookies from "js-cookie";
import { Profiler, useEffect ,useState ,useRef} from "react";

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
import NotificationPage from "./Pages/Friend-subpages/NotificationPage.js";
import FriendRequest from "./Pages/Friend-subpages/FriendRequest.js";
import AddFriend from "./Pages/Friend-subpages/AddFriend.js";
import CallPage from "./Pages/CallPage.js";
import Incoming from "./Pages/Incoming-call.js";
import { socket } from "./Pages/Socket";
import NewCall from "./Pages/NewCall.js";
// import VideoCall from "./Pages/Videocall.js";
 const backendUrl = process.env.REACT_APP_BACKEND_URL; 
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
 


 const [inComingCall, setInComingCall] = useState(false); // for Incoming UI
  const [contacts, setContacts] = useState([]); // contacts list
  const [dpMap, setDpMap] = useState({}); // contact dp map




const [contactDp,setContactDp]=useState("");


  const navigate = useNavigate();


useEffect(() => {


const fetchContacts = async () => {


  try {
    const phone = sessionStorage.getItem("phone") || Cookies.get("mobile");
    if (!phone) {
      console.warn("No phone number found in session or cookies.");
      return;
    }

    // 2. Always fetch fresh data in the background
    const res = await fetch(`${backendUrl}api/fetch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    });

    if (!res.ok) throw new Error("Failed to fetch contacts");

    const freshContacts = await res.json();

   
      setContacts(freshContacts);

    
  } catch (error) {
    console.error("Error fetching contacts:", error);
  }
};


  fetchContacts();

 
}, []);



const [calPhone,setCalPhone]=useState("");
const [calUsername,setCalUsername]=useState("");
const [calDp,setCalDp]=useState({});

const [callerInfo, setCallerInfo] = useState({ username: "", dp: "", phone: "" });
const ringingSoundRef = useRef(null);
useEffect(() => { 
  const unlockAudio = () =>
     { if (ringingSoundRef.current) 
      { ringingSoundRef.current .play() 
        .then(() => { 
          ringingSoundRef.current.pause(); 
          ringingSoundRef.current.currentTime = 0;
           console.log("Audio unlocked for autoplay"); }) 
           .catch(() => {}); } window.removeEventListener("click", unlockAudio);
            window.removeEventListener("keydown", unlockAudio); };
             window.addEventListener("click", unlockAudio); 
             window.addEventListener("keydown", unlockAudio); 
             return () => { window.removeEventListener("click", unlockAudio);
               window.removeEventListener("keydown", unlockAudio); 
              }; }, []);



// Initialize audio
useEffect(() => {
  ringingSoundRef.current = new Audio("./Sounds/ringing-sound.mp3");
  ringingSoundRef.current.loop = true;
  ringingSoundRef.current.volume = 1.0;
}, []);





const ringingSoundRef2 = useRef(null);
useEffect(() => { 
  const unlockAudio = () =>
     { if (ringingSoundRef2.current) 
      { ringingSoundRef2.current .play() 
        .then(() => { 
          ringingSoundRef2.current.pause(); 
          ringingSoundRef2.current.currentTime = 0;
           console.log("Audio unlocked for autoplay"); }) 
           .catch(() => {}); } window.removeEventListener("click", unlockAudio);
            window.removeEventListener("keydown", unlockAudio); };
             window.addEventListener("click", unlockAudio); 
             window.addEventListener("keydown", unlockAudio); 
             return () => { window.removeEventListener("click", unlockAudio);
               window.removeEventListener("keydown", unlockAudio); 
              }; }, []);



// Initialize audio
useEffect(() => {
  ringingSoundRef2.current = new Audio("./Sounds/notification-sound.mp3");
  ringingSoundRef2.current.loop = false;
  ringingSoundRef2.current.volume = 1.0;
}, []);






// 3️ Handle incoming calls

const [accept,setAccept]=useState(false);

useEffect(() => {
  if (!socket) return;

  socket.off("ping-test");
 socket.off("caller-canceled");

   socket.on("caller-canceled", async({ from }) => {
  
     if (ringingSoundRef.current) {
      ringingSoundRef.current.pause();
      ringingSoundRef.current.currentTime = 0;
    }
   
    setInComingCall(false);

      try {
          
          const response = await fetch(`${backendUrl}api/callList`,{
             method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({caller : from , callee : myPhone , time : new Date().toISOString() , status:"missed" }),
          });
    
          if (response.status === 201) {
           console.log("call-saved");
          }
        } catch (error) {
         console.log("call-not-saved");
        }
   
  });
  const handlePingTest = async (callerPhone) => {
    console.log("Ping-test received:", callerPhone);
   setCalPhone(callerPhone);
    // Play ringtone
   if (ringingSoundRef.current) {
    ringingSoundRef.current.play()
      .then(() => console.log("Ringtone playing..."))
      .catch((e) => console.log("Audio play failed:", e));
  }
    // Show incoming call prompt

  
    setInComingCall(true);
    // Stop ringtone immediately
   







 try {
    //  Fetch caller details (DP) from backend
    const res = await fetch(`${backendUrl}api/phoneDp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: callerPhone }),
    });

    if (!res.ok) throw new Error("Failed to fetch caller DP");

    const data = await res.json();



    // Use DP from DB, fallback to contacts dp or default
    const targetDp = data.dp || callerContact?.dp || "fallback_dp.png";

    console.log("Fetched caller DP:", targetDp);

   
    const callerContact = contacts.find((c) => c.mobile === callerPhone);
   
    const callerUsername = callerContact ? callerContact.username : "Unknown";
   
    // if (accept) {
    //   handleCallClick(callerPhone, callerUsername, callerDp);
    // }else{
    //   socket.emit("reject", { targetPhone: callerPhone });
    // }
    setCalUsername(callerUsername);
    setCallerInfo({ username: callerUsername, dp: targetDp, phone: callerPhone });
      sessionStorage.setItem("contactDp", targetDp);
  } catch (error) {
    console.error("Error fetching caller DP:", error);
  }


  };
  
  socket.on("ping-test", handlePingTest);


  return () => {
    socket.off("ping-test", handlePingTest);
    socket.off("caller-canceled");
  };
}, [socket, contacts, dpMap]);





 const myPhone = sessionStorage.getItem("phone") || Cookies.get("mobile");
 const handleAccept = async() => {
    if (!myPhone) {
      alert("No phone number found! Please login.");
      return;
    }
 if (ringingSoundRef.current) {
      ringingSoundRef.current.pause();
      ringingSoundRef.current.currentTime = 0;
    }
    
    const room = [myPhone, calPhone].sort().join("_");

    sessionStorage.setItem("contactPhone", calPhone);
    sessionStorage.setItem("myPhone", myPhone);
    sessionStorage.setItem("roomId", room);
    sessionStorage.setItem("callusername", calUsername);
    sessionStorage.setItem("isCaller", "false"); // callee
  

    
        try {
      
      const response = await fetch(`${backendUrl}api/callList`,{
         method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({caller : calPhone , callee : myPhone , time : new Date().toISOString() , status:"accept" }),
      });

      if (response.status === 201) {
       console.log("call-saved");
      }
    } catch (error) {
     console.log("call-not-saved");
    }



    setContactDp(calDp);

    socket.emit("join_call", room);
    setInComingCall(false);
    navigate("/call");
  };

const [isReject,setIsReject]=useState("false");
const handleReject=async()=>{
  setInComingCall(false);
  socket.emit("reject", { targetPhone: calPhone });
  setIsReject(true);

   if (ringingSoundRef.current) {
      ringingSoundRef.current.pause();
      ringingSoundRef.current.currentTime = 0;
    }



}





const [incomingPopup, setIncomingPopup] = useState(null);

useEffect(() => {
  if (!socket) return;

  socket.on("receiveMessage", async({to,from,name, message }) => {
    // show popup


 try {
    //  Fetch caller details (DP) from backend
    const res = await fetch(`${backendUrl}api/phoneDp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: from }),
    });

    if (!res.ok) throw new Error("Failed to fetch caller DP");

    const data = await res.json();



    // Use DP from DB, fallback to contacts dp or default
    const targetDp = data.dp || "fallback_dp.png";
   setIncomingPopup({ from,name,message ,targetDp});
  
  } catch (error) {
    console.error("Error fetching caller DP:", error);
  }


   
    // hide popup after 3s
setTimeout(() => {
  setIncomingPopup(null);

}, 3000);





 if (ringingSoundRef2.current) {
    ringingSoundRef2.current.play()
      .then(() => console.log("Ringtone playing..."))
      .catch((e) => console.log("Audio play failed:", e));
  }










  });

  return () => {
    socket.off("receiveMessage");
  };
}, [socket]);











  return (
    <>
      {/* Conditionally render Navbar */}
      {inComingCall && <Incoming callerInfo={callerInfo} onAccept={handleAccept} onReject={handleReject}/>}
     
     
      {shouldShowNavbar && <Navbar />}
      


       {incomingPopup && (
  <div className="incoming-msg">
    <div>
       <img
       className="msger-dp"
        src={`https://res.cloudinary.com/dnd9qzxws/image/upload/v1743761726/${incomingPopup.targetDp}`}
        onError={(e) => {
          e.target.src =
            "https://res.cloudinary.com/dnd9qzxws/image/upload/v1743764088/image_dp_uwfq2g.png";
        }}
        alt="Sender DP"
      />

    </div>
    <p><span>{incomingPopup.name}</span><br/>{incomingPopup.message}</p>
  </div>
)}












     

      <Routes>
         <Route exact path="/incoming-call" element={<Incoming />} />
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
        <Route exact path="notification" element={<NotificationPage />} />
          <Route exact path="add-friend" element={<AddFriend />} />
        
        
        </Route>
        
        <Route exact path="/calls" element={<Calls setContactDp={setContactDp} accept={accept}/>} />
        <Route exact path="/new-calls" element={<NewCall />} />
        <Route exact path="/reset" element={<ResetPassword />} />
        <Route exact path="/forgotpassword" element={<ForgotPassword />} />

         

     <Route
  path="/chatboard"
  element={
    <PrivateRoute>
      <Chatboard/>
    </PrivateRoute>
  }
/>
        <Route exact path="/navbar" element={<Navbar />} />
       
      </Routes>
    </>
  );
};

export default App;
