import SwipeNavigator from './SwipeNavigator';
import { IoPeople } from "react-icons/io5";
import { IoPersonAddSharp } from "react-icons/io5";
import { FaChevronRight } from "react-icons/fa";
import { useState , useEffect } from 'react';
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











    return(
         <SwipeNavigator>
          <div className='friend-container'>
            <div className='left-friend'>
              <nav>
                <h2>Friends</h2>
              </nav>
             
              <div className='left-friend-content'>
                     <div className='lfc1'>
                     
                         <p className='frl'> <IoPeople className='fri'/> Friend request <FaChevronRight className='frla'/></p>
                     </div>
                     <div className='lfc1'>
                      <p className='frl'><IoPersonAddSharp className='fri'/> Add friend <FaChevronRight className='frla'/></p>
                      
                       
                     </div>
              </div>
            </div>

            <div className='right-friend'>
              <div className='right-friend-top'>
                <p>No friend request yet...</p>
              </div>
              <div className='right-friend-bottom'>
                {
                 users.map((users)=>(
                  <div>
                       users.username
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