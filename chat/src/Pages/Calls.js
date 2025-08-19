import SwipeNavigator from './SwipeNavigator';
import { useState,useEffect , useRef } from 'react';
import Cookies from "js-cookie";
import { MdCall } from "react-icons/md";
import { useNavigate } from 'react-router-dom';
import { RiVideoOnAiFill } from "react-icons/ri";
import { MdCallMade } from "react-icons/md";
import { MdAddIcCall } from "react-icons/md";
import { useScrollContext } from '../ScrollContext.js';
import io from "socket.io-client";
import { socket } from './Socket.js';

const backendUrl = process.env.REACT_APP_BACKEND_URL; 

const Calls = ()=>{



const [contacts,setContacts]=useState([]);

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


const [searchTerm,setSearchTerm]=useState("");
const [searchTerm2,setSearchTerm2]=useState("");
 const filteredContacts = contacts.filter((contacts) =>
    contacts.username.toLowerCase().includes(searchTerm.toLowerCase())
  );
 const filteredContacts2 = contacts.filter((contacts) =>
    contacts.username.toLowerCase().includes(searchTerm2.toLowerCase())
  );

const [dpMap, setDpMap] = useState({});
const [aboutMap, setAboutMap] = useState({});
  const prevFilteredContacts = useRef([]);
useEffect(() => {
  // Memoize the previous filteredContacts to avoid unnecessary re-fetches

  
  const fetchDps = async () => {
    // Skip if contacts haven't changed
    if (JSON.stringify(filteredContacts) === JSON.stringify(prevFilteredContacts.current)) {
      return;
    }
    prevFilteredContacts.current = filteredContacts;

    const cachedDpMap = JSON.parse(localStorage.getItem("dpMap") || "{}");
    const cachedAboutMap = JSON.parse(localStorage.getItem("aboutMap") || "{}");

    // Create maps for faster lookup
    const updatedDpMap = { ...cachedDpMap };
    const updatedAboutMap = { ...cachedAboutMap };
    let hasChanged = false;

    // Identify contacts that actually need updating
    const contactsToUpdate = filteredContacts.filter(contact => {
      return (
        !cachedDpMap[contact.mobile] || 
        !cachedAboutMap[contact.mobile] ||
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
              updatedAboutMap[contact.mobile] = "Hello ! I am not in MindChat !";
              hasChanged = true;
              return;
            }

            const dpData = await dpRes.json();
            const newDp = dpData.dp || "https://res.cloudinary.com/dnd9qzxws/image/upload/v1743764088/image_dp_uwfq2g.png";
            const newAbout = dpData.about || "Hey there! I am using MindChat!";

            if (cachedDpMap[contact.mobile] !== newDp || cachedAboutMap[contact.mobile] !== newAbout) {
              updatedDpMap[contact.mobile] = newDp;
              updatedAboutMap[contact.mobile] = newAbout;
              hasChanged = true;
            }
          } catch (error) {
            if (error.name !== 'AbortError') {
              updatedDpMap[contact.mobile] = "https://res.cloudinary.com/dnd9qzxws/image/upload/v1743764088/image_dp_uwfq2g.png";
              updatedAboutMap[contact.mobile] = "Hello ! I am not in MindChat !";
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
      setAboutMap(updatedAboutMap);
      localStorage.setItem("dpMap", JSON.stringify(updatedDpMap));
      localStorage.setItem("aboutMap", JSON.stringify(updatedAboutMap));
    } else {
      setDpMap(cachedDpMap);
      setAboutMap(cachedAboutMap);
    }
  };

  if (filteredContacts.length > 0) {
    fetchDps();
  }
}, [filteredContacts]);







const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const indianTime = now.toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour: 'numeric',
        minute: 'numeric',
        // second: 'numeric',
        hour12: false,
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
      setCurrentTime(indianTime);
    };

    updateTime();
    // const intervalId = setInterval(updateTime, 1000); 

    // return () => clearInterval(intervalId); 
  }, []);





 const [rating, setRating] = useState(0);         // current rating
  const [hover, setHover] = useState(null); 

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


  const navigate = useNavigate();
  const myPhone = sessionStorage.getItem("phone") || Cookies.get("mobile");
  const [callUsername,setCallUsername]=useState("");
  const handleCallClick = (phone,username,dp) => {
    if (!myPhone) {
      alert("No phone number found! Please login.");
      return;
    }

    const room = [myPhone, phone].sort().join("_");
    sessionStorage.setItem("contactPhone", phone);
    sessionStorage.setItem("myPhone", myPhone);
    sessionStorage.setItem("roomId", room);
     sessionStorage.setItem("callusername", username);
    sessionStorage.setItem("isCaller", "true"); // mark caller
    sessionStorage.setItem("contactDp", dp);
    // Join room before going to call page
    socket.emit("join_call", room);
   
    // Go to Call Page
    navigate("/call");
  };




