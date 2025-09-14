import SwipeNavigator from './SwipeNavigator';
import { IoPeople } from "react-icons/io5";
import { IoPersonAddSharp } from "react-icons/io5";
import { FaChevronRight } from "react-icons/fa";
import { useState , useEffect ,useRef} from 'react';
import { FaChevronLeft } from "react-icons/fa6";
import { Link, useNavigate , useLocation, Outlet } from 'react-router-dom';
import { RxCross2 } from "react-icons/rx";
import { IoPersonAdd } from "react-icons/io5";
import { FaUserFriends } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { IoIosCall } from "react-icons/io";
import { FaCircleInfo } from "react-icons/fa6";
import { BsThreeDotsVertical } from "react-icons/bs";
import { useScrollContext } from '../ScrollContext.js';
import { BsSendCheckFill } from "react-icons/bs";
import { MdChildFriendly } from "react-icons/md";
import { RiUserReceived2Fill } from "react-icons/ri";
import { MdNotifications } from "react-icons/md";
import { socket } from "./Socket";
import Cookies from "js-cookie";
const backendUrl = process.env.REACT_APP_BACKEND_URL; 
const Connect = ()=>{
const navigate=useNavigate();
  const [users,setUsers]=useState([]);
const location=useLocation();
const [loading, setLoading] = useState(false);
 const phone = sessionStorage.getItem("phone") || Cookies.get("mobile");



useEffect(() => {
  const myPhone = sessionStorage.getItem("phone");
  if (myPhone) {
    socket.emit("join", myPhone); //receiver তার room এ join করছে
  }
}, []);















useEffect(() => {
  const fetchAllUsers = async () => {
      setLoading(true);
    try {
     
      const res = await fetch(`${backendUrl}api/fetchallusers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({myPhone : phone}),
      });

      if (!res.ok) throw new Error("Failed to fetch your profile");

      const data = await res.json(); 
    setUsers(data);
    } catch (error) {
      console.error("Error fetching your profile:", error);
    }finally {
      setLoading(false); //  stop loading
    }
  };

  fetchAllUsers();


},[]);

useEffect(() => {
  const myPhone = sessionStorage.getItem("phone");
  if (myPhone) {
    socket.emit("join", myPhone); //receiver তার room এ join করছে
  }
}, []);


 const [count, setCount] = useState(0);



useEffect(() => {
  const myPhone = sessionStorage.getItem("phone");

  const fetchCount = async () => {
    const res = await fetch(`${backendUrl}api/getRequestCount`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ receiver: myPhone }),
    });
    const data = await res.json();
    
    setCount(data.count); // only unseen notifications
  };

  fetchCount();


  // listen socket for real-time update
  const interval = setInterval(fetchCount, 1000); 
  return () => clearInterval(interval); 

}, []);












const [sender,setSender]=useState("");
const [receiver,setReceiver]=useState("");


















const friendRequest = ()=>{
 let rightFriendTop=document.getElementById("right-friend-top");
  rightFriendTop.style.display="block";
 let rightFriendBottom=document.getElementById("right-friend-bottom");
  rightFriendBottom.classList.add("friend-display");
}

const addFriend = ()=>{
   navigate("/connect");
}

const hideLeftFriend = ()=>{
  let leftFriend=document.querySelector(".left-friend");
   let rightFriend=document.querySelector(".right-friend");
  leftFriend.style.display="none";
  rightFriend.classList.add("right-dynamic");
  let rnf=document.getElementById("r-n-f");
  rnf.style.display="block";
   let rightArrow=document.querySelector(".right-friend-arrow");
   rightArrow.style.display="block";
}
const openLeftFriend = ()=>{
   let leftFriend=document.querySelector(".left-friend");
   let rightFriend=document.querySelector(".right-friend");
  leftFriend.style.display="block";
  rightFriend.classList.remove("right-dynamic");
   let rnf=document.getElementById("r-n-f");
  rnf.style.display="none";
   let rightArrow=document.querySelector(".right-friend-arrow");
   rightArrow.style.display="none";
}


const [searchValue,setSearchValue]=useState("");
 const filteredUsers = users.filter((users) =>
    users.username.toLowerCase().includes(searchValue.toLowerCase())
  );



const [friendRequests, setFriendRequests] = useState({});


const friendRequestSend = async (userId) => {
  const receiverUser = users.find(user => user._id === userId);
  const senderPhone = sessionStorage.getItem("phone") || Cookies.get("mobile");

  if (!receiverUser || !senderPhone) {
    alert("Failed to send request: missing sender or receiver info.");
    return;
  }

  setReceiver(receiverUser.phone); // set receiver state (optional)
  setSender(senderPhone); // this is you
  
  try {
    const res = await fetch(`${backendUrl}api/friendrequest`
, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sender: senderPhone,
        receiver: receiverUser.phone,
       

      }),
    });

    if (!res.ok) throw new Error("Failed to send friend request");
     
    const data = await res.json();
     

    
    setFriendRequests((prev) => ({
      ...prev,
      [userId]: "Sent Request"
    }));

    console.log("Friend request sent:", data);
  } catch (error) {
    console.error("Error sending friend request:", error);
  }
};


const [friendName,setFriendName]=useState("");
const [friendDp,setFriendDp]=useState("");
const [friendEmail,setFriendEmail]=useState("");
const [friendPhone,setFriendPhone]=useState("");
const [friendAbout,setFriendAbout]=useState("");
const friendProfileView = (userId) => {
  
  const friend = users.find((user) => user._id === userId);
  if (friend) {
   sessionStorage.setItem("friend", JSON.stringify(friend));
  navigate(`/${friend.username.replace(/\s+/g, '_')}/${friend._id}`);

}
  if (friend) {
    setFriendName(friend.username);
      setFriendEmail(friend.email);
      setFriendPhone(friend.phone);
      setFriendAbout(friend.about);
    setFriendDp(friend.dp);
  }
  let friendProfileOverlay = document.querySelector(".friend-profile-overlay");
  friendProfileOverlay.style.display = "flex";
};

const closeFriendProfileView =()=>{
 
  let friendProfileOverlay=document.querySelector(".friend-profile-overlay");
  friendProfileOverlay.style.display="none";
  setViewSection(1);
}



const friendImageView = (userId) =>{
   const friend = users.find((user) => user._id === userId);
  if (friend) {
   
    setFriendDp(friend.dp);
  }
  let friendProfileOverlay = document.querySelector(".friend-profile-overlay-image");
  friendProfileOverlay.style.display = "flex";
}



const closeFriendImageView = ()=>{
  let friendProfileOverlay = document.querySelector(".friend-profile-overlay-image");
  friendProfileOverlay.style.display = "none";
}






const [viewSec,setViewSec]=useState("");
useEffect(() => {
  const path = location.pathname;

  if (path.includes("/sent-request")) {
    setViewSec(2);
  } else if (path.includes("/friend-request")) {
    setViewSec(1);
  } else if (path.includes("/notification")) {
    setViewSec(3);
  } else if (path.includes("/add-friend")) {
    setViewSec(4); // or whatever value shows the default section (Add Friend)
  } else if(path=== "/connect"){
    setViewSec(5);
  }else if(path.includes("/my-friend")){
    setViewSec(0);
  }
}, [location]);



















const [viewSection,setViewSection]=useState(1);


useEffect(() => {
  let aboutNavLink = document.querySelector(".about-nav-link");
  let contactNavLink = document.querySelector(".contact-nav-link");
  let friendsNavLink = document.querySelector(".friends-nav-link");

  
  aboutNavLink?.classList.remove("friend-nav-link-color");
  contactNavLink?.classList.remove("friend-nav-link-color");
  friendsNavLink?.classList.remove("friend-nav-link-color");


  if (viewSection === 1) {
    aboutNavLink?.classList.add("friend-nav-link-color");
  } else if (viewSection === 2) {
    contactNavLink?.classList.add("friend-nav-link-color");
  } else {
    friendsNavLink?.classList.add("friend-nav-link-color");
  }
}, [viewSection]);







const [friendFriends,setFriendFriends]=useState([]);

useEffect(() => {


const fetchFriendFriends = async () => {


  try {
    const phone=friendPhone;
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
    console.log(freshContacts);
   
      setFriendFriends(freshContacts);
     
    
  } catch (error) {
    console.error("Error fetching contacts:", error);
  }
};


  fetchFriendFriends();

 
}, [friendPhone]);


const [friendCount,setFriendCount]=useState(0)

useEffect(() => {
  const countContactsByMobile = async () => {
    try {
      
      if (!friendPhone) {
        console.warn("No phone number found");
        return;
      }
             
      const res = await fetch(`${backendUrl}api/countContactsByMobile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone : friendPhone }),
      });

      if (!res.ok) throw new Error("Failed to fetch count");

      const data = await res.json();
      setFriendCount(data.count); // 
    } catch (error) {
      console.error("Error fetching count:", error);
    }
  };

  countContactsByMobile();
}, [friendPhone]);








