import SwipeNavigator from './SwipeNavigator';
import { IoPeople } from "react-icons/io5";
import { IoPersonAddSharp } from "react-icons/io5";
import { FaChevronRight } from "react-icons/fa";
import { useState , useEffect } from 'react';
import { FaChevronLeft } from "react-icons/fa6";

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

    return(
         <SwipeNavigator>
          <div className='friend-container'>
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
                <p>No friend request yet...</p>
              </div>
              <div className='right-friend-bottom' id="right-friend-bottom">
                {
                 filteredUsers.map((users)=>(
                  <div className='all-users'  key={users._id}>
                      <div className='card-img'>
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