const ringingAudioRef = useRef(null);
useEffect(() => {
  if (!socket) return;

  // Remove previous listener if any
  socket.off("ping-test");

  const handlePingTest = (callerPhone) => {
    console.log("Ping-test received:", callerPhone);
  if (ringingAudioRef.current) {
         ringingAudioRef.current.play().catch((e) => console.log(e));
         console.log("audio is ringing");
      }
    const accept = window.confirm(`Incoming call from: ${callerPhone}\nDo you want to accept?`);
    
    const callerContact = contacts.find(c => c.mobile === callerPhone);
    const callerUsername = callerContact ? callerContact.username : "Unknown";
    const callerDp = dpMap[callerPhone] || "https://res.cloudinary.com/dnd9qzxws/image/upload/v1743764088/image_dp_uwfq2g.png";
    
    if (accept) {
       ringingAudioRef.current.pause();
      ringingAudioRef.current.currentTime = 0;
      handleCallClick(callerPhone, callerUsername, callerDp);

    }else{
       ringingAudioRef.current.pause();
      ringingAudioRef.current.currentTime = 0;
      return;
    }
  };

  socket.on("ping-test", handlePingTest);

  return () => {
    socket.off("ping-test", handlePingTest); // clean up on unmount or deps change
  };
}, [socket, contacts, dpMap]);














    const [startCallPopup,setStartCallPopup]=useState(false);




    return(
        <SwipeNavigator>
          <div className='call-container'>

        
   <audio
  ref={ringingAudioRef}
  src="./Sounds/ringing-sound.mp3"
  loop
  className="ringing-tone"
/>

           



               <div className='call-left'>
                <nav> 
                   <h2>Calls</h2>
                   <input type="text" placeholder='Search calls...' value={searchTerm} onChange={(e)=>{setSearchTerm(e.target.value)}}/>
                </nav>
                  
                <div className='call-contact'>
                      {
                        filteredContacts.map((contacts)=>(
                          <div className='each-contact'>
                              <div className='each-contact-img'>
                                 <img
                                    src={`https://res.cloudinary.com/dnd9qzxws/image/upload/v1743761726/${dpMap[contacts.mobile]}`}
                                   

                                    onError={(e) => {
                                    e.target.src = "https://res.cloudinary.com/dnd9qzxws/image/upload/v1743764088/image_dp_uwfq2g.png";
                                  }}/>
                              </div>
                              <div className='each-contact-text'>
                                {contacts.username}
                                
                                </div>
                                <div className='each-contact-icon'>
                                  <MdCall 
                                  onClick={() => handleCallClick(
                                    contacts.mobile,
                                    contacts.username,
                                    dpMap[contacts.mobile] || "https://res.cloudinary.com/dnd9qzxws/image/upload/v1743764088/image_dp_uwfq2g.png"
                                  )}
                                />

                                  <RiVideoOnAiFill />
                                </div>
                              
                          </div>
                        ))
                      }
                </div>







                   
               </div>






               <div className='call-center'>
                  <nav> 
                   <h2>Recent Calls</h2>
                   <input type="text" placeholder='Search calls...' value={searchTerm2} onChange={(e)=>{setSearchTerm2(e.target.value)}}/>
                </nav>
                  
                <div className='call-contact' ref={scrollRef}>
                      {
                        filteredContacts2.map((contacts)=>(
                          <div className='each-contact'>
                              <div className='each-contact-img'>
                                 <img
                                    src={`https://res.cloudinary.com/dnd9qzxws/image/upload/v1743761726/${dpMap[contacts.mobile]}`}
                                   

                                    onError={(e) => {
                                    e.target.src = "https://res.cloudinary.com/dnd9qzxws/image/upload/v1743764088/image_dp_uwfq2g.png";
                                  }}/>
                              </div>
                              <div className='each-contact-text'>
                                {contacts.username}
                                <p><MdCallMade className='outgoing-call'/>{currentTime}</p>
                                </div>
                                <div className='each-contact-icon'>
                                   <MdCall 
                                  onClick={() => handleCallClick(
                                    contacts.mobile,
                                    contacts.username,
                                    dpMap[contacts.mobile] || "https://res.cloudinary.com/dnd9qzxws/image/upload/v1743764088/image_dp_uwfq2g.png"
                                  )}
                                />
                                  {/* <RiVideoOnAiFill /> */}
                                </div>
                              
                          </div>
                        ))
                      }
                </div>
               </div>






               <div className='call-right'>
                        <MdAddIcCall className='call-icon-design'/>
                      <h3>Call Now</h3>
                      <p>Give us rating of our call service</p>
                      <p className='star-rating'>
                        {[...Array(5)].map((_, index) => {
        const currentRating = index + 1;

        return (
          <label key={index}>
            <input
              type="radio" className='radio-rating'
              name="rating"
              value={currentRating}
              onClick={() => setRating(currentRating)}
            />
            <span
              className="star"
              style={{
                color:
                  currentRating <= (hover || rating) ? '#ffc107' : '#d4d4d4',
              }}
              onMouseEnter={() => setHover(currentRating)}
              onMouseLeave={() => setHover(null)}
            >
              ★
            </span>
          </label>
        );
      })}


</p>


    <button>Submit</button>






               </div>
          </div>
     
    </SwipeNavigator>
       
    )
}
export default Calls;