const [dpMap, setDpMap] = useState({});
const [usernameMap, setUsernameMap] = useState({});
  const prevFilteredContacts = useRef([]);
useEffect(() => {
  // Memoize the previous filteredContacts to avoid unnecessary re-fetches

  
  const fetchDps = async () => {
    // Skip if contacts haven't changed
    if (JSON.stringify(friendFriends) === JSON.stringify(prevFilteredContacts.current)) {
      return;
    }
    prevFilteredContacts.current = friendFriends;

    const cachedDpMap = JSON.parse(localStorage.getItem("dpMap") || "{}");
    const cachedUsernameMap = JSON.parse(localStorage.getItem("usernameMap") || "{}");

    // Create maps for faster lookup
    const updatedDpMap = { ...cachedDpMap };
    const updatedUsernameMap = { ...cachedUsernameMap };
    let hasChanged = false;

    // Identify contacts that actually need updating
    const contactsToUpdate = friendFriends.filter(contact => {
      return (
        !cachedDpMap[contact.mobile] || 
        !cachedUsernameMap[contact.mobile] ||
        cachedDpMap[contact.mobile].includes("image_dp_uwfq2g.png")
      );
    });

    // Process in parallel with optimized batch size
    const BATCH_SIZE = 8; // Increased from 5 for better throughput
    const batchPromises = [];
    
    for (let i = 0; i < contactsToUpdate.length; i += BATCH_SIZE) {
      const batch = contactsToUpdate.slice(i, i + BATCH_SIZE);
      
      batchPromises.push(
        Promise.all(batch.map(async (contact) => {
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout
            
            const dpRes = await fetch(`${backendUrl}api/fetchDp`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ mobile: contact.mobile }),
              signal: controller.signal
            });
            
            clearTimeout(timeoutId);

            if (dpRes.status === 404) {
              updatedDpMap[contact.mobile] = "https://res.cloudinary.com/dnd9qzxws/image/upload/v1743764088/image_dp_uwfq2g.png";
              updatedUsernameMap[contact.mobile] = "Unknown";
              hasChanged = true;
              return;
            }

            const dpData = await dpRes.json();
            const newDp = dpData.dp || "https://res.cloudinary.com/dnd9qzxws/image/upload/v1743764088/image_dp_uwfq2g.png";
            const newUsername = dpData.username || "Unknown";

            if (cachedDpMap[contact.mobile] !== newDp || cachedUsernameMap[contact.mobile] !== newUsername) {
              updatedDpMap[contact.mobile] = newDp;
              updatedUsernameMap[contact.mobile] = newUsername;
              hasChanged = true;
            }
          } catch (error) {
            if (error.name !== 'AbortError') {
              updatedDpMap[contact.mobile] = "https://res.cloudinary.com/dnd9qzxws/image/upload/v1743764088/image_dp_uwfq2g.png";
              updatedUsernameMap[contact.mobile] = "Unknown";
              hasChanged = true;
            }
          }
        }))
      );
    }

    // Wait for all batches to complete
    await Promise.all(batchPromises);

    // Only update state and storage if changes occurred
    if (hasChanged) {
      setDpMap(updatedDpMap);
      setUsernameMap(updatedUsernameMap);
      localStorage.setItem("dpMap", JSON.stringify(updatedDpMap));
      localStorage.setItem("aboutMap", JSON.stringify(updatedUsernameMap));
    } else {
      setDpMap(cachedDpMap);
      setUsernameMap(cachedUsernameMap);
    }
  };

  if (friendFriends.length > 0) {
    fetchDps();
  }
}, [friendFriends]);















  const scrollRef = useRef(null);
  const { setShowNavbar } = useScrollContext();
  const lastScrollTop = useRef(0);

  useEffect(() => {
    const scrollableDiv = scrollRef.current;

    const handleScroll = () => {
      const currentScrollTop = scrollableDiv.scrollTop;

      if (currentScrollTop > lastScrollTop.current) {
        setShowNavbar(false); // Scroll down → hide
      } else {
        setShowNavbar(true);  // Scroll up → show
      }

      lastScrollTop.current = currentScrollTop <= 0 ? 0 : currentScrollTop;
    };

    scrollableDiv?.addEventListener('scroll', handleScroll);
    return () => scrollableDiv?.removeEventListener('scroll', handleScroll);
  }, [setShowNavbar]);



 const isActive = (path) => {
    return location.pathname.includes(path); // or === if you want exact match
  };



