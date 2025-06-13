 
import React, { useState, useEffect ,useRef ,useReducer} from "react";
import { FiPlus } from "react-icons/fi";
// import { useLocation  } from "react-router-dom";
import { MdPersonAddAlt1 } from "react-icons/md";
import { ImBlocked } from "react-icons/im";
import { useNavigate } from "react-router-dom";
import { RiDeleteBin6Fill } from "react-icons/ri";
import { FcDeleteDatabase } from "react-icons/fc";
import { IoMdImages } from "react-icons/io";
import { IoSendSharp } from "react-icons/io5";
import Cookies from "js-cookie";
import { RxCross1 } from "react-icons/rx";
import io from "socket.io-client";
import { LuSticker } from "react-icons/lu";
import { BsThreeDotsVertical } from "react-icons/bs";
import { MdEdit } from "react-icons/md";
import { IoIosShareAlt } from "react-icons/io";
import { IoMdDownload } from "react-icons/io";
import { FaArrowLeft, FaBullseye } from "react-icons/fa";
import { MdOutlineDownloadForOffline } from "react-icons/md";
import { FaFilePdf } from "react-icons/fa6";
import { RxCross2 } from "react-icons/rx";
import { IoDocumentTextSharp } from "react-icons/io5";
import { FaCamera } from "react-icons/fa";
import { PiMicrosoftPowerpointLogoFill } from "react-icons/pi";
import { MdAudioFile } from "react-icons/md";
import { FaFileVideo } from "react-icons/fa";
import { IoMdPhotos } from "react-icons/io";
import "../CSS/Signup.css";
import { PiMicrosoftWordLogoFill } from "react-icons/pi";
import { FaPlay } from "react-icons/fa";
import EmojiPicker from 'emoji-picker-react';
import {getFCMToken} from "./firebase-config.js";
import { onMessage } from "firebase/messaging";
import { messaging } from "./firebase-config"; // adjust path if needed
const backendUrl = process.env.REACT_APP_BACKEND_URL; 
const socket = io("https://mindchatdeploy-2.onrender.com/", {
  transports: ["websocket"], // Forces WebSocket connection
  withCredentials: true, // Allows cross-origin credentials
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 2000
});

const Chatboard = ({ user, contact , message ,src, alt, ...props}) => {
  const navigate = useNavigate();
  // const location = useLocation();
  const [loading, setLoading] = useState(true);
  // State variables
  const [contacts, setContacts] = useState([]); // List of contacts
  const [searchTerm, setSearchTerm] = useState(""); // Search term for filtering contacts
  const [selectedContact, setSelectedContact] = useState(null); // Selected contact details
  const [you,setYou]=useState([]);
  const [isPopup,setIsPopup]=useState(false);
  const [showIcon,setShowIcon]=useState(false);
  const [second,setSecond]=useState(false);
  const [third,setThird]=useState(false);
  
  const [activeContact, setActiveContact] = useState(null);
  const [showcontainer,setShowcontainer]=useState(true);
  const [welcome,setWelcome]=useState(true);
 const [editprofile,setEditprofile]=useState(false);
  // const [navProfile,setNavProfile]=useState(true);


    
    const [username, setUsername] = useState("");
    const [mobile, setMobile] = useState("");
  
    const [pro_uname,setPro_uname]=useState("");
// state define for chating
// const [sender,setSender]=useState("");
// const [receiver,setReceiver]=useState("");
const [userName, setUserName] = useState("");
const [chat, setChat] = useState("");
const [chats, setChats] = useState([]);
const [joined, setJoined] = useState(false);
const [room, setRoom] = useState("");
const [imageBuffer, setImageBuffer] = useState([]);
const messagesEndRef = useRef(null);
 const [fcmToken, setFcmToken] = useState(null);

  useEffect(() => {
    getFCMToken().then((token) => {
      if (token) {
        setFcmToken(token);
        console.log("🔥 Token:", token);
      }
    });
  }, []);


useEffect(() => {
  const unsubscribe = onMessage(messaging, (payload) => {
    console.log("📩 Message received in foreground:", payload);

    const { title, body } = payload.notification;

    if (Notification.permission === "granted") {
      new Notification(title, {
        body,
       
      });
    }
  });

  return () => unsubscribe(); // Clean up
}, []);




// navigation back is starting from here
useEffect(() => {
  // Push a new state to the history stack to prevent back navigation
  window.history.pushState(null, "", window.location.href);

  const handleBackButton = () => {
     setSecond(false);
  setActiveContact(null);
   setSelectedContact(null);
   setRoom("");
  };

  window.addEventListener("popstate", handleBackButton);

  return () => {
    window.removeEventListener("popstate", handleBackButton);
  };
}, []);

// navigation back is ending here
useEffect(() => {
  if (Notification.permission !== "granted") {
    Notification.requestPermission();
  }
}, []);









async function notifyUser() {
 
  const token = fcmToken; // Get this from Firebase Messaging
  const title = "New Message!";
  const body = "You have a new message on Mind Chat.";

  try {
    const response = await fetch("http://localhost:3001/notify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token, title, body }),
    });
     
    const result = await response.text();
    console.log(result);
    alert(`This is notification : ${result}`);
  } catch (error) {
    console.error("Notification Error:", error);
  }
}





useEffect(() => {
  if ("Notification" in window && Notification.permission !== "granted") {
    Notification.requestPermission().then((permission) => {
      console.log("Notification permission status:", permission);
    });
  }
}, []);










 






const [online,setOnline]=useState("offline");

  const chatInputRef = useRef(null);
