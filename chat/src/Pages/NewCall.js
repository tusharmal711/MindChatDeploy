import SwipeNavigator from './SwipeNavigator';
import { useState,useEffect , useRef } from 'react';
import Cookies from "js-cookie";
import { MdCall } from "react-icons/md";
import { useNavigate } from 'react-router-dom';
import { RiVideoOnAiFill } from "react-icons/ri";
import { MdCallMade } from "react-icons/md";
import { MdAddIcCall } from "react-icons/md";
import { useScrollContext } from '../ScrollContext.js';
import { MdCallReceived } from "react-icons/md";
import io from "socket.io-client";
import TimeAgo from "./TimeAgo.js";
import { FaAnglesLeft } from "react-icons/fa6";
import { socket } from './Socket.js';

const backendUrl = process.env.REACT_APP_BACKEND_URL; 



const NewCall=()=>{
    const navigate=useNavigate();
    const [contacts,setContacts]=useState([]);

const navscrollRef = useRef(null);
  const { setShowNavbar } = useScrollContext();
  const lastScrollTop = useRef(0);


  useEffect(() => {
    const scrollableDiv = navscrollRef.current;

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
 const filteredContacts = contacts.filter((contacts) =>
    contacts.username.toLowerCase().includes(searchTerm.toLowerCase())
  );




const [dpMap, setDpMap] = useState({});
const [aboutMap, setAboutMap] = useState({});
  const prevFilteredContacts = useRef([]);

useEffect(() => {
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



   const myPhone = sessionStorage.getItem("phone") || Cookies.get("mobile");
  const handleCallClick = async(phone,username,dp) => {
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
    const callerDp = dpMap[phone] || "https://res.cloudinary.com/dnd9qzxws/image/upload/v1743764088/image_dp_uwfq2g.png";
    console.log(callerDp);
    sessionStorage.setItem("contactDp",callerDp)
    
    // Go to Call Page
    navigate("/call");



        try {
      
      const response = await fetch(`${backendUrl}api/callList`,{
         method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({caller : myPhone , callee : phone , time : new Date().toISOString() }),
      });

      if (response.status === 201) {
       console.log("call-saved");
      }
    } catch (error) {
     console.log("call-not-saved");
    }


  };


return(
 <SwipeNavigator>
          <div className='call-container'>
                  

            <div className='new-call2' onClick={()=>navigate("/calls")}>
            <FaAnglesLeft className='new-call-icon2'/>
             </div>






               <div className='new-call-left'>
                <nav> 
                   <h2>Calls</h2>
                   <input type="text" placeholder='Search calls...' value={searchTerm} onChange={(e)=>{setSearchTerm(e.target.value)}}/>
                </nav>
                  
                <div className='call-contact' ref={navscrollRef}>
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
                                {contacts.username}<br />
                                <span className='call-contact-phone2'>+91 {contacts.mobile}</span>
                                </div>
                                <div className='each-contact-icon'>
                                  <MdCall 
                                  onClick={() => handleCallClick(
                                    contacts.mobile,
                                    contacts.username,
                                    dpMap[contacts.mobile] || "https://res.cloudinary.com/dnd9qzxws/image/upload/v1743764088/image_dp_uwfq2g.png"
                                  )}
                                />

                                
                                </div>
                              
                          </div>
                        ))
                      }
                </div>

                   
               </div>





          </div>




</SwipeNavigator>

)







}
export default NewCall;