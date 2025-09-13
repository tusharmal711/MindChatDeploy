import { useState,useEffect } from "react";
import { FaRegClock } from "react-icons/fa";
const backendUrl = process.env.REACT_APP_BACKEND_URL; 
const Notification = ()=>{
      const [senderPhones, setSenderPhones] = useState([]);
      const [users, setUsers] = useState([]);
      const [requests, setRequests] = useState([]); 
      const [time,setTime]=useState("");
      useEffect(() => {
        const myPhone = sessionStorage.getItem("phone");
    
        const fetchReceivedRequest = async () => {
          try {
            const res = await fetch(`${backendUrl}api/notificationrequestuser`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ receiver: myPhone }),
            });
    
            if (!res.ok) throw new Error("Failed to fetch friend requests");
            
            const data = await res.json();
           
            setRequests(data);
            const phoneNumbers = data.map((friend) => friend.sender); // extract sender phones
            setSenderPhones(phoneNumbers);
          } catch (error) {
            console.error("Error fetching friend requests:", error);
          }
        };
    
        fetchReceivedRequest();
      }, []);
    

 const [loading, setLoading] = useState(false);


      useEffect(() => {
        if (senderPhones.length === 0) {
    setLoading(false); //
    return;
  }
    
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
             const enriched = data.map((user) => {
        const request = requests.find((r) => r.sender === user.phone);
        return {
          ...user,
          date: request ? request.date : null,
        };
      });
       setUsers(enriched);
            console.log("Users who sent you requests:", data);
          } catch (error) {
            console.error("Error fetching users:", error);
          }finally {
      setLoading(false); //  stop loading
    }
        };
    
        fetchReceivedUsers();
      }, [senderPhones]);


const [currentTime, setCurrentTime] = useState(Date.now());

useEffect(() => {
  const interval = setInterval(() => {
    setCurrentTime(Date.now()); // triggers re-render
  }, 1000); // update every second for real-time effect

  return () => clearInterval(interval); // clean up
}, []);
const formatTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();

  const diffMs = now - date;
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);

  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (diffSeconds < 60) {
    return `${diffSeconds} second${diffSeconds !== 1 ? 's' : ''} ago`;
  } else if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
  } else if (isToday) {
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `Today, ${hours}:${minutes}`;
  } else {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${day}/${month}/${year}, ${hours}:${minutes}`;
  }
};













    return(
        <div className="request-sent-main">
           <div className='right-nav-friend-mobile'>
                 
                  <input type="text" placeholder='Search here' />
              </div>
            <h1 className="noti-heading">Notifications</h1>
            <div className="notification-card-container">
                {
                     loading ? (
  
                <div className="spinner-wrapper">
      <div className="fb-spinner"></div>
    </div>

                  ) :(
                         users.map((user, index) => (
                   <div key={index} className="notification-sent-card">
                     <div>
                        <img src={`https://res.cloudinary.com/dnd9qzxws/image/upload/v1743761726/${user.dp}`} className="request-card-image"/>
                        </div>
                        <div>
                            <p>{user.username} sent you friend request</p>
                           <p className="noti-time"><FaRegClock />{user.date ? formatTime(user.date) : "No time available"}</p>
                            </div>


                   </div>
                   ))
                  )
               
                   }
            </div>
        </div>
    )
}
export default Notification;