useEffect(() => {
  if (!room ){
    return ; 
    
  }
   let count1;
socket.on("room_user_count", (count) => {
  try {
    console.log(`Users in room: ${count}`);
    setOnline(count > 1 ? "Online" : "Offline");
  } catch (error) {
    console.error("Error handling room count:", error);
  }
});
 console.log("Joining room:", room); // ✅ Make sure this logs

  socket.emit("join_room", room);     // ✅ Emit the correct room name

alert(`Users in room: ${count1}`)





  chatInputRef.current?.blur();
  const phone = sessionStorage.getItem("phone") || Cookies.get("mobile");

const fetchHistory = async (forceRefresh = false) => {
  try {
    // Check localStorage unless forced to refresh from backend
    if (!forceRefresh) {
      const cachedChats = localStorage.getItem(`chats_${room}`);
      if (cachedChats) {
        const parsedChats = JSON.parse(cachedChats);
        setChats(parsedChats);

        // Scroll to bottom after rendering
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: "instant" });
        }, 0);

        return; // Skip backend fetch if cache exists
      }
    }

    // Fetch from backend
    const res = await fetch(`${backendUrl}api/fetchHistory`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ room, userId: phone }),
    });

    if (!res.ok) throw new Error("Failed to fetch chat history");

    const data = await res.json();

    // Use the latest 5 messages
   if (data.length === 0) {
  localStorage.removeItem(`chats_${room}`); // clear stale cache
  setChats([]);
} else {
  const latestChats = data.slice(-5);
  setChats(latestChats);
  localStorage.setItem(`chats_${room}`, JSON.stringify(data));
}

    // Scroll to bottom after rendering
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "instant" });
    }, 0);
  } catch (error) {
    console.error("Error fetching chat history:", error);
  }
};

// Call it initially

  fetchHistory();


 

  // Receive message event
socket.on("receive_message", (data) => {
  const currentUserPhone = sessionStorage.getItem("phone") || Cookies.get("mobile");
  const isSender = data.userId === currentUserPhone;
  const isSameRoom = data.room === room;

  // ✅ Always update chat if it's the same room
  if (isSameRoom) {
  
    setChats((prevChats) => {
      const updatedChats = [...prevChats, data];

      // Cache updated messages to localStorage
      localStorage.setItem(`chats_${room}`, JSON.stringify(updatedChats));

      // Check if the message is an image
      if (data.text.match(/\.(jpg|jpeg|png|gif)$/i)) {
        setImageBuffer((prev) => [...prev, data.text]);
      } else {
        setImageBuffer([]);
      }

      return updatedChats;
    });

    // Scroll to latest message
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }

  // ✅ Show notification if the message is from someone else and not visible
  if (!isSender && (!isSameRoom || document.hidden)) {
    if ("Notification" in window && Notification.permission === "granted") {
      try {
        new Notification(`Message from ${data.userName}`, {
          body: data.text.includes("http") ? "📷 Sent an image" : data.text,
          icon: "/Images/app.png",
        });

        const audio = new Audio("/Sounds/notifications.mp3");
        audio.play().catch((e) => console.log("Sound error:", e));

        // Flash title
        document.title = "(1) New message - Mind Chat";
      } catch (err) {
        console.warn("Notification failed:", err);
      }
    } else {
      console.warn("Notification not shown: permission not granted");
    }
  }
});


  return () => {
    socket.off("receive_message");
     socket.off("room_user_count");
  };
}, [room]);






const [deleteOption, setDeleteOption] = useState("forMe");
const [deleting, setDeleting] = useState(false);

const deleteChats = async (deleteType = "forMe") => {
  try {
    setDeleting(true);

    const userId = sessionStorage.getItem("phone") || Cookies.get("mobile");

    const res = await fetch(`${backendUrl}api/deleteChats`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ room, deleteType, userId }),
    });

    if (!res.ok) throw new Error("Failed to delete chats");

    // Clear chat UI and localStorage
    setChats([]);
    localStorage.removeItem(`chats_${room}`);

    if (deleteType === "forEveryone") {
       setChats([]);
      localStorage.removeItem(`chats_${room}`);
      socket.emit("delete_for_everyone", { room });

    }else{
       localStorage.removeItem(`chats_${room}`);
        setChats([]);
     alert("Deleted for me is done");
    }

    // 🔁 Force refresh from backend to avoid refetching deleted data
    

    setDchat(false);
  } catch (error) {
    console.error("Error deleting chats:", error);
    alert("Failed to delete chats");
  } finally {
    setDeleting(false);
  }
};



























// Join chat room
// const joinRoom = (contact) => {
//   if (contact) {
//     const newRoom = [sessionStorage.getItem("phone"), selectedContact.mobile].sort().join("_");
//     setRoom(newRoom);
//     socket.emit("join_room", newRoom);
//     setJoined(true);
//   }
// };
useEffect(() => {
  if (you.length > 0) {
    setPro_uname(you[0].username); // Assuming you want the first user's username
  }
}, [you]);
// Send message


// after clicking on enter button the message will be send 

const handleKeyDown = (e) => {
  if (e.key === "Enter" && chat.trim() !== "") {
    sendMessage(chat);
    setChat(""); // Clear input after sending
  }
};


// browser notification is starting from here
useEffect(() => {
  requestPermission();
}, []);
const requestPermission = () => {
  if ("Notification" in window) {
    Notification.requestPermission().then((permission) => {
      console.log("Notification permission:", permission);
    });
  }
};

const showNotification = (chat,sender) => {
  console.log(sender);
  if (Notification.permission === "granted") {
    const audio = new Audio("./Sounds/notifications.mp3"); // Replace with your sound file
    audio.play();
    const notification=new Notification("MindChat", {
      icon: "./Images/app.png", 
      // badge:"./Images/app.png",
      body:sender+" : "+chat,
      vibrate: [200, 100, 200], // Mobile vibration pattern
      requireInteraction: true, 
      
    });
    // notification.onclick = () => {
    //   window.open("https://localhost:3000"); // Replace with your chat URL
    // };
  }
};




// browser notification is ending from here

const [view,setView]=useState(false);









// for image sending is starting from here
const [viewUpload,setViewUpload]=useState(false);
const [file, setFile] = useState(null);
const [preview, setPreview] = useState(null);
const [plusview,setPlusview]=useState(false);




const DisableviewUpload = ()=>{
  setPlusview(false);
  setViewUpload(false);


  setShowIcon(false);
}





