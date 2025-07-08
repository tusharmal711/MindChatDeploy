import SwipeNavigator from './SwipeNavigator';
import { FaHeartCirclePlus } from "react-icons/fa6";
import { SiFigshare } from "react-icons/si";
import { IoMdPhotos } from "react-icons/io";
import { MdVideoLibrary } from "react-icons/md";
import { useState } from 'react';
import { FaPlus } from "react-icons/fa6";
import { IoMdSend } from "react-icons/io";
import { RxCross2 } from "react-icons/rx";
import { IoMdDownload } from "react-icons/io";
// import "../output.css";
const Moments = ()=>{
const raw = sessionStorage.getItem("profile-dp");
let profileDp = null;

try {
  const parsed = JSON.parse(raw);
  profileDp = Array.isArray(parsed) ? parsed[0] : parsed;
 
} catch (e) {
  console.error("Failed to parse profile-dp:", e);
}

const visiblePopup1 = ()=>{
let statusPopup=document.getElementById("status-popup");
statusPopup.classList.toggle("spv");

}
const invisiblePopup1 = ()=>{
  let statusPopup=document.getElementById("status-popup");
statusPopup.classList.remove("spv");
}


const [preview, setPreview] = useState(null);
const [file, setFile] = useState(null)
const imageSet = (e) => {
  const selectedFile = e.target.files[0];

  if (!selectedFile) return;

  setFile(selectedFile);
  console.log("selected file " + selectedFile);

  setPreview(URL.createObjectURL(selectedFile));
  // setViewUpload(true);
  // setShowIcon(true);
  // setPlusview(true);
 
  
  // fileSend.classList.remove("file-ani");
  // Reset the file input value to allow selecting the same file again
  e.target.value = "";
};


const closePopoverlay = ()=>{
  setFile(null);
  setPreview(null);
    let statusPopup=document.getElementById("status-popup");
statusPopup.classList.remove("spv");
}








    return(
        
      <SwipeNavigator>
      <div className='moment-container'>
       






      {
        preview &&(
          <div className="photo-overlay-moment">
            <div className='overlay-moment-nav'>
             <RxCross2 className='overlay-nav-cross'onClick={closePopoverlay}/>
             <IoMdDownload className='overlay-nav-download'/>
            </div>
            <div className='overlay-moment-image'>
             {
                  file.type.startsWith("video/") ? (
                      <video src={preview} controls className='your-moment-preview' />
                  ):(
                    <img src={preview} className='your-moment-preview' />
                  )
                }
              <input type="text" placeholder='Add a caption' autoFocus/>
              
            </div>
            

            <div className='overlay-moment-fotter'>
              <div className='image-adding'>
                {
                  file.type.startsWith("video/") ? (
                      <video src={preview} className='image-adding-img' />
                  ):(
                    <img src={preview} className='image-adding-img' />
                  )
                }
                   
                   <div className='image-adding-icon'><FaPlus className='adding-plus'/></div>
                    <IoMdSend className='moment-send'/>
              </div>

            </div>
          
        </div>
        )
      }
         




        


       <div className='contact-moments'>




           <nav className='moments-nav' onClick={invisiblePopup1}>
                 <h2 className='moments-heading'>Moments</h2>
           </nav>
           <div className='own-moments' onClick={visiblePopup1}>
              <div className='moment-image'>
             {profileDp?.dp ? (
                <img
                  src={`https://res.cloudinary.com/dnd9qzxws/image/upload/v1743761726/${profileDp.dp}`}
                  alt="Profile" className='own-moment-dp'
                />
              ) : (
                <p>No profile picture found.</p>
              )}
              <FaHeartCirclePlus className='love-add'/>
                <div className='status-popup' id="status-popup">
                       <div className='input'>
                         <input type="file" id="status-photo-input" placeholder='Photos' onChange={imageSet} accept="image/*"/>
               
                         <input type="file" id="status-video-input" idplaceholder='Videos' onChange={imageSet} accept="video/*"/>
                       </div>
                 <label for="status-photo-input" className='photo-m'>
                     <p><IoMdPhotos className='p-m'/>Photos</p>
                 </label>
                 <label for="status-video-input" className='video-m'>
                    <p><MdVideoLibrary className='v-m' />Videos</p>
                 </label>
                   
                   
                </div>

              </div>
              <div className='moment-content' >
                    <p>Add moment</p>
                    <p className='moment-content-text2'>Click to add moment update</p>
              </div>
           </div>
         
       </div>













       <div className='moments-status' onClick={invisiblePopup1}>
        <SiFigshare className='moments-icon-design'/>
        <h2>Share your moments to your contacts</h2>
        <p>Share photos , videos and text will disappear within 24 hours </p>
       </div>
      
      </div>
      
    </SwipeNavigator>
    )
}
export default Moments;