useEffect(() => {
  socket.on("newFriendRequest", (data) => {
  

    // add to phone numbers
    setSenderPhones((prev) => [...prev, data.sender]);
 
   
  });

  return () => {
    socket.off("newFriendRequest");
  };
}, []);

  const [senderPhones, setSenderPhones] = useState([]);
  const [senders, setSenders] = useState([]);

  useEffect(() => {
    const myPhone = sessionStorage.getItem("phone");

    const fetchReceivedRequest = async () => {
      try {
        const res = await fetch(`${backendUrl}api/receivedrequestuser`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ receiver: myPhone }),
        });

        if (!res.ok) throw new Error("Failed to fetch friend requests");
        
        const data = await res.json();
        
        const phoneNumbers = data.map((friend) => friend.sender); // extract sender phones
        setSenderPhones(phoneNumbers);
      } catch (error) {
        console.error("Error fetching friend requests:", error);
      }
    };

    fetchReceivedRequest();
  }, []);

  useEffect(() => {
    if (senderPhones.length === 0) return; // Don't fetch if no senders

    const fetchReceivedUsers = async () => {
        setLoading(true);
      try {
        const res = await fetch(`${backendUrl}api/sentrequestalluser`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: senderPhones }), // array of phones
        });

        if (!res.ok) throw new Error("Failed to fetch user data");

        const data = await res.json();
        setSenders(data); // Should be an array of user objects
        console.log("Users who sent you requests:", data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }finally {
      setLoading(false); //  stop loading
    }
    };

    fetchReceivedUsers();
  }, [senderPhones]);