const RemoveSticker = ()=>{
  emojiStyle.classList.remove("emoji-color");
  Emoji.classList.remove("emoji-style");
}
const imageSet = (e) => {
  const selectedFile = e.target.files[0];

  if (!selectedFile) return;

  setFile(selectedFile);
  console.log("selected file " + selectedFile);

  setPreview(URL.createObjectURL(selectedFile));
  setViewUpload(true);
  setShowIcon(true);
  setPlusview(true);
 
  
  fileSend.classList.remove("file-ani");
  // Reset the file input value to allow selecting the same file again
  e.target.value = "";
};




const phone = sessionStorage.getItem("phone") || Cookies.get("mobile");
const contactNo = sessionStorage.getItem("phone") || Cookies.get("mobile");

const [imageLoading,setImageLoading]=useState(false);

const sendMessage = async (req, res) => {
  setShowIcon(false);
  setViewUpload(false);
  if(file){
    setImageLoading(true);
  }

  // Add new contact
  await fetch(`${backendUrl}api/addNewContact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      phone: selectedContact?.mobile,
      username: "Unknown",
      mobile: contactNo,
     
    }),
  });

  if (!room || (!chat.trim() && !file)) return;

  const timestamp = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000; // IST Offset in milliseconds
  const istDate = new Date(timestamp.getTime() + istOffset);

  // Format IST Time in HH:MM
  const hours = istDate.getUTCHours().toString().padStart(2, "0");
  const minutes = istDate.getUTCMinutes().toString().padStart(2, "0");
  const istTime = `${hours}:${minutes}`;
  console.log("IST Time:", istTime);

  if (file) {
    // If there's an image file, send it via FormData
    const formData = new FormData();
    formData.append("image", file);
    formData.append(
      "messageData",
      JSON.stringify({
        userName: pro_uname,
        text: chat, // Send text as well if available
        room,
        timeStamp: istTime,
      })
    );

    try {
      await fetch(`${backendUrl}api/sendImageMessage`, {
        method: "POST",
        body: formData,
      });

      console.log("Image message sent successfully!");
    } catch (error) {
      console.error("Error in sending image message:", error);
    }
  } else {
    // If there's no image, send a text message through Socket.io
    const messageData = {
      userName: pro_uname,
      text: chat,
      room,
      timeStamp: istTime,
    };

    socket.emit("send_message", messageData);
    console.log("Text message sent successfully!");
  }

  // Clear input fields
  setChat("");

  setPlusview(false);

 
  setImageLoading(false);
  secondBtn();
  setPreview(null);
  setFile(null);
  setTimeout(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "instant" });
  }, 1);

};
// chating part is ending here

 const filteredContacts = contacts.filter((contact) =>
    contact.username.toLowerCase().includes(searchTerm.toLowerCase())
  );
const [dpMap, setDpMap] = useState({});
const [aboutMap, setAboutMap] = useState({});

useEffect(() => {
  const fetchDps = async () => {
    // ✅ Check if cached in localStorage
    const cachedDpMap = localStorage.getItem("dpMap");
    const cachedAboutMap = localStorage.getItem("aboutMap");

    if (cachedDpMap && cachedAboutMap) {
      try {
        setDpMap(JSON.parse(cachedDpMap));
        setAboutMap(JSON.parse(cachedAboutMap));
        return; // ✅ Skip fetching from backend
      } catch (e) {
        console.error("Failed to parse localStorage data", e);
        // Fallback to fetching if JSON parsing fails
      }
    }

    const newDpMap = {};
    const newAboutMap = {};

    for (const contact of filteredContacts) {
      try {
        const dpRes = await fetch(`${backendUrl}api/fetchDp`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mobile: contact.mobile }),
        });

        const dpData = await dpRes.json();

        newDpMap[contact.mobile] = dpData.dp || "./Images/image.png";
        newAboutMap[contact.mobile] = dpData.about;
      } catch (error) {
        newDpMap[contact.mobile] =
          "https://res.cloudinary.com/dnd9qzxws/image/upload/v1743764088/image_dp_uwfq2g.png";
        newAboutMap[contact.mobile] = "Hello ! I am not in MindChat !";
      }
    }

    // ✅ Update state
    setDpMap(newDpMap);
    setAboutMap(newAboutMap);

    // ✅ Save to localStorage
    localStorage.setItem("dpMap", JSON.stringify(newDpMap));
    localStorage.setItem("aboutMap", JSON.stringify(newAboutMap));
  };

  // ✅ Prevent running if contacts haven't loaded yet
  if (filteredContacts.length > 0) {
    fetchDps();
  }
}, [filteredContacts]);









const addContact = async (e) => {
  e.preventDefault(); // Prevents page refresh
  console.log("Form submitted!");

  const newRoom = [phone, mobile].sort().join("_");

  try {
    // Now send the contact data with the fetched DP
    await fetch(`${backendUrl}api/addContact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone,
        username,
        mobile,
        room : newRoom
      }),
    });
    setRoom(newRoom);
    socket.emit("join_room", newRoom);
    setUsername("");
    setMobile("");
  } catch (error) {
    console.error("Error adding contact:", error);
  }
};




const reducer = (state) => state + 1;
const [update, forceUpdate] = useReducer(reducer, 0);

