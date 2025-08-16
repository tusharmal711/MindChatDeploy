import {useState,useEffect} from "react";
import Cookies from "js-cookie";
import { FaChevronRight } from "react-icons/fa";
const backendUrl = process.env.REACT_APP_BACKEND_URL; 
const AddFriend = ()=>{
const [sender,setSender]=useState("");
const [receiver,setReceiver]=useState("");
 const [users,setUsers]=useState([]);
 const phone = sessionStorage.getItem("phone") || Cookies.get("mobile");
 
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
         receiver: receiverUser.phone
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









    return(
        <div className="add-friend-container">
             <div className='right-nav-friend'>
                             <FaChevronRight className='right-friend-arrow' onClick={openLeftFriend}/>
                             <h2 id="r-n-f">Friends</h2>
                             
                              <input type="text" placeholder='Search here' value={searchValue} onChange={(e)=>{setSearchValue(e.target.value)}} />
                          </div>
            <h1>AddFriend</h1>
               <div className='right-friend-bottom' id="right-friend-bottom">
                {
                 filteredUsers.map((users)=>(
                  <div className='all-users'  key={users._id}>
                      <div className='card-img'>
                         <img src={`https://res.cloudinary.com/dnd9qzxws/image/upload/v1743761726/${users.dp}`} />

                      </div>
                      <div className='card-content'>
                             <h4>{users.username}</h4>
                            <button
  className={`add-friend ${friendRequests[users._id] === "Sent Request" ? "sent-request" : ""}`}
  onClick={() => friendRequestSend(users._id)}  // users._id is correct
>
  {friendRequests[users._id] || "Add Friend"}
</button>

                             <button className='add-remove'>Remove</button>
                        </div>
                      
                  </div>
                 )
                )
              }
              </div>
        </div>
    )
}
export default AddFriend;