const AcceptRequest = async (senderPhone) => {
  try {
    const receiver = sessionStorage.getItem("phone");

    const res = await fetch(`${backendUrl}api/acceptrequest`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sender: senderPhone, receiver }),
    });

    if (!res.ok) throw new Error("Failed to accept request");

    const result = await res.json();

    // Remove from request list immediately
    setSenders((prev) => prev.filter((user) => user.phone !== senderPhone));
    setSenderPhones((prev) => prev.filter((phone) => phone !== senderPhone));

    console.log("Request accepted:", result);


      await fetch(`${backendUrl}api/markRequestAsRead`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ receiver }),
    });








  } catch (error) {
    console.error("Error accepting request:", error);
  }
};


const CancelRequest = async (senderPhone) => {
  try {
    const receiver = sessionStorage.getItem("phone");

    const res = await fetch(`${backendUrl}api/cancelrequest`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sender: senderPhone, receiver }),
    });

    if (!res.ok) throw new Error("Failed to cancel request");

    // Remove from request list immediately
    setSenders((prev) => prev.filter((user) => user.phone !== senderPhone));
    setSenderPhones((prev) => prev.filter((phone) => phone !== senderPhone));

    console.log("Request canceled");
  } catch (error) {
    console.error("Error canceling request:", error);
  }
};











