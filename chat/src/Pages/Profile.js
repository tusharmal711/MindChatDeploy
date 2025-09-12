import SwipeNavigator from './SwipeNavigator';
import { useScrollContext } from '../ScrollContext.js';
import { useState , useEffect , useRef } from "react";
import { FaPlus } from "react-icons/fa6";
import { IoMdCamera } from "react-icons/io";
import { RxCross2 } from "react-icons/rx";
import { useNavigate ,useParams , useLocation , Outlet , Link} from "react-router-dom";
const backendUrl = process.env.REACT_APP_BACKEND_URL; 
const Profile=()=>{
     const navigate=useNavigate();
     const location=useLocation();
     const { id } = useParams();
       const [friendName,setFriendName]=useState("");
       const [friendDp,setFriendDp]=useState("");
       const [friendEmail,setFriendEmail]=useState("");
       const [friendPhone,setFriendPhone]=useState("");
       const [friendAbout,setFriendAbout]=useState("");

const [view, setView] = useState(false);
  
  const scrollRef = useRef(null);
    const { setShowNavbar } = useScrollContext();
    const lastScrollTop = useRef(0);
  


// hide/show navbar when photo view is toggled
useEffect(() => {
  if (!view) {
    setShowNavbar(true); // hide navbar when viewing photo
  }else{
    setShowNavbar(false);
  }
}, [view, setShowNavbar]);










    useEffect(() => {
  const handleScroll = () => {
    const currentScrollTop = window.scrollY;

    if (currentScrollTop > lastScrollTop.current) {
      setShowNavbar(false); // scrolling down → hide
    } else {
      
      setShowNavbar(true);  // scrolling up → show
    }

    lastScrollTop.current = currentScrollTop <= 0 ? 0 : currentScrollTop;
  };

  window.addEventListener("scroll", handleScroll);
  return () => window.removeEventListener("scroll", handleScroll);
}, [setShowNavbar]);












useEffect(() => {
  const storedFriend = sessionStorage.getItem("friend");

  if (storedFriend) {
    const friendData = JSON.parse(storedFriend);

    // Update state with new profile data
    setFriendName(friendData.username);
    setFriendDp(friendData.dp);
    setFriendEmail(friendData.email);
    setFriendPhone(friendData.phone);
    setFriendAbout(friendData.about);
  }
},[]);



   const redirectAnotherProfile = (userId) => {
   setViewSection(1);
  const friend = friendFriends.find((friend) => friend._id === userId);
  
  if (friend) {
    const fullUsername = usernameMap[friend.mobile] || "Unknown";
    const fullMobile=friendFriendPhone[friend.mobile];
    const fullDp=dpMap[friend.mobile];
    // Store full data in sessionStorage
    const friendWithUsername = { ...friend, username: fullUsername };
    
 setFriendName(fullUsername);
      setFriendEmail(friend.email);
      setFriendPhone(fullMobile);
      setFriendAbout(friend.about);
      setFriendDp(fullDp);
    // Navigate to new profile route
    navigate(`/${fullUsername.replace(/\s+/g, '_')}/${friend._id}`);
     
    
  }
};



const [friendCount,setFriendCount]=useState(0)
const [friendCountMap, setFriendCountMap] = useState({});
 const countContactsByMobile = async (phone) => {
    try {
      if (!phone) {
        console.warn("No phone number provided");
        return 0;
      }
      const res = await fetch(`${backendUrl}api/countContactsByMobile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      if (!res.ok) throw new Error("Failed to fetch count");
      const data = await res.json();
      return data.count || 0;
    } catch (error) {
      console.error("Error fetching count:", error);
      return 0;
    }
  };

  useEffect(() => {
    const fetchCount = async () => {
      const count = await countContactsByMobile(friendPhone);
      setFriendCount(count);
    };
    if (friendPhone) {
      fetchCount();
    }
  }, [friendPhone]);





const [viewSection,setViewSection]=useState(1);

useEffect(() => {
  let profilePosts = document.querySelector(".profile-posts-link");
  let profileAbout = document.querySelector(".profile-about-link");
  let profileFriends = document.querySelector(".profile-friends-link");
let profilePhotos = document.querySelector(".profile-photos-link");
  let profileVideos = document.querySelector(".profile-videos-link");
  let profileReels = document.querySelector(".profile-reels-link");
  profilePosts?.classList.remove("friend-nav-link-color");
  profileAbout?.classList.remove("friend-nav-link-color");
  profileFriends?.classList.remove("friend-nav-link-color");
 profilePhotos?.classList.remove("friend-nav-link-color");
  profileVideos?.classList.remove("friend-nav-link-color");
  profileReels?.classList.remove("friend-nav-link-color");

  if (viewSection === 1) {
      profilePosts?.classList.add("friend-nav-link-color");
  } else if (viewSection === 2) {
    profileAbout?.classList.add("friend-nav-link-color");
  } else if(viewSection===3){
    profileFriends?.classList.add("friend-nav-link-color");
  }else if (viewSection===4){
 profilePhotos?.classList.add("friend-nav-link-color");
  }else if(viewSection===5){
 profileVideos?.classList.add("friend-nav-link-color");
  }else{
 profileReels?.classList.add("friend-nav-link-color");
  }
}, [viewSection]);






useEffect(() => {
  const path = location.pathname;

  if (path.includes("/about")) {
    setViewSection(2);
  } else if (path.includes("/friends")) {
    setViewSection(3);
  } else if (path.includes("/photos")) {
    setViewSection(4);
  } else if (path.includes("/videos")) {
    setViewSection(5);
  } else if (path.includes("/reels")) {
    setViewSection(6);
  } else {
    setViewSection(1); // default
  }
}, [location]);













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
const [friendFriendPhone, setFriendFriendPhone] = useState({});
const prevFilteredContacts = useRef([]);

useEffect(() => {
  const fetchDps = async () => {
    if (JSON.stringify(friendFriends) === JSON.stringify(prevFilteredContacts.current)) {
      return;
    }
    prevFilteredContacts.current = friendFriends;

    const cachedDpMap = JSON.parse(localStorage.getItem("dpMap") || "{}");
    const cachedUsernameMap = JSON.parse(localStorage.getItem("usernameMap") || "{}");
    const cachedFriendPhoneMap = JSON.parse(localStorage.getItem("friendFriendPhoneMap") || "{}");

    const updatedDpMap = { ...cachedDpMap };
    const updatedUsernameMap = { ...cachedUsernameMap };
    const updatedFriendPhoneMap = { ...cachedFriendPhoneMap };
    let hasChanged = false;

    const contactsToUpdate = friendFriends.filter(contact => {
      return (
        !cachedDpMap[contact.mobile] ||
        !cachedUsernameMap[contact.mobile] ||
        cachedDpMap[contact.mobile].includes("image_dp_uwfq2g.png")
      );
    });

    const BATCH_SIZE = 8;
    const batchPromises = [];

    for (let i = 0; i < contactsToUpdate.length; i += BATCH_SIZE) {
      const batch = contactsToUpdate.slice(i, i + BATCH_SIZE);

      batchPromises.push(
        Promise.all(
          batch.map(async (contact) => {
            try {
              const controller = new AbortController();
              const timeoutId = setTimeout(() => controller.abort(), 5000);

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
                updatedFriendPhoneMap[contact.mobile] = contact.mobile;
                hasChanged = true;
                return;
              }

              const dpData = await dpRes.json();
              const newDp = dpData.dp || "https://res.cloudinary.com/dnd9qzxws/image/upload/v1743764088/image_dp_uwfq2g.png";
              const newUsername = dpData.username || "Unknown";
              const newPhone = dpData.phone || contact.mobile;

              if (
                cachedDpMap[contact.mobile] !== newDp ||
                cachedUsernameMap[contact.mobile] !== newUsername ||
                cachedFriendPhoneMap[contact.mobile] !== newPhone
              ) {
                updatedDpMap[contact.mobile] = newDp;
                updatedUsernameMap[contact.mobile] = newUsername;
                updatedFriendPhoneMap[contact.mobile] = newPhone;
                hasChanged = true;
              }
            } catch (error) {
              if (error.name !== "AbortError") {
                updatedDpMap[contact.mobile] = "https://res.cloudinary.com/dnd9qzxws/image/upload/v1743764088/image_dp_uwfq2g.png";
                updatedUsernameMap[contact.mobile] = "Unknown";
                updatedFriendPhoneMap[contact.mobile] = contact.mobile;
                hasChanged = true;
              }
            }
          })
        )
      );
    }

    await Promise.all(batchPromises);

    if (hasChanged) {
      setDpMap(updatedDpMap);
      setUsernameMap(updatedUsernameMap);
      setFriendFriendPhone(updatedFriendPhoneMap);
      localStorage.setItem("dpMap", JSON.stringify(updatedDpMap));
      localStorage.setItem("usernameMap", JSON.stringify(updatedUsernameMap));
      localStorage.setItem("friendFriendPhoneMap", JSON.stringify(updatedFriendPhoneMap));
    } else {
      setDpMap(cachedDpMap);
      setUsernameMap(cachedUsernameMap);
      setFriendFriendPhone(cachedFriendPhoneMap);
    }
  };

  if (friendFriends.length > 0) {
    fetchDps();
  }
}, [friendFriends]);


 useEffect(() => {
    const fetchFriendCounts = async () => {
      const newCountMap = {};
      await Promise.all(
        friendFriends.map(async (friend) => {
          const count = await countContactsByMobile(friend.mobile);
          newCountMap[friend.mobile] = count;
        })
      );
      setFriendCountMap(newCountMap);
    };
    if (friendFriends.length > 0) fetchFriendCounts();
  }, [friendFriends]);




const [selectedPhoto, setSelectedPhoto] = useState("");



    return(
      
        <div className="profile-container"  ref={scrollRef}  style={{ position: view ? "fixed" : "" }}>



           {view && (
  <div className="photo-overlay">
    <div className="photo-nav">
     
      <div className="right-profile-nav" onClick={() => setView(false)}>
        <RxCross2 className="right-cross"/>
      </div>
    </div>

    <div className="view-photo">
      <img src={selectedPhoto} alt="Profile" />
    </div>
  </div>
)}

           
           
          

            <div className="profile-main">
                    <div className="profile-top">
                      
                        {/* <button><IoMdCamera className="cover-photo-btn"/> Edit cover photo</button> */}
                    </div>
                    <div className="profile-middle">
                        <div className="profile-middle-first">
                           
                               
                          
                          <img src={`https://res.cloudinary.com/dnd9qzxws/image/upload/v1743761726/${friendDp}`} 
                           onClick={() => {
                       setSelectedPhoto(`https://res.cloudinary.com/dnd9qzxws/image/upload/v1743761726/${friendDp}`);
                        setView(true);
                          }}
                          
                          
                          
                          
                          />
                           
                            
                          
                        </div>
                        <div className="profile-middle-second">
                               <h1>{friendName}</h1>
                               <p onClick={()=>setViewSection(3)}>{friendCount} friends</p>
                                <div className="profile-middle-third">
                            <button className='add-fri-btn'><FaPlus />Add friend</button>
                           
                        </div>
                        </div>
                       
                        
                        
                        
                    </div>
                    <div className="profile-middle2">
  <div className="profile-posts-link">
    <Link to="posts" onClick={() => setViewSection(1)}>Posts</Link>
  </div>
  <div className="profile-about-link">
    <Link to="about" onClick={() => setViewSection(2)}>About</Link>
  </div>
  <div className="profile-friends-link">
    <Link to="friends" onClick={() => setViewSection(3)}>Friends</Link>
  </div>
  <div className="profile-photos-link">
    <Link to="photos" onClick={() => setViewSection(4)}>Photos</Link>
  </div>
  
  <div className="profile-reels-link">
    <Link to="reels" onClick={() => setViewSection(6)}>Reels</Link>
  </div>
</div>

                    <div className="profile-end">

                      {
                        viewSection===1 ? (
                            <div className="profile-posts"  id="profile-posts">
                                <nav>
                                 <h2>Posts</h2>
                                </nav>
                              
                                 
                        </div>
                        ) : viewSection===2 ?(
                            <div className="profile-about"  id="profile-about">
                             <nav>
                           
                             <Outlet />
                             </nav>
                              
                         </div>
                        ) : viewSection===3 ?(
                               <div className="profile-friends" id="profile-friends">
                                <nav>
                                <h2>Friends</h2>
                                </nav>
                                <div className="profile-friends-friend-parent">
                                {
                                   friendFriends.map((friend)=>(
                                    <div className="profile-friends-friend" onClick={()=>redirectAnotherProfile(friend._id)}>
                                        <div className="profile-friends-friend-img">
                                            <img src={`https://res.cloudinary.com/dnd9qzxws/image/upload/v1743761726/${dpMap[friend.mobile]}`}  onError={(e) => {
    e.target.src = "https://res.cloudinary.com/dnd9qzxws/image/upload/v1743764088/image_dp_uwfq2g.png"} }
    
    
    
    onClick={(e) => {
    setSelectedPhoto(e.target.src); 
    setView(true);
  }}
    
    />
                                        </div>
                                        <div className="profile-friends-friend-username">
                                            <p>{usernameMap[friend.mobile] || "No Name"}</p>
                                            <p>{friendCountMap[friend.mobile] || 0} friends</p>
                                            </div>
                                    </div>
                                   ))
                                }
                                </div>
                                 
                               
                        </div>

                        ) : viewSection===4 ?(
                             <div className="profile-photos" id="profile-photos">
                                <nav>
                                  <h2>Photos</h2>
                                </nav>
                            
                        </div>
                       
                        ) : (
                            <div className="profile-reels" id="profile-reels">
                                <nav>
                                 <h2>Reels</h2>
                                </nav>
                            
                        </div>
                        )
                      }
                        





                        

                            
                      

                          

                        


                         






                        
                    </div>
            </div>
            
        </div>
    )
}
export default Profile;