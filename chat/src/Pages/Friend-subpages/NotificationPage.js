import { useState,useEffect } from "react";
import { FaRegClock } from "react-icons/fa";
import { socket } from "../Socket";
const backendUrl = process.env.REACT_APP_BACKEND_URL; 
const Notification = ()=>{
      const [senderPhones, setSenderPhones] = useState([]);
      const [users, setUsers] = useState([]);
      const [requests, setRequests] = useState([]); 
      const [time,setTime]=useState("");
       const [receiverPhones, setReceiverPhones] = useState([]);
      const [accepts, setAccepts] = useState([]); 

useEffect(() => {
  const myPhone = sessionStorage.getItem("phone");
  if (myPhone) {
    socket.emit("join", myPhone); 
  }
}, []);


useEffect(() => {
  socket.on("newFriendRequest", (data) => {
  

    // add to phone numbers
    setSenderPhones((prev) => [...prev, data.sender]);
     setRequests((prev) => [...prev, data]);
   
  });

  return () => {
    socket.off("newFriendRequest");
  };
}, []);




// useEffect(() => {
//   socket.on("newFriendAccept", (updated) => {
  
// alert("accepted");
//     // add to phone numbers
//     setReceiverPhones((prev) => [...prev, updated.receiver]);
//      setAccepts((prev) => [...prev, updated]);
   
//   });

//   return () => {
//     socket.off("newFriendAccept");
//   };
// }, []);






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
    




 useEffect(() => {
        const myPhone = sessionStorage.getItem("phone");
    
        const fetchAcceptedRequest = async () => {
          try {
            const res = await fetch(`${backendUrl}api/notificationacceptuser`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ sender: myPhone }),
            });
    
            if (!res.ok) throw new Error("Failed to fetch friend requests");
            
            const data = await res.json();
           
            setAccepts(data);
            const phoneNumbers = data.map((friend) => friend.receiver); // extract sender phones
            setReceiverPhones(phoneNumbers);
          } catch (error) {
            console.error("Error fetching friend requests:", error);
          }
        };
    
        fetchAcceptedRequest();
         const interval = setInterval(fetchAcceptedRequest, 1000); // fetch every 5s
  return () => clearInterval(interval); 
      }, []);
    


const [acceptUsers,setAcceptUsers]=useState([]);




useEffect(() => {
  if (receiverPhones.length === 0) return;

  const fetchAcceptUsers = async () => {
    try {
      const res = await fetch(`${backendUrl}api/sentrequestalluser`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: receiverPhones }), 
      });

      if (!res.ok) throw new Error("Failed to fetch accepted users");

      const data = await res.json();

      // enrich with date from accepts[]
      const enriched = data.map((user) => {
        const accept = accepts.find((r) => r.receiver === user.phone);
        return {
          ...user,
          updatedDate : accept ? accept.updatedDate : null,
        };
      });

      setAcceptUsers(enriched);
      console.log("Users who accepted your request:", enriched);
    } catch (error) {
      console.error("Error fetching accepted users:", error);
    }
  };

  fetchAcceptUsers();
}, [receiverPhones, accepts]);










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









// merge requests and accepted into one list
const allNotifications = [
  ...users.map((u) => ({
    ...u,
    type: "request",
    timestamp: u.date // normalize field name
  })),
  ...acceptUsers.map((u) => ({
    ...u,
    type: "accept",
    timestamp: u.updatedDate // normalize field name
  })),
].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)); // sort by one common field












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

  let diffMs = now - date;
  if (diffMs < 0) diffMs = 0; // prevent -4s, -2s

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
             {loading ? (
  <div className="spinner-wrapper">
    <div className="fb-spinner"></div>
  </div>
) : (
  allNotifications.map((user, index) => (
    <div key={index} className="notification-sent-card">
      <div>
        <img
          src={`https://res.cloudinary.com/dnd9qzxws/image/upload/v1743761726/${user.dp}`}
          className="request-card-image"
        />
      </div>
      <div>
        {user.type === "request" ? (
          
          <p>{user.username} sent you a friend request</p>
           
        ) : (
          
          <p>{user.username} accepted your friend request</p>
          
        )}
        <p className="noti-time">
  <FaRegClock /> 
  {user.timestamp ? formatTime(user.timestamp) : "No time available"}
</p>

       
      </div>
    </div>
  ))
)}



















            </div>
        </div>
    )
}
export default Notification;