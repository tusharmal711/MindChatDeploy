import { useState, useEffect } from "react";
import { FaLongArrowAltRight } from "react-icons/fa";
import { useLocation } from "react-router-dom";
import { FaChevronRight } from "react-icons/fa";
import { socket } from "../Socket";
const backendUrl = process.env.REACT_APP_BACKEND_URL; 
const FriendRequest = () => {
  const [senderPhones, setSenderPhones] = useState([]);
  const [users, setUsers] = useState([]);
useEffect(() => {
  const myPhone = sessionStorage.getItem("phone");
  if (myPhone) {
    socket.emit("join", myPhone); //receiver তার room এ join করছে
  }
}, []);


const location=useLocation();




 useEffect(() => {
    const myPhone = sessionStorage.getItem("phone");
    if (location.pathname === "/connect/friend-request") {
      socket.emit("page-join", { phone : myPhone, path: "/connect/friend-request" });
    }

    return () => {
      socket.emit("page-leave", { phone : myPhone, path: "/connect/friend-request" });
    };
  }, [location.pathname]);













 const [count, setCount] = useState(0);

useEffect(() => {
  socket.on("newFriendRequest", (data) => {
  

    // add to phone numbers
    setSenderPhones((prev) => [...prev, data.sender]);
 
   
  });

  return () => {
    socket.off("newFriendRequest");
  };
}, []);


useEffect(() => {
  const myPhone = sessionStorage.getItem("phone");

  const markAsRead = async () => {
    await fetch(`${backendUrl}api/markRequestAsRead`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ receiver: myPhone }),
    });

    setCount(0); 
  };

  markAsRead();
}, []);






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







 const [loading, setLoading] = useState(false);

useEffect(() => {
  if (senderPhones.length === 0) {
    setLoading(false); //
    return;
  }

  const fetchReceivedUsers = async () => {
    setLoading(true); //  start loading
    try {
      const res = await fetch(`${backendUrl}api/sentrequestalluser`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: senderPhones }), // array of phones
      });

      if (!res.ok) throw new Error("Failed to fetch user data");

      const data = await res.json();
      setUsers(data); // Should be an array of user objects
      console.log("Users who sent you requests:", data);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false); //  stop loading
    }
  };

  fetchReceivedUsers();
}, [senderPhones]);



const AcceptRequest = async (senderPhone) => {
  try {
    const receiver = sessionStorage.getItem("phone"); // logged-in user

    const res = await fetch(`${backendUrl}api/acceptrequest`, {
      method: "PUT",   
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sender: senderPhone, receiver }),
    });

    if (!res.ok) throw new Error("Failed to accept request");

    const result = await res.json();

    // Update UI: remove accepted request from pending list
    setUsers((prev) => prev.filter((user) => user.phone !== senderPhone));
    setSenderPhones((prev) => prev.filter((phone) => phone !== senderPhone));

    console.log("Request accepted:", result);
  } catch (error) {
    console.error("Error accepting request:", error);
  }
};


const CancelRequest = async (senderPhone) => {
  try {
    const receiver = sessionStorage.getItem("phone"); // or localStorage

    const res = await fetch(`${backendUrl}api/cancelrequest`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sender : senderPhone, receiver: receiver}),
    });

    if (!res.ok) throw new Error("Failed to cancel request");

    // Update state after successful deletion
    setUsers((prev) => prev.filter((user) => user.phone !== senderPhone));
    setSenderPhones((prev) => prev.filter((phone) => phone !== senderPhone));
  } catch (error) {
    console.error("Error canceling request:", error);
  }
};














const [searchValue,setSearchValue]=useState("");
  const filteredUsers = users.filter((users) =>
     users.username.toLowerCase().includes(searchValue.toLowerCase())
   );




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



















  return (
       <div className="request-sent-main">
             <div className='right-nav-friend-mobile'>
                 
                  <input type="text" placeholder='Search here' value={searchValue} onChange={(e)=>{setSearchValue(e.target.value)}}/>
              </div>
         
            <div className='right-nav-friend'>
                     <FaChevronRight className='right-friend-arrow' onClick={openLeftFriend}/>
                     <h2 id="r-n-f">Friends</h2>
                     
                      <input type="text" placeholder='Search here' value={searchValue} onChange={(e)=>{setSearchValue(e.target.value)}} />
                  </div>
          <h1>Requests</h1>
          <div className="request-sent-container">
         {
  loading ? (
  
  <div className="fb-spinner"></div>

  ) : users.length === 0 ? (
    <div>
      <p>No friend requests</p>
    </div>
  ) : filteredUsers.length === 0 ? (
    <div>
      <p>Not found</p>
    </div>
  ) : (
    filteredUsers.map((user, index) => (
      <div key={index} className="request-sent-card">
        <img
          src={`https://res.cloudinary.com/dnd9qzxws/image/upload/v1743761726/${user.dp}`}
          className="request-card-image"
        />
        <div>
          <h4>{user.username}</h4>
          <p>Friends</p>
          <div className="received-button">
            <button
              type="button"
              className="request-card-accept"
              onClick={() => AcceptRequest(user.phone)}
            >
              Accept
            </button>
            <button type="button" className="request-card-cancel"
             onClick={() => CancelRequest(user.phone)}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    ))
  )
}

          </div>
          
        </div>
  );
};

export default FriendRequest;