useEffect(() => {
  const fetchContacts = async () => {
    const cachedContacts = sessionStorage.getItem("contacts");

    if (cachedContacts) {
      //  Use cached contacts
      setContacts(JSON.parse(cachedContacts));
    } else {
      try {
        //  Use sessionStorage first, fallback to cookie
        const phone = sessionStorage.getItem("phone") || Cookies.get("mobile");

        if (!phone) {
          console.warn("No phone number found in session or cookies.");
          return;
        }

        const res = await fetch(`${backendUrl}api/fetch`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone }),
        });

        if (!res.ok) throw new Error("Failed to fetch contacts");

        const data = await res.json();
        setContacts(data);

        // ✅ Store fresh data to sessionStorage
        sessionStorage.setItem("contacts", JSON.stringify(data));
      } catch (error) {
        console.error("Error fetching contacts:", error);
      }
    }
  };

  fetchContacts();

  const interval = setInterval(() => {
    const cachedContacts = sessionStorage.getItem("contacts");
    if (!cachedContacts) {
      forceUpdate(); // ✅ Force re-fetch if cache is cleared
    }
  }, 1000);

  return () => clearInterval(interval);
}, [update]);




  
  
  // Handle joining the chat room and fetching chat history
 
  const sec=()=>{
    setSecond(false);
  setActiveContact(null);
   setSelectedContact(null);
   setRoom("");
   }
  // Fetch selected contact details
  const handleContactClick = async (contactId) => {
   
     
  
    try {
      if (!contactId) {
        console.error("Error: Invalid contact ID");
        return;
      }
  
      const res = await fetch(`${backendUrl}api/contact/${contactId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
  
      if (!res.ok) {
        if (res.status === 404) {
          console.error("Error: Contact not found");
          return;
        }
        throw new Error("Failed to fetch contact details");
      }
  
      const data = await res.json();
      setSelectedContact(data);
      
      // Generate unique room ID based on session phone and selected contact's mobile
     const phone = sessionStorage.getItem("phone") || Cookies.get("mobile");
const newRoom = [phone, data.mobile].sort().join("_");
      
      // Clear previous chat history
      setChats([]);
      setTypingUser("");
  
      // Set room and join
      setRoom(newRoom);
      socket.emit("join_room", newRoom);
  
      // UI state updates
      setIsPopup(false);
      setSecond(true);
     
      setActiveContact(contactId);
      setWelcome(false);
      setJoined(true);
      
    } catch (error) {
      console.error("Error fetching contact details:", error);
    }
  };
  




 






















  const handleContactDelete = async (contactId) => {
    try {
      const res = await fetch(`${backendUrl}api/delete/${contactId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
  
      if (!res.ok) {
        throw new Error("Failed to delete contact");
      }
  
     
      setSecond(false);
      setThird(false);
      setIsPopup(false);
      // Update the contact list after deletion
      setContacts((prevContacts) => prevContacts.filter((c) => c._id !== contactId));
      setSelectedContact(null); // Remove selected contact after deletion
    } catch (error) {
      console.error("Error deleting contact:", error);
      alert("Failed to delete contact.");
    }
  };
  
  












// if(navProfile){
//   setShowcontainer(false);
// }


  // Filter contacts based on search input
 

  // from here this code is for typing message 
  const [typingUser, setTypingUser] = useState("");
  const typingTimeoutRef = useRef(null);


  useEffect(() => {
    socket.on("show_typing", (user) => {
      if (user !== userName) {
        setTypingUser("typing...");

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        
        typingTimeoutRef.current = setTimeout(() => setTypingUser(""), 2000);
      }
    });

    socket.on("hide_typing", () => {
      setTypingUser("");
    })
  
    return () => {
      socket.off("show_typing");
      socket.off("hide_typing");
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [room]);

 useEffect(() => {
  socket.on("hide_typing", () => {
    setTypingUser(""); // Remove "Typing..." immediately
  });

  return () => socket.off("hide_typing");
}, [room]);

// end of typing part here

  const handleChange = (event) => {
    const value = event.target.value.trim();
    
    setChat(event.target.value);
    setShowIcon(value !== "");
    if (!room) return;
    
    socket.emit("typing", {room});

    // Stop typing event after 2 seconds of inactivity
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop_typing", { room });
    }, 2000);
  };




  useEffect(() => {
    // Auto-scroll to the latest message when chats change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chats]); // Runs when 'chats' updates (new message added)











































  // fetching username of own
 
  useEffect(() => {
         const fetchContacts = async () => {
         
           try {
             const phone = sessionStorage.getItem("phone") || Cookies.get("mobile");
             const res = await fetch(`${backendUrl}api/fetchYou`, {
               method: "POST",
               headers: { "Content-Type": "application/json" },
               body: JSON.stringify({ phone }),
             });
     
             if (!res.ok) throw new Error("Failed to fetch contacts");
             const data = await res.json();
             setYou(data);
           } catch (error) {
             console.error("Error fetching contacts:", error);
           }
         };
     
         fetchContacts();
       }, []);
  






      
       
      
     
    
     const [popcontact,setPopcontact]=useState(false);
     
    
const hidePopup=()=>{
  setPopcontact(false);
  setThird(false);
}


const hideEditProfile=()=>{
  setEditprofile(false);
  setPopcontact(false);
}



const [firstName,setFirstName]=useState("");
const [lastName,setLastName]=useState("");
const [fullName,setFullName]=useState("");
useEffect(() => {
  if (selectedContact?.username) {
    setFirstName(selectedContact.username);
  }
}, [selectedContact]); // Runs whenever selectedContact changes

useEffect(()=>{
  setFullName(`${firstName} ${lastName}`);
},[firstName,lastName])

// edit contact
const updateContacts = async (e) => {
        e.preventDefault();
  try {
    const phone = sessionStorage.getItem("phone") || Cookies.get("mobile");
    const res = await fetch(`${backendUrl}api/updateContact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, mobile : selectedContact?.mobile , username : fullName }),
    });

    if (!res.ok) throw new Error("Failed to fetch contacts");
    window.location.reload();
  } catch (error) {
    console.error("Error updating:", error);
  }
};







const playVideo = () => {
 
};
const [rotate,setRotate]=useState(false);
let seconddiv=document.querySelector(".messages");
let fileSend=document.querySelector(".file-send");
let plus=document.querySelector("#plus");

const fileAni=()=>{
 setRotate(true);
  fileSend.classList.toggle("file-ani");
  plus.classList.toggle("rotate-plus");
  seconddiv.classList.toggle("scroll");
  removeSticker();
}
const secondDiv=()=>{
 
 

  if(viewUpload===false){
    plus.classList.remove("rotate-plus");
    plus.classList.add("rotate-minus");
  }
 
  seconddiv.classList.remove("scroll");
   fileSend.classList.remove("file-ani");
  
}

const secondBtn=()=>{
  if(viewUpload===false){
    plus.classList.remove("rotate-plus");
    plus.classList.add("rotate-minus");
  }
 
  seconddiv.classList.remove("scroll");
   fileSend.classList.remove("file-ani");
}

let Emoji=document.querySelector(".emoji-picker");
let emojiStyle=document.querySelector("#emoji");
const fileSticker=()=>{
  emojiStyle.classList.toggle("emoji-color");
  Emoji.classList.toggle("emoji-style");
  seconddiv.classList.toggle("scroll");

if(viewUpload===false){
  plus.classList.remove("rotate-plus");
  plus.classList.add("rotate-minus");
}
  
  seconddiv.classList.remove("scroll");
   fileSend.classList.remove("file-ani");
 
}

const removeSticker =()=>{
 
  emojiStyle.classList.remove("emoji-color");
  Emoji.classList.remove("emoji-style");
  seconddiv.classList.remove("scroll");
}

 const [isFocused, setIsFocused] = useState(false);
 const inputRef = useRef(null);

  useEffect(() => {
    const typemsg = inputRef.current;
    if (!typemsg) return;

    if (isFocused) {
      typemsg.classList.add("extra");
    } else {
      typemsg.classList.remove("extra");
    }
  }, [isFocused]);







const handleEmojiClick = (emoji) => {
  setChat((prevInput) => prevInput + emoji.emoji);
 setShowIcon(true);
};



useEffect(() => {
  const input = document.querySelector("#entered-msg");
  const chatbody = document.querySelector("#chat-body");
  const  messages= document.querySelector("#messages");
 
}, []);











const [selectedImage, setSelectedImage] = useState("");
const [msgview, setMsgview] = useState(false);

const handleMessageClick = (imageUrl) => {
 
  if (imageUrl) {
    setSelectedImage(imageUrl);
    setMsgview(true);
    console.log("Clicked image URL:", selectedImage); // Debugging
  }
};





const [viewContact,setViewContact]=useState(false);
const [dchat,setDchat]=useState(false);
// const [lastMessages, setLastMessages] = useState({});
     
// useEffect(() => {
//   if (chats.length > 0) {
//     setLastMessage(chats.at(-1)); // Gets the last message in chats
//   }
// }, [chats]); // Runs when `chats` updates

  return (
    <div className="chatContainer">
    



    {
  imageLoading &&(
    <div class="image-container1">
  <div class="dot1">Sending</div>
   <div class="dot"></div>
  <div class="dot"></div>
  <div class="dot"></div>
 
      </div>
  )
}
 
   















{/* contactView is starting from here */}
{
 viewContact && (
<div className="photo-overlay2">
<div className="photo-nav">

<div className="left-nav">
{
you.map((profile)=>(


<img src={`https://res.cloudinary.com/dnd9qzxws/image/upload/v1743761726/${dpMap[selectedContact.mobile]}`}  alt="Profile" key={profile.id} />

 
))
}
<p>{selectedContact.username}</p>
</div>


<div className="right-nav" onClick={()=>{setViewContact(false)}}>
<RxCross2 id="right-cross"/>
</div>


</div>

{
you.map((profile)=>(
<div className="view-photo" key={profile.id}>

<img src={`https://res.cloudinary.com/dnd9qzxws/image/upload/v1743761726/${dpMap[selectedContact.mobile]}`}  alt="Profile" />
</div>
 
))
}
</div>

  )
}

{/* contactView is ending here */}





{/* delete chat is starting from here */}
{
  dchat && (
    <div className="popup-overlay">
      <div className="delete-chat-popup">
        <div className="popup-header">
          <h3>Delete messages</h3>
          <RxCross2 id="close-delete" onClick={() => setDchat(false)} />
        </div>
        
        <div className="delete-options">
          <div 
            className={`option ${deleteOption === "forMe" ? "selected" : ""}`}
            onClick={() => setDeleteOption("forMe")}
          >
            <input 
              type="radio" 
              checked={deleteOption === "forMe"}
              onChange={() => {}}
            />
            <div className="option-text">
              <span>Delete for me</span>
              <p>Messages will be deleted from this device only</p>
            </div>
          </div>
          
          <div 
            className={`option ${deleteOption === "forEveryone" ? "selected" : ""}`}
            onClick={() => setDeleteOption("forEveryone")}
          >
            <input 
              type="radio" 
              checked={deleteOption === "forEveryone"}
              onChange={() => {}}
            />
            <div className="option-text">
              <span>Delete for everyone</span>
              <p>Messages will be deleted for all participants</p>
            </div>
          </div>
        </div>
        
        <div className="popup-actions">
          <button 
            className="cancel-btn"
            onClick={() => setDchat(false)}
            disabled={deleting}
          >
            Cancel
          </button>
          <button 
            className={`delete-btn ${deleting ? "deleting" : ""}`}
            onClick={() => deleteChats(deleteOption)}
            disabled={deleting}
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  )
}

{/* delete chat is ending here */}



















{
 msgview && selectedImage && (
<div className="photo-overlay2">
<div className="photo-nav">

<div className="left-nav">
{
  you.map((profile) => (
    <div key={profile.id}>
      {chats.map((msg, index) => (
        msg.text === selectedImage ? ( // Check if message text matches selectedImage
          <div key={index}>
            {msg.userName === pro_uname ? (
             
                <img src={`https://res.cloudinary.com/dnd9qzxws/image/upload/v1743761726/${profile.dp}`}  alt="Profile" key={profile.id} /> 
               
            ) : (
              <img
                src={`https://res.cloudinary.com/dnd9qzxws/image/upload/v1743761726/${dpMap[selectedContact.mobile]}`}
                alt="Profile"
              />
            )}
          </div>
        ) : null
      ))}
    </div>
  ))
}



{chats.map((msg, index) => (
  <div key={index}>
    {msg.text === selectedImage ? ( // Check if this message is the selected image
      msg.userName === pro_uname ? (
        <p>You</p>
      ) : (
        <p>{selectedContact.username}</p> // Show sender's username instead of "Others"
      )
    ) : null}
  </div>
))}



</div>


<div className="right-nav" onClick={()=>{setMsgview(false)}}>

<IoMdDownload 

className="download-video"
  onClick={async (e) => {
    e.stopPropagation(); // Prevent closing the popup

    const response = await fetch(`${selectedImage}`);
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = selectedImage;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link); // Cleanup
    URL.revokeObjectURL(url);
  }}
/>









<RxCross2 id="right-cross"/>
</div>


</div>

{
you.map((profile)=>(
<div className="view-photo1" key={profile.id}>

{(() => {
  if (selectedImage?.match(/\.(mp4|webm)$/)) {
    return <video src={`${selectedImage}`}
    controls autoPlay alt="Profile"/>;
  } else {
    return <img src={`${selectedImage}`}
 alt="Profile" />;
  }
})()}
</div>
 
))
}
</div>

  )
}

















      {
        welcome && (
          <div class="typing-text"></div>
        )
      }
    

      {/* Chat Section */}

{
  showcontainer && (
<div className="chat first">
        <div className="heading-part">
          <h2 id="chat-heading">MindChat</h2>
          <MdPersonAddAlt1 id="add-contact" onClick={()=>{setShowcontainer(false)}} />
        </div>

        {/* Search Bar */}
        <div className="searchClass">
          <input
            type="text"
            id="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search contact..."
          />
        </div>
          
        {/* Contacts List */}
        <div className="chat-part">
  <ul>
    {filteredContacts.map((contact) => {
      // Create the room ID for this specific contact
     const phone = sessionStorage.getItem("phone") || Cookies.get("mobile");

if (!phone) {
  console.error("No phone number found in sessionStorage or cookies.");
}

const contactRoom = [phone, contact.mobile].sort().join("_");
      
      // Filter messages for this contact's room
      const contactMessages = chats.filter(msg => msg.room === contactRoom);
      
      // Get the last message (if any exists)
      const lastMessage = contactMessages.length > 0 ? contactMessages[contactMessages.length - 1] : null;

      return (
        <li 
          key={contact._id} 
          onClick={() => handleContactClick(contact._id)}  
          className={activeContact === contact._id ? "active" : ""}
        >
           
           <div className="dp-wrapper">
  <img
    src={`https://res.cloudinary.com/dnd9qzxws/image/upload/v1743761726/${dpMap[contact.mobile]}`}
    id="dp-default"
   onLoad={()=>{setLoading(false)}}
  />
  {
    loading &&(
      <div className="dp-default" />
    )
  }
  </div>
          <div className="textChat">
            <p id="username">{contact.username}</p>
            
            {typingUser && activeContact === contact._id ? (
              <span className="typing-indicator">{typingUser}</span>
            ) : (
              <p id="msg">
                {lastMessage ? (
                  // Handle different message types
                  lastMessage.text?.includes("uploads/") ? 
                    (lastMessage.text?.match(/\.(jpg|jpeg|png|gif)$/) ? "📷 Photo" : 
                     lastMessage.text?.match(/\.(mp4|webm)$/) ? "🎥 Video" : 
                     lastMessage.text?.match(/\.(mp3|mpeg)$/) ? "🔊 Audio" : 
                     lastMessage.text?.match(/\.(pdf)$/) ? "📄 PDF" : 
                     lastMessage.text?.match(/\.(docx?)$/) ? "📝 Document" : 
                     lastMessage.text?.match(/\.(pptx?)$/) ? "📊 Presentation" : 
                     "📁 File") 
                  : lastMessage.text
                ) : "Join the chat"}
              </p>
            )}
          </div>
        </li>
      );
    })}
  </ul>
</div>












      </div>
  )
}








{
  !showcontainer && (
<div className="chat first">
        
        <div className="heading-part">
        <h2 id="chat-heading">Add Contact</h2>
        </div>

        <div>
        <form onSubmit={addContact}>
            <div className="textarea">
            <input type="text" className="name" placeholder="Enter contact name..." onChange={(e) => setUsername(e.target.value)} required />
            <input tupe="number" className="phone" placeholder="Enter mobile number..."  onChange={(e) => setMobile(e.target.value)} required />
            </div>
           
            <div className="button">
               
                <button type="submit" id="save">Save</button>
                <button id="cancel" onClick={()=>{setShowcontainer(true)}}>Cancel</button>
            </div>
        </form>
          
       
        </div>
    
    
        
         </div>
  )
}






      














      {/* Contact Details Section */}

      {
       
          second &&(
            <div className="chat second">
            {
              selectedContact && (
                <div className="second-nav">
                <FaArrowLeft  onClick={sec} className="second-nav-arrow"/>
              <div className="chat-header" onClick={()=>{setThird(true)}}>
              <img src={`https://res.cloudinary.com/dnd9qzxws/image/upload/v1743761726/${dpMap[selectedContact.mobile]}`} id="chat-header-img" alt="Profile" />
              <p>{selectedContact.username}<br/>{typingUser && <span className="typing-indicator">{typingUser}</span>}<br/>{online && <span className="typing-indicator">{online}</span>}</p>
             <div className="contact-list">
    
    </div>
              {/* {typingUser && } */}
              
               
  
              </div>
  
              </div>
              )
            }



        {/* emoji picker is starting from here */}
<div className="emoji-picker">
<EmojiPicker id="emoji-picker" height="400px" width="600px"  onEmojiClick={handleEmojiClick}/>
</div>
{/* emoji picker is ending here */}

              
{viewUpload && preview && (
  <div className="chat-body1" onClick={RemoveSticker}>
    <RxCross1 className="bold-cross" onClick={DisableviewUpload} />
    {file && file.type.startsWith("video/") ? (
      <video src={preview} controls  className="video-preview" />
    ) : (
      <img src={preview} alt="preview" className="img-preview" />
    )}
  </div>
)}

             
             
    
    
              <div className="chat-body" id="chat-body" style={{ backgroundImage: `url(${" ./Images/bg.png"})` }}>
              




















                  {/* documents send popup is starting from here */}
    <div className="file-send">
    
        <ul>
        <label for="image-send">
         <li><IoMdPhotos className="icon photo"/>Photo</li>
         </label>
         <label for="video-send">
         <li><FaFileVideo className="icon video"/>Video</li>
         </label>
         <label for="audio-send">
         <li><MdAudioFile className="icon audio"/>Audio</li>
         </label>
         <label for="camera-send">
         <li><FaCamera className="icon camera"/>Camera</li>
         </label>
         <label for="document-send">
         <li><IoDocumentTextSharp className="icon document"/>Documents</li>
         </label>
         
        
         
      </ul>
        
      
                    
                   
     </div>
  
      {/* documents send popup is ending from here */}
  
    {selectedContact && joined &&(
    
      <div className="chat-box" id="chat-box" onClick={secondDiv}>
        <div   className="messages" id="messages" onClick={removeSticker}>
          {chats.map((msg, index) => (
            
            <div
              key={index}
              className={`message ${msg.userName === pro_uname ? "own" : "other"}`}
             
            >
             {
                sessionStorage.setItem("notUser",msg.userName)
             }
             
             
              {/* <span className="username">{msg.userName}</span> */}
             
             
             
              {msg.text?.includes("uploads/") ? (
              <div>
                    {(() => {
  
  if (msg.text?.match(/\.(mp4|webm)$/)) {
    return (
      <div className="audio-view" id="video-view">
        <div className="play-btn">
        <FaPlay className="play"/>
        </div>
   
      <video
        src={`${msg.text}`}
        id="image-view"
        onClick={() => handleMessageClick(msg.text)}
        onError={(e) => (e.target.style.display = "none")}
       
        alt="User Video"
      />
      <span id="vid-msg-time">{msg.timeStamp}</span>
      </div>
    );
  } else if(msg.text?.match(/\.(mp3|mpeg)$/)){
     return (
      <div className="audio-view">
      <audio controls  id="audio-view">
        <source src={`${msg.text}`} id="audio-view-child"  onClick={() => handleMessageClick(msg.text)}
        />
         
      </audio>
      <span id="ppt-time">{msg.timeStamp}</span>
      </div>
     
     )
  }
  
  else if(msg.text?.match(/\.(pdf)$/)){
    return(
      <div>
      <div>
      <iframe
        src={`${msg.text}`}
        className="pdf-view"
       
      />
      </div>
      <div id="pdf-content">
      <FaFilePdf id="pdf-icon"/>
      <button
        onClick={() => {
          navigate("/download");
          const link = document.createElement("a");
          link.href = `${msg.text}`;
          link.download = msg.text;
          document.body.appendChild(link);
          link.click();
        }} id="download-button"
      >
        <MdOutlineDownloadForOffline id="download-logo"/>
      </button>
      </div>
      <span id="ppt-time">{msg.timeStamp}</span>
    </div>
    
    )
   
  }else if(msg.text?.match(/\.(docx)$/)){
    return(
      <div>
      <div>
      <iframe
  src={`https://docs.google.com/viewer?url=${msg.text}&embedded=true`}
  className="docx-view"
/>
      </div>
      <div id="docx-content">
      <PiMicrosoftWordLogoFill  className="word-icon"/>
      <button
        onClick={() => {
          const link = document.createElement("a");
          link.href =`${msg.text}`;
          link.download = msg.text;
          link.click();
        }} id="download-button"
      >
        <MdOutlineDownloadForOffline id="download-logo"/>
      </button>
      </div>
      <span id="ppt-time">{msg.timeStamp}</span>
    </div>
    
    )
   
  }
  else if(msg.text?.match(/\.(pptx)$/)){
    return(
      <div>
      <div>
      <iframe
        src={`${msg.text}&embedded=true`}
        className="docx-view"
       
      />
      </div>
      <div id="docx-content">
      <PiMicrosoftPowerpointLogoFill className="ppt-icon"/>
      <button
        onClick={() => {
          const link = document.createElement("a");
          link.href = `${msg.text}`;
          link.download = msg.text;
          link.click();
        }} id="download-button"
      >
        <MdOutlineDownloadForOffline id="download-logo"/>
      </button>
     
      </div>
      <span id="ppt-time">{msg.timeStamp}</span>
    </div>
    
    
    )
  }
  // }  else if (imageBuffer.length >= 4) {
   
  //   return (
      
  //     <div className="image-container grid-view">
  //       {imageBuffer.map((image, index) => (
  //         <div key={index} className="image-view">
  //           <img
  //             src={`http://localhost:3001/${image}`}
  //             alt="User Image" 
  //             onClick={() => handleMessageClick(image)}
  //             onError={(e) => (e.target.style.display = "none")}
  //           />
  //           <span className="img-msg-time">{msg.timeStamp}</span>
  //         </div>
  //       ))}
  //     </div>
  //   );
  // } 
  
  else {
    return (
      
      <div className="image-view">
      <img
       src={`${msg.text}`}
        id="image-view"
        onClick={() => handleMessageClick(msg.text)}
        onError={(e) => (e.target.style.display = "none")}
        alt="User Image"
      />
      <span id="img-msg-time" >{msg.timeStamp}</span>
      </div>
    );
  }
})()}


              </div>

        
        
        ):(

               
          <div>


            
          {msg.text?.match(/https?:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[^\s]+/i) ? (
          <div>
          <iframe
            src={`https://www.youtube.com/embed/${msg.text.split('v=')[1]?.split('&')[0] || msg.text.split('/').pop()}`}
            id="link"
            width="250"
            height="200"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
          <a
          href={msg.text.startsWith('http') ? msg.text : `https://${msg.text}`}
          target="_blank"
          rel="noopener noreferrer" id="link"
        >
          {msg.text}
        </a>
       <div className="msg-time">
       <span id="msg-time">{msg.timeStamp}</span>
        </div>
        
             </div>

           
          ) : msg.text?.match(/https?:\/\/(www\.)?facebook\.com\/(watch\/\?v=\d+|[^\/]+\/videos\/\d+|share\/v\/[a-zA-Z0-9]+)/i) ? (
            <div>
<iframe
  src={`https://www.facebook.com/plugins/video.php?href=${encodeURIComponent("https://www.facebook.com/watch/?v=16G9t6e5GQ")}&show_text=false&width=250&height=200`}
  id="link"
  width="250"
  height="200"
  frameBorder="0"
  allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
  allowFullScreen
/>
            <a
              href={msg.text.startsWith('http') ? msg.text : `https://${msg.text}`}
              target="_blank"
              rel="noopener noreferrer"
              id="link"
            >
              {msg.text}
            </a>
            <div className="msg-time">
              <span id="msg-time">{msg.timeStamp}</span>
            </div>
          </div>
          ):msg.text?.match(/https?:\/\/(www\.)?(youtube\.com\/(watch\?v=|shorts\/)|youtu\.be\/)[^\s]+/i) ? (
            <div>
            <iframe
      src={`https://www.youtube.com/embed/${
        msg.text.includes("shorts/")
          ? msg.text.split("shorts/")[1]?.split("?")[0] // Extract Shorts ID
          : msg.text.split("v=")[1]?.split("&")[0] || msg.text.split("/").pop() // Extract Normal Video ID
      }`}
      id="link"
      width="250"
      height="200"
      frameBorder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
    />
            <a
            href={msg.text.startsWith('http') ? msg.text : `https://${msg.text}`}
            target="_blank"
            rel="noopener noreferrer" id="link"
          >
            {msg.text}
          </a>
         <div className="msg-time">
         <span id="msg-time">{msg.timeStamp}</span>
          </div>
          
               </div>
  
          ):(
            <div id="chat-text">
              <div>
              <span className="chat-text">{msg.text}</span>
              </div>
            <div className="msg-time">
            <span id="msg-time">{msg.timeStamp}</span>
            </div>
             
            </div>
          )
          
           
          
          
          }
        </div>
              
              
              )
            }




           
            </div>
          ))}
          <div ref={messagesEndRef}></div>
        </div>
      </div>
    )
  }
  
  
  
  
  
  

  
            
              
              
              
              
              </div>
  
  
  
  
  
  
  
              <div className="type-msg"  ref={inputRef}>
              
              
                
   
                 <div className="items">
                  
                  {
                    !plusview &&(
                      <FiPlus onClick={fileAni} id="plus"/>
                    )
                  }
                
                     
                    
                      
                         <input type="file" id="image-send" name="image" onChange={imageSet} accept="image/*"/>
                         <input type="file" id="video-send" name="image" onChange={imageSet} accept="video/*"/>
                         <input type="file" id="audio-send" name="image" onChange={imageSet} accept=".mp3, .wav, .ogg , .mpeg" />
                         <input type="file" id="camera-send" name="image" onChange={imageSet} capture="user" accept="image/*"/>
                         <input type="file" id="document-send" name="image" onChange={imageSet} accept=".pdf, .doc, .docx, .xls, .xlsx, .ppt, .pptx, .txt"/>
                         <LuSticker onClick={fileSticker} id="emoji"  /><input type="text" placeholder="Type a message..."  onKeyDown={handleKeyDown} id="entered-msg" value={chat} onChange={handleChange} onClick={secondDiv}   ref={chatInputRef} onFocus={() => setIsFocused(true)}  onBlur={() => setIsFocused(false)} />
                      
                    
                        {
                          showIcon &&(
                             <IoSendSharp onClick={sendMessage}  id="send-arrow"/>
                          )
                        }
                      
                     
                 </div>
              </div>
    
    
    
    
    
    
          </div>
          )
        }
        {
          third &&(

          <div className="profile-window third" id="profile-window">

{
  popcontact &&(
<div className="upload-popup1" id="upload-popup1">
    <ul>
       <li onClick={()=>{setEditprofile(true)}}>
      Edit contact 
       </li>
       <li>
        Share contact
       </li>

    </ul>
  </div>
  )
}
 








<div className="contact-nav">
  <FaArrowLeft className="contact-icon-left" onClick={hidePopup} />
  <span className="contact-title">Contact Info</span>
  <BsThreeDotsVertical className="contact-icon" onClick={() => setPopcontact(true)} />
</div>


    <div className="contact-scroll2" onClick={()=>{setPopcontact(false)}}>
    {selectedContact && (
               <div className="contact-chat">
                 <img src={`https://res.cloudinary.com/dnd9qzxws/image/upload/v1743761726/${dpMap[selectedContact.mobile]}`} id="dp-contact-default" alt="Profile" onClick={()=>{setViewContact(true)}}/>
                
                 <h2>{selectedContact.username}</h2>
                 <p>
                   +91 {selectedContact.mobile}
                 </p>
     
     
                 <div className="about">
                  <div className="pabout">
                  <p id="aboutp">About</p>
                  <p>{aboutMap[selectedContact.mobile]}</p>
                 
                  </div>
                   </div>
     
     
     
     
     
                   <div className="block">
                   <ImBlocked id="blockIcon"/>
                    <span>Block</span>
                   </div>
     
                   <div className="block" onClick={()=>{setDchat(true)}}>
                   <RiDeleteBin6Fill id="blockIcon"/>
                    <span>Delete chats</span>
                   </div>
                  
                   
                   
                   <div className="block" onClick={()=>{setIsPopup(true)}}>
                    
                   <FcDeleteDatabase id="blockIcon"/>
                    <span>Delete contact</span>
                   </div>
               </div>
             )}
    </div>
           

         
     
          </div>
     
        )
      }
       
      
     
      {/* Chat Window */}
     


     {/* profile window */}
     
 {
  editprofile &&(
<div className="profile-window" id="edit-contact-profile">
<FaArrowLeft id="edit-arrow" onClick={hideEditProfile}/><h2 id="eph">Edit Contact</h2>
<form onSubmit={updateContacts}>
  <div className="input-sec">
  <input type="text" placeholder="First name" id="first-name" autoFocus value={firstName} onChange={(e)=>{setFirstName(e.target.value)}} required/>
  <input type="text" placeholder="Last name" id="last-name" value={lastName} onChange={(e)=>{setLastName(e.target.value)}}/>
  </div>

  <div className="contact-button">
   
  <button type="submit">Save</button>
  </div>
 
</form>

</div>
  )
 }     









    
    

     {isPopup && (
        <div className="popup-overlay">
          <div className="logout-popup">
            <div className="popup-text">
              <h3>Delete contact ?</h3>
              <p>Are you sure to delete the contact ?</p>
              <p id="see">Removing from contact list ! Click 'Delete' to confirm.</p>
            </div>
            <div className="popup-button">
              <button type="button" id="logoutCancel" onClick={() => setIsPopup(false)}>
                Cancel
              </button>
              <button id="logoutBtn" onClick={()=>{handleContactDelete(selectedContact._id)}}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}













    </div>
  );
};

export default Chatboard;