import { useState, useEffect } from "react";
import { FaLongArrowAltRight } from "react-icons/fa";
import { FaChevronRight } from "react-icons/fa";
const backendUrl = process.env.REACT_APP_BACKEND_URL; 
const SentRequest = () => {
  const [receiver, setReceiver] = useState([]);
  const [users, setUsers] = useState([]);

  // 1. First fetch the receiver list
useEffect(() => {
      const sender = sessionStorage.getItem("phone");
  const fetchSentRequest = async () => {
    try {
      const res = await fetch(`${backendUrl}api/sentrequestuser`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({sender : sender}),
      });

      if (!res.ok) throw new Error("Failed to fetch friend requests");
      const data = await res.json();

      const phoneNumbers = data.map(friend => friend.receiver); // extract receiver phones
      setReceiver(phoneNumbers);
    } catch (error) {
      console.error("Error fetching friend requests:", error);
    }
  };

  fetchSentRequest();
}, []);


  // 2. When `receiver` updates, fetch corresponding user data

const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchSentUsers = async () => {
    setLoading(true); // start loader
    try {
      const res = await fetch(`${backendUrl}api/sentrequestalluser`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: receiver }), // phone: array
      });

      if (!res.ok) throw new Error("Failed to fetch user data");

      const data = await res.json();
      setUsers(data); // Assuming data is an array of user objects
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false); // stop loader no matter what
    }
  };

  if (receiver && receiver.length > 0) {
    fetchSentUsers();
  } else {
    setLoading(false); // no receivers, no need to fetch
  }
}, [receiver]);





const cancelRequest = async (receiverPhone) => {
  try {
    const sender = sessionStorage.getItem("phone"); // or localStorage

    const res = await fetch(`${backendUrl}api/cancelrequest`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sender, receiver: receiverPhone }),
    });

    if (!res.ok) throw new Error("Failed to cancel request");

    // Update state after successful deletion
    setUsers((prev) => prev.filter((user) => user.phone !== receiverPhone));
    setReceiver((prev) => prev.filter((phone) => phone !== receiverPhone));
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
      <h1>Sent Requests</h1>
      <div className="request-sent-container">
     {
  loading ? (
    <div className="fb-spinner"></div>
  ) : users.length === 0 ? (
    <div>
      <p>No requests sent</p>
    </div>
  ) : filteredUsers.length === 0 ? (
    <div>
      <p>Not found</p>
    </div>
  ) : (
    filteredUsers.map((user, index) => (
      <div key={index} className="request-sent-card">
        <div>
          <img
            src={`https://res.cloudinary.com/dnd9qzxws/image/upload/v1743761726/${user.dp}`}
            className="request-card-image"
          />
        </div>
        <div>
          <h4>{user.username}</h4>
          <p>Friends</p>
          <button
            type="button"
            className="request-card-button"
            onClick={() => cancelRequest(user.phone)}
          >
            Cancel request <FaLongArrowAltRight />
          </button>
        </div>
      </div>
    ))
  )
}

      </div>
      
    </div>
  );
};

export default SentRequest;