// const [searchValue,setSearchValue]=useState("");
 const requests = senders.filter((users) =>
    users.username.toLowerCase().includes(searchValue.toLowerCase())
  );

























    return(
         <SwipeNavigator>
          <div className='friend-container'>
                       



                       <div className='friend-profile-overlay'>
                        
                           <div className='friend-profile-view'>
                             <RxCross2 className='friend-overlay-cross' onClick={closeFriendProfileView}/>
                                   <div className='friend-profile-content'>
                                        <div className='friend-profile-top'>
                                           <img src={`https://res.cloudinary.com/dnd9qzxws/image/upload/v1743761726/${friendDp}`} onClick={() => friendImageView(users._id)}/>
                                           <div className='friend-p-top-content'>
                                              <h2>{friendName}</h2>
                                              <p onClick={()=>setViewSection(3)}>{friendCount} friends</p>

                                          <button className='mobile-add-friend-btn'><IoPersonAdd />Add friend</button>
                                           </div>
                                           <button className='desktop-add-friend-btn'><IoPersonAdd />Add friend</button>
                                           
                                        </div>
                                        <div className='friend-profile-center'>
                                             <nav>
                                                 <a href="#friend-profile-about" onClick={()=>setViewSection(1)} className='about-nav-link'>About</a>
                                                 <a href="#friend-profile-contact" onClick={()=>setViewSection(2)} className='contact-nav-link'>Contact Details</a>
                                                 <a href="#friend-profile-friends" onClick={()=>setViewSection(3)} className='friends-nav-link'>Friends</a>
                                                
                                             </nav>
                                        </div>
                                        <div className='friend-profile-bottom'>
                                               <div className='fpb-container'>
                                                     {
                                                        viewSection===1 ?(
                                                              <section className='friend-profile-about' id="friend-profile-about">
                                                               <p><FaCircleInfo />{friendAbout}</p>
                                                               </section>
                                                        ) : viewSection === 2 ? (
                                                              <section className='friend-profile-contact' id="friend-profile-contact">
                                                      <section className='friend-profile-contact-container'>
                                                           <p><MdEmail />{friendEmail}</p>
                                                      </section>
                                                       <section className='friend-profile-contact-container'>
                                                            <p><IoIosCall />+91 {friendPhone}</p>
                                                      </section>
                                                     
                                                    </section>
                                                        ) : (
                                                             <section className='friend-profile-friends' id="friend-profile-friends">
                                                             {
                                                             friendFriends.map((friend)=>(
                                                             <section className='friend-profile-contact-container'>
                                                                <img
                                                         src={`https://res.cloudinary.com/dnd9qzxws/image/upload/v1743761726/${dpMap[friend.mobile]}`}
                                                         className='friend-profile-friends-dp'
                                                       
                                                         onError={(e) => {
                                                         e.target.src = "https://res.cloudinary.com/dnd9qzxws/image/upload/v1743764088/image_dp_uwfq2g.png";
                                                       }}
                                                       />
                                                               <p key={friend._id}>{usernameMap[friend.mobile] || "No Name"}</p>
                                                             </section>
                                                            
                                                            
                                                              
                                                             ))
                                                            }
                                                            </section>
                                                        )
                                                     }
                                                    
                                                    
                                                    







                                               </div>
                                        </div>

                                   </div>



                           </div>
                       </div>




                     

























            <div className='left-friend'>
              <nav>
                <h2>Friends</h2>
                <FaChevronLeft className='left-friend-arrow' onClick={hideLeftFriend}/>
              </nav>
             
              <div className='left-friend-content'>
                     <Link to="my-friend"  className={`sent-link ${isActive('my-friend') ? 'active-link' : ''}`}>
                      <p className='frl'><FaUserFriends className='fri'/> My Friend <FaChevronRight className='frla'/></p>
                      
                       
                     </Link>




                     <Link to="friend-request"  className={`sent-link ${isActive('friend-request') ? 'active-link' : ''}`}>
                     
                         <p className='frl'> <RiUserReceived2Fill className='fri'/> 
                         {count > 0 && location.pathname !== "/connect/friend-request" && (
                          <span className="count-badge">{count}</span>
                             )}
                         Friend request 
                          

                         <FaChevronRight className='frla'/></p>
                     </Link>


                     <Link to="add-friend" className={`sent-link ${isActive('add-friend') ? 'active-link' : ''}`}>
                      <p className='frl'><IoPersonAddSharp className='fri'/> Add friend <FaChevronRight className='frla'/></p>
                      
                       
                     </Link>
                      <Link to="sent-request"  className={`sent-link ${isActive('sent-request') ? 'active-link' : ''}`}>
                      <p className='frl'><MdChildFriendly className='fri'/> Sent request <FaChevronRight className='frla'/></p>
                      
                      
                     </Link>
                      <Link to="notification"  className={`sent-link ${isActive('notification') ? 'active-link' : ''}`}>
                      <p className='frl'><MdNotifications className='fri'/>
                       {/* {count > 0 && location.pathname !== "/connect/notification" && (
                          <span className="count-badge">{count}</span>
                             )} */}
                      
                      
                       Notification <FaChevronRight className='frla'/></p>
                      
                       
                     </Link>
              </div>
            </div>

            <div className='right-friend' ref={scrollRef}>
             
                <div className='friend-mobile-topbar'>
                  <Link to="my-friend" className='top-mob-link'><FaUserFriends  className={`fmt ${isActive('my-friend') ? 'active-link-mob' : ''}`}/></Link>
                  <Link to="friend-request" className='friedn-request-mobile-link'><RiUserReceived2Fill  className={`fmt ${isActive('friend-request') ? 'active-link-mob' : ''}`}/>
                  {count > 0 && location.pathname !== "/connect/friend-request" && (
                          <span className="count-badge-mobile">{count}</span>
                             )}
                  
                  </Link>
                  <Link to="add-friend" className='top-mob-link'><IoPersonAddSharp  className={`fmt ${isActive('add-friend') ? 'active-link-mob' : ''}`}/></Link>
                 <Link to="sent-request" className='top-mob-link'> <MdChildFriendly  className={`fmt ${isActive('sent-request') ? 'active-link-mob' : ''}`}/></Link>
                  <Link to="notification" className='top-mob-link'><MdNotifications  className={`fmt ${isActive('notification') ? 'active-link-mob' : ''}`}/></Link>
                </div>

                      {location.pathname === "/connect" && (
  <div className='right-nav-friend-mobile'>
    <input
      type="text"
      placeholder="Search here"
      value={searchValue}
      onChange={(e) => setSearchValue(e.target.value)}
    />
  </div>
)}


             

               {
                viewSec===0 ?(
                  <div className='right-friend-to' id="right-friend-top">
                  <Outlet />
                  </div>
                ):
                viewSec===1 ?(
                   <div className='right-friend-to' id="right-friend-top">
                  <Outlet />
                  </div>
                ) : viewSec===2 ?(
                     <div className='right-friend-to' id="right-friend-top">
                   <Outlet />
                  </div>
                ) : viewSec===3 ? (
                     <div className='right-friend-to' id="right-friend-top">
                   <Outlet />
                  </div>
                ) : viewSec===4 ?(
                      <div className='right-friend-botto' id="right-friend-top">
                   <Outlet />
                  </div>
                ):(
                    <div>
                       <div className='right-nav-friend'>
                 <FaChevronRight className='right-friend-arrow' onClick={openLeftFriend}/>
                 <h2 id="r-n-f">Friends</h2>
                 
                  <input type="text" placeholder='Search here' value={searchValue} onChange={(e)=>{setSearchValue(e.target.value)}}/>
              </div>






            {location.pathname === "/connect" && (
  <>
    <h1 className="connect-request">Requests</h1>

    {
      loading ? (
        <div className="spinner-wrapper">
          <div className="fb-spinner"></div>
        </div>
      ) : senders.length === 0 ? (
        <div className="right-friend-bottom" id="right-friend-top">
          <p>No request received</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="right-friend-bottom" id="right-friend-top">
          <p>Not found</p>
        </div>
      ) : (
        <div className="right-friend-bottom" id="right-friend-top">
          {requests.map((user) => (
            <div className="all-users" key={user._id}>
              <div
                className="card-img"
                onClick={() => friendProfileView(user._id)}
              >
                <img
                  src={`https://res.cloudinary.com/dnd9qzxws/image/upload/v1743761726/${user.dp}`}
                  alt={user.username}
                />
              </div>

              <div className="card-content">
                <h4>{user.username}</h4>

                <button
                  className="add-friend-accept"
                  onClick={() => AcceptRequest(user.phone)}
                >
                  Accept
                </button>

                <button className="add-remove"
                 onClick={() => CancelRequest(user.phone)}
                >Cancel</button>
              </div>
            </div>
          ))}
        </div>
      )
    }

    <h1 className="connect-request">Add Friend</h1>

    {
      loading ? (
        <div className="spinner-wrapper">
          <div className="fb-spinner"></div>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="right-friend-bottom" id="right-friend-top">
          <p>Not found</p>
        </div>
      ) : (
        <div className="right-friend-bottom" id="right-friend-bottom">
          {filteredUsers.map((user) => (
            <div className="all-users" key={user._id}>
              <div
                className="card-img"
                onClick={() => friendProfileView(user._id)}
              >
                <img
                  src={`https://res.cloudinary.com/dnd9qzxws/image/upload/v1743761726/${user.dp}`}
                  alt={user.username}
                />
              </div>

              <div className="card-content">
                <h4>{user.username}</h4>

                <button
                  className={`add-friend ${
                    friendRequests[user._id] === "Sent Request"
                      ? "sent-request"
                      : ""
                  }`}
                  onClick={() => friendRequestSend(user._id)}
                >
                  {friendRequests[user._id] || "Add Friend"}
                </button>

                <button className="add-remove">Remove</button>
              </div>
            </div>
          ))}
        </div>
      )
    }
  </>
)}


             
                      </div>
                )      
               }
              


            </div>


          <div className='friend-profile-overlay-image'>
                           <RxCross2 className='overlay-image-cross' onClick={closeFriendImageView}/>
                              <img src={`https://res.cloudinary.com/dnd9qzxws/image/upload/v1743761726/${friendDp}`} />
                           
                        </div>




          </div>
     
    </SwipeNavigator>
    )
}
export default Connect;