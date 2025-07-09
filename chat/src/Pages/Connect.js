import SwipeNavigator from './SwipeNavigator';
import { IoPeople } from "react-icons/io5";
import { IoPersonAddSharp } from "react-icons/io5";
import { FaChevronRight } from "react-icons/fa";
import { useState , useEffect ,useRef} from 'react';
import { FaChevronLeft } from "react-icons/fa6";
import { RxCross2 } from "react-icons/rx";
import { IoPersonAdd } from "react-icons/io5";
import Cookies from "js-cookie";
const backendUrl = process.env.REACT_APP_BACKEND_URL; 
const Connect = ()=>{

  const [users,setUsers]=useState([]);

useEffect(() => {
  const fetchAllUsers = async () => {
    try {
     
      const res = await fetch(`${backendUrl}api/fetchallusers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      if (!res.ok) throw new Error("Failed to fetch your profile");

      const data = await res.json(); 
    setUsers(data);
    } catch (error) {
      console.error("Error fetching your profile:", error);
    }
  };

  fetchAllUsers();


},[]);




const friendRequest = ()=>{
 let rightFriendTop=document.getElementById("right-friend-top");
  rightFriendTop.style.display="block";
 let rightFriendBottom=document.getElementById("right-friend-bottom");
  rightFriendBottom.classList.add("friend-display");
}

const addFriend = ()=>{
 let rightFriendTop=document.getElementById("right-friend-top");
  rightFriendTop.style.display="none";
 let rightFriendBottom=document.getElementById("right-friend-bottom");
  rightFriendBottom.classList.remove("friend-display");
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


const friendRequestSend = (userId) => {
  setFriendRequests((prev) => ({
    ...prev,
    [userId]: prev[userId] === "Sent Request" ? "Add Friend" : "Sent Request" 
  }));
};

const [friendName,setFriendName]=useState("");
const [friendDp,setFriendDp]=useState("");
const [friendEmail,setFriendEmail]=useState("");
const [friendPhone,setFriendPhone]=useState("");
const [friendAbout,setFriendAbout]=useState("");
const friendProfileView = (userId) => {
  const friend = users.find((user) => user._id === userId);
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
    const cachedUsernameMap = JSON.parse(localStorage.getItem("aboutMap") || "{}");

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
                                              <p>90 friends</p>
                                           </div>
                                           <button><IoPersonAdd />Add friend</button>
                                           
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
                                                               <p>{friendAbout}</p>
                                                               </section>
                                                        ) : viewSection === 2 ? (
                                                              <section className='friend-profile-contact' id="friend-profile-contact">
                                                      <section className='friend-profile-contact-container'>
                                                           <p>{friendEmail}</p>
                                                      </section>
                                                       <section className='friend-profile-contact-container'>
                                                            <p>+91 {friendPhone}</p>
                                                      </section>
                                                     
                                                    </section>
                                                        ) : (
                                                             <section className='friend-profile-friends' id="friend-profile-friends">
                                                             {
                                                             friendFriends.map((friend)=>(
                                                             <section className='friend-profile-contact-container'>
                                                                <img
                                                         src={`https://res.cloudinary.com/dnd9qzxws/image/upload/v1743761726/${dpMap[friend.mobile]}`}
                                                         id="dp-default"
                                                       
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




                      <div className='friend-profile-overlay-image'>
                           <RxCross2 className='overlay-image-cross' onClick={closeFriendImageView}/>
                              <img src={`https://res.cloudinary.com/dnd9qzxws/image/upload/v1743761726/${friendDp}`} />
                           
                        </div>

























            <div className='left-friend'>
              <nav>
                <h2>Friends</h2>
                <FaChevronLeft className='left-friend-arrow' onClick={hideLeftFriend}/>
              </nav>
             
              <div className='left-friend-content'>
                     <div className='lfc1' onClick={friendRequest}>
                     
                         <p className='frl'> <IoPeople className='fri'/> Friend request <FaChevronRight className='frla'/></p>
                     </div>
                     <div className='lfc1' onClick={addFriend}>
                      <p className='frl'><IoPersonAddSharp className='fri'/> Add friend <FaChevronRight className='frla'/></p>
                      
                       
                     </div>
              </div>
            </div>

            <div className='right-friend'>
              <div className='right-nav-friend'>
                 <FaChevronRight className='right-friend-arrow' onClick={openLeftFriend}/>
                 <h2 id="r-n-f">Friends</h2>
                  <input type="text" placeholder='Search here' value={searchValue} onChange={(e)=>{setSearchValue(e.target.value)}}/>
              </div>
              <div className='right-friend-top' id="right-friend-top">
                <p>No friend request received yet...</p>
              </div>
              <div className='right-friend-bottom' id="right-friend-bottom">
                {
                 filteredUsers.map((users)=>(
                  <div className='all-users'  key={users._id}>
                      <div className='card-img' onClick={() => friendProfileView(users._id)}>
                         <img src={`https://res.cloudinary.com/dnd9qzxws/image/upload/v1743761726/${users.dp}`} />

                      </div>
                      <div className='card-content'>
                             <h4>{users.username}</h4>
                             <button  className={`add-friend ${friendRequests[users._id] === "Sent Request" ? "sent-request" : ""}`}  onClick={() => friendRequestSend(users._id)}>{friendRequests[users._id] || "Add Friend"}</button>
                             <button className='add-remove'>Remove</button>
                        </div>
                      
                  </div>
                 )
                )
              }
              </div>
            </div>
          </div>
     
    </SwipeNavigator>
    )
}
export default Connect;