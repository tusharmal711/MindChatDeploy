import { useState, useEffect } from "react";
import { FaLongArrowAltRight } from "react-icons/fa";
import { FaChevronRight } from "react-icons/fa";
const backendUrl = process.env.REACT_APP_BACKEND_URL; 
const AllFriend = () => {
  const [senderPhones, setSenderPhones] = useState([]);
  const [users, setUsers] = useState([]);

 useEffect(() => {
  const myPhone = sessionStorage.getItem("phone");

  const fetchReceivedRequest = async () => {
    try {
      const res = await fetch(`${backendUrl}api/accepteduser`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: myPhone }),
      });

      if (!res.ok) throw new Error("Failed to fetch accepted friends");

      const data = await res.json();

      // Pick the "other user's phone" (not mine)
      const phoneNumbers = data.map((friend) =>
        friend.sender === myPhone ? friend.receiver : friend.sender
      );

      setSenderPhones(phoneNumbers);
    } catch (error) {
      console.error("Error fetching accepted friends:", error);
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






const [contactMap, setContactMap] = useState({}); 
// { "9641539528": true, "9876543210": false, ... }

useEffect(() => {
  const myPhone = sessionStorage.getItem("phone");

  const checkContacts = async () => {
    try {
      // Send all friend phones in one request
      const res = await fetch(`${backendUrl}api/checkcontact`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ myPhone, friendPhones: users.map(u => u.phone) }),
});


      const data = await res.json(); 
      // Example response: { "9641539528": true, "9876543210": false }
      setContactMap(data);
    } catch (error) {
      console.error("Error checking contacts:", error);
    }
  };

  if (users.length > 0) {
    checkContacts();
  }
}, [users]);












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
          <h1>My Friends</h1>
          <div className="request-sent-container">
         {
  loading ? (
  
  <div className="fb-spinner"></div>

  ) : users.length === 0 ? (
    <div>
      <p>No friend </p>
    </div>
  ) : filteredUsers.length === 0 ? (
    <div>
      <p>Not found</p>
    </div>
  ) : (
 filteredUsers.map((user, index) => {
  const alreadyContact = contactMap[user.phone] || false;

  return (
    <div key={index} className="request-sent-card">
      <img
        src={`https://res.cloudinary.com/dnd9qzxws/image/upload/v1743761726/${user.dp}`}
        className="request-card-image"
      />
      <div>
        <h4>{user.username}</h4>
        <p>Friends</p>
        <div className="received-button">
          {alreadyContact ? (
            <button
              type="button"
              className="request-card-message"
              onClick={() => alert(`Open chat with ${user.username}`)}
            >
              Message
            </button>
          ) : (
            <button
              type="button"
              className="request-card-accept"
             
            >
              Add Contact
            </button>
          )}
          <button
            type="button"
            className="request-card-cancel"
            onClick={() => CancelRequest(user.phone)}
          >
            Unfriend
          </button>
        </div>
      </div>
    </div>
  );
})
  )
}

          </div>
          
        </div>
  );
};

export default AllFriend;
