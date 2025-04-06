import { NavLink} from "react-router-dom";
import { ImCamera } from "react-icons/im";
import { SiEventstore } from "react-icons/si";
import { TbFriends } from "react-icons/tb";
import { BiSolidPhoneCall } from "react-icons/bi";
import { IoLogOut } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { useState,useEffect,useRef,useReducer } from "react";
import { TiArrowLeftThick } from "react-icons/ti";
import { TbInfoSquareRoundedFilled } from "react-icons/tb";
import { IoSettingsSharp } from "react-icons/io5";
import { FaEdit } from "react-icons/fa";
import { MdEmail } from "react-icons/md";

import { MdChat } from "react-icons/md";
import { HiOutlineEye } from "react-icons/hi";
import { MdOutlinePhotoCamera } from "react-icons/md";
import { MdOutlineDriveFolderUpload } from "react-icons/md";
import { RiDeleteBin6Line } from "react-icons/ri";
import { RxCross2 } from "react-icons/rx";
import { ImCross } from "react-icons/im";
import "cropperjs/dist/cropper.css";
import Cropper from "cropperjs";
import { TiTick } from "react-icons/ti";
const Navbar = ()=>{
   const navigate=useNavigate();
 const [isOpen, setIsOpen] = useState(false); // Popup state
 const [navProfile,setNavProfile]=useState(false);
 const [you,setYou]=useState([]);
 const [isHovered, setIsHovered] = useState(false);
//  const [showpopup,setShowPopup]=useState(false);
 const [showUpload,setShowUpload]=useState(false);
 const [view,setView]=useState(false);
   // const sendData = () => {
   //    setNavProfile(true);
   //    navigate("/chatboard", { state: {isOpen : true} });
   //  };



   const backendUrl = process.env.REACT_APP_BACKEND_URL; 











    const reducer = (state) => state + 1;
     const [update, forceUpdate] = useReducer(reducer, 0);
    useEffect(() => {
       const fetchContacts = async () => {
       
         try {
           const phone = sessionStorage.getItem("phone");
           const res = await fetch(`${backendUrl}api/fetchYou`, {
             method: "POST",
             headers: { "Content-Type": "application/json" },
             body: JSON.stringify({ phone }),
           });
   
           if (!res.ok) throw new Error("Failed to fetch contacts");
           const data = await res.json();
           setYou(data);
         } catch (error) {
           console.error("Error fetching contacts:", error);
         }
       };
   
       fetchContacts();
       const interval = setInterval(() => {
        forceUpdate(); // Triggers re-render to fetch new data
      }, 100);
  
      return () => clearInterval(interval); 
     }, [update]);

     const profilePic = document.querySelector(".profile-pic");
     const uploadPopup = document.querySelector(".upload-popup");
     const navProfile1=document.querySelector(".profile-scroll");
const showPopup=()=>{
  
setShowUpload(false);




if (profilePic && uploadPopup) {
    profilePic.classList.toggle("profile-opacity");
    uploadPopup.classList.toggle("fold");
    navProfile1.classList.toggle("overflow");
   
} else {
    console.error("Element not found: profilePic or uploadPopup");
}
 
}

const viewProfile = ()=>{
  setView(true);
  uploadPopup.classList.remove("fold");
  profilePic.classList.remove("profile-opacity");
  navProfile1.classList.remove("overflow");
}




// dp setting is starting from here
const [dp, setDp] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);
  const imageRef = useRef(null);
  const cropperRef = useRef(null);

  const handleFileChange = (e) => {
    if (!e.target.files || e.target.files.length === 0) {
      console.log("No file selected.");
      return;
    }

    const file = e.target.files[0];
    console.log("File selected:", file.name);
    setDp(true); // Open the cropper modal when an image is selected
  
    const reader = new FileReader();
    reader.onload = (e) => {
      setImageSrc(reader.result);
      if (cropperRef.current) {
        cropperRef.current.destroy();
       
        
      }
      setTimeout(initializeCropper, 100); // Initialize cropper after setting image
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const initializeCropper = () => {
    if (!imageRef.current) return;
    cropperRef.current = new Cropper(imageRef.current, {
      aspectRatio: 1,
      viewMode: 1,
      background: false,
      autoCropArea: 1,
    });
    
  };

  const handleCrop = () => {
    if (cropperRef.current) {
      const croppedCanvas = cropperRef.current.getCroppedCanvas();
      if (croppedCanvas) {
        setCroppedImage(croppedCanvas.toDataURL());
      }
    }
  };

  // const handleDownload = () => {
  //   if (!croppedImage) return;
  //   const link = document.createElement("a");
  //   link.href = croppedImage;
  //   link.download = "cropped-image.png";
  //   link.click();
  // };

// dp setting is ending here
const [ownMobile,setOwnMobile]=useState("");

useEffect(() => {
  if (you.length > 0) {
   
    setOwnMobile(you[0].email); // Set once when 'you' changes
  
  }
}, [you]);

const [about, setAbout] = useState("");
const [hasEdited, setHasEdited] = useState(false); // Track user edits

useEffect(() => {
  if (you.length > 0 && !hasEdited) {  // Only set when user hasn't edited
    setAbout(you[0].about);
  }
}, [you]); // Runs when 'you' changes

const handleChange = (e) => {
  setAbout(e.target.value);
  setHasEdited(true); // Mark as edited when user types
};








const updateDp = async () => {
  console.log("Starting updateDp...");
  setDp(false);
  setLoader(true);
  if (!croppedImage) {
    console.error("No cropped image found.");
    return;
  }

  // Convert Base64 to Blob
  const blob = await fetch(croppedImage).then((res) => res.blob());
  const file = new File([blob], "profile-pic.png", { type: "image/png" });

  const formData = new FormData();
  formData.append("email", ownMobile); // Ensure email is sent
  formData.append("dp", file); // Correct file format

  try {
    const res = await fetch(`${backendUrl}api/changeDp`, {
      method: "POST",
      body: formData, // No need to set headers manually
    });

    if (!res.ok) {
      const errorMessage = await res.text(); // Get error message from backend
      throw new Error(errorMessage);
    }

    const data = await res.json();
    console.log("Update successful:", data);
    setLoader(false);
    setCroppedImage(null);
  } catch (error) {
    console.error("Error updating:", error);
  }
};





const dpPopup = ()=>{
  setDp(false);
  setCroppedImage(null);
}

const closePopup=()=>{
  uploadPopup.classList.remove("fold");
  profilePic.classList.remove("profile-opacity");
  navProfile1.classList.remove("overflow");
}



const contactView = sessionStorage.getItem("contactView");








const [aboutIcon,setAboutIcon]=useState(false);




const [abtn,setAbtn]=useState(false);
const Invisible=()=>{
  setAboutIcon(true);
  setAbtn(true);
}
const [placeholder,setPlaceholder]=useState("");
const visible=async(req,res)=>{
 if(about!==""){
  try {

    const phone = sessionStorage.getItem("phone");
    const res = await fetch(`${backendUrl}api/editAbout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({phone,email:ownMobile,about}),
    });
    setAboutIcon(false);
    setAbtn(false);
    if (!res.ok) throw new Error("Failed to fetch contacts");
    
  } catch (error) {
    console.error("Error updating:", error);
  }


 }else{
     setPlaceholder("About required !");
 }
 


}


const visible1=()=>{
  setAboutIcon(false);
  setAbtn(false);
  setPlaceholder("");
}


// black theme is starting from here

// black theme is ending here





const [remove,setRemove]=useState(false);
const Remove = ()=>{
  setRemove(true);
  closePopup();
}

const deleteDp = async(req,res)=>{
  try {

    const phone = sessionStorage.getItem("phone");
    const res = await fetch(`${backendUrl}api/deleteDp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({phone,email:ownMobile}),
    });
    setRemove(false);
    if (!res.ok) throw new Error("Failed to fetch contacts");
    
  } catch (error) {
    console.error("Error updating:", error);
  }
}








const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

useEffect(() => {
  const handleResize = () => {
    setIsMobile(window.innerWidth <= 768);
  };

  window.addEventListener('resize', handleResize);
  
  // Cleanup
  return () => window.removeEventListener('resize', handleResize);
}, []);









const [loader,setLoader]=useState(false);
  return <div className="navbar-container">
     
{/* dp setting is starting from here */}
{
   isMobile?(
        <div className="mobile-navbar">
{dp && (
        <div className="popup-overlay" id="crop-overlay">
          <div className="photo-nav">

<div className="left-nav">
{
you.map((profile)=>(


<img src={`https://res.cloudinary.com/dnd9qzxws/image/upload/v1743761726/${profile.dp}`}  alt="Profile" key={profile.id} />

 
))
}
<p>You</p>
</div>


<div className="right-nav" onClick={dpPopup}>
<RxCross2 id="right-cross"/>
</div>


</div>
          <div className="row">
            <div className="col-lg-6 text-center">
              <label>Crop Image</label>
              <div className="crop-div">
                <img  className="cropper" ref={imageRef} src={imageSrc} alt="To Crop"/>
              </div>
              <button className="crop" onClick={handleCrop}>
                Crop
              </button>
            </div>
           
           {
            croppedImage && (
               <div className="cropped">
            <label>Preview</label>
              <div style={{ marginBottom: "10px" }}>
               
                  <img src={croppedImage} alt="Cropped" className="cropped-img"/>
               
              </div>
              <button className="crop-save" onClick={updateDp}>
                Save
              </button>
            </div>
            )
           }
            
          </div>
        </div>
      )}

    {/* dp setting is ending here */}
{/* view photo part is starting from here */}

{
  view && (
<div className="photo-overlay">
<div className="photo-nav">

<div className="left-nav">
{
you.map((profile)=>(


<img src={`https://res.cloudinary.com/dnd9qzxws/image/upload/v1743761726/${profile.dp}`}  alt="Profile" key={profile.id} />

 
))
}
<p>You</p>
</div>


<div className="right-nav" onClick={()=>{setView(false)}}>
<RxCross2 id="right-cross"/>
</div>


</div>

{
you.map((profile)=>(
<div className="view-photo" key={profile.id}>

<img src={`https://res.cloudinary.com/dnd9qzxws/image/upload/v1743761726/${profile.dp}`}  alt="Profile" />
</div>
 
))
}
</div>

  )
}





















{/* view photo part is ending here */}

{/* Logout Popup */}
{isOpen && (
        <div className="popup-overlay">
          <div className="logout-popup">
            <div className="popup-text">
              <h3>Logout?</h3>
              <p>Are you sure you want to logout?</p>
              <p id="see">See you next time! Click 'Logout' to confirm.</p>
            </div>
            <div className="popup-button">
              <button type="button" id="logoutCancel" onClick={() => setIsOpen(false)}>
                Cancel
              </button>
              <button id="logoutBtn" onClick={() => navigate("/login")}>
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    





{
  remove && (
    <div className="popup-overlay">
    <div className="logout-popup">
      <div className="popup-text">
        <h3>Delete Profile picture</h3>
        <p>Are you sure to delete ?</p>
        <p id="see">Click 'Delete' to confirm.</p>
      </div>
      <div className="popup-button">
        <button type="button" id="logoutCancel" onClick={() => setRemove(false)}>
          Cancel
        </button>
        <button id="logoutBtn" onClick={deleteDp}>
          Delete
        </button>
      </div>
    </div>
  </div>
  )
}

   











  {
   navProfile &&(
      <div className="nav-profile">
         <TiArrowLeftThick  onClick={()=>{setNavProfile(false)}} id="left-arrow"/>
        
      <div className="heading-part">
      <h2 id="chat-heading">Profile</h2>
      </div>


      <div className="profile-scroll">
       

    
      {
      you.map((profile)=>(
       

     <div className="profile-pic" key={profile.id} id="profile-pic">

<div className="dp-wrapper1">
     <img  src={`https://res.cloudinary.com/dnd9qzxws/image/upload/v1743761726/${profile.dp}`} className="profile-pic-img" id="profile-pic-img" onClick={showPopup}    onMouseEnter={() => setIsHovered(true)}  onMouseLeave={() => setIsHovered(false)} alt="Profile" />
    
        {
  loader &&(
      <div class="facebook-loader">
  
   <div class="dot"></div>
  <div class="dot"></div>
  <div class="dot"></div>
 
      </div>
  )
}
    
     </div>
     </div>
      ))
}


     <div className="change-profile">
    {
      ((isHovered && !showUpload) || (!isHovered && showUpload) || (isHovered && showUpload))&&(
        <p id="pic-text"> <ImCamera id="profile-camera"/><br></br>CHANGE <br></br>PROFILE PHOTO</p>
      )
    }
    
        
      </div>


     
    <div className="upload-popup" id="upload-popup">
    <ul>
      <li  onClick={viewProfile}>
      <HiOutlineEye id="up"/> View photo
      </li>
      <li>
      <MdOutlinePhotoCamera id="up"/> Take photo
     
      </li>
      <label for="file-input">
      <li>
       
        <MdOutlineDriveFolderUpload id="up"/> Upload photo 
       
        
        <input type="file" id="file-input" accept="image/*"  onChange={handleFileChange} onClick={closePopup}/> 
      </li>
      </label>
      <li onClick={Remove}>
      <RiDeleteBin6Line id="up"/> Remove photo
      </li>
    </ul>
  </div>

   

  












     
     {
      you.map((profile)=>(
        <div key={profile.id}>
          <h2>{profile.username}</h2>
          <p id="your-mobile">+91 {profile.phone}</p>
          <div className="p-t-z pt">
          <div>
          <MdEmail className="email-icon"/>
          </div>
        <div className="ptContent">
        <span>Email</span>
        <span>{profile.email}</span>
      
        </div>

       
      </div>





        </div>
        
      ))
     }








         
      <div className="profile-text">
        

      <div className="p-t-f pt">
        <div> <TbInfoSquareRoundedFilled id="about-icon"/></div>
        <div className="ptContent">
        <span>About</span>
        {
          aboutIcon?(
            <div>
            <input type="text" id="about-input" className="about-input" value={about} 
            onChange={handleChange} placeholder={placeholder} autoFocus required/>
          
            </div>
          ):(

            
              you.map((profile)=>(
                <span>{profile.about}</span>
              ))
            


          
          )
        }
       
      
        </div>
        {
          abtn?(
            <div className="bttn">
            <div className="edit-icon" onClick={visible} > <TiTick  className="tick"/></div>
            <div className="edit-icon" onClick={visible1} > <ImCross  className="cross-tick"/></div>
            </div>
          ):(
            <div className="edit-icon" onClick={Invisible}> <FaEdit id="edit-icon"/></div>
          )
        }
       
     
       
       
      </div>



      <div className="p-t-s pt">
        <IoSettingsSharp id="setting-icon"/>
        <span>Settings</span>
      
      </div>

      <div className="p-t-s pt" id="mob-logout" onClick={()=>{setIsOpen(true)}}>
        <IoLogOut id="setting-icon"/>
        <span>Logout</span>
      
      </div>
       
      </div>

      </div>


  </div>
   )
  }
      
  











      <NavLink to="/chatboard" className="mob chat"><div className="nav-chat"><MdChat className="mob-icon"/><span>Chats</span></div></NavLink>
      <NavLink to="/moments" className="mob moments"><div className="nav-chat"><SiEventstore className="mob-icon"/><span>Moments</span></div></NavLink>
      <NavLink to="/connect" className="mob connect"><div className="nav-chat"><TbFriends className="mob-icon"/><span>Friends</span></div></NavLink>
      <NavLink to="/calls" className="mob calls"><div className="nav-chat"><BiSolidPhoneCall className="mob-icon"/><span>Calls</span></div></NavLink>
    {/* <NavLink to="#" id="logout" className="link logout" onClick={sendData}><IoLogOut /></NavLink> */}

    {/* <button id="logout" className="link logout" onClick={()=>{setIsOpen(true)}}>
        <IoLogOut />
      </button> */}
{you.map((profile)=>(
<img src={`https://res.cloudinary.com/dnd9qzxws/image/upload/v1743761726/${profile.dp}`} id="profile-default" key={profile.id} alt="Not found" onClick={()=>{setNavProfile(true)}}/>
))}




        </div>











   ):(



       <div className="navbar">
          {dp && (
        <div className="popup-overlay" id="crop-overlay">
          <div className="photo-nav">

<div className="left-nav">
{
you.map((profile)=>(


<img src={`https://res.cloudinary.com/dnd9qzxws/image/upload/v1743761726/${profile.dp}`}  alt="Profile" key={profile.id} />

 
))
}
<p>You</p>
</div>


<div className="right-nav" onClick={dpPopup}>
<RxCross2 id="right-cross"/>
</div>


</div>
          <div className="row">
            <div className="col-lg-6 text-center">
              <label>Crop Image</label>
              <div className="crop-div">
                <img  className="cropper" ref={imageRef} src={imageSrc} alt="To Crop"/>
              </div>
              <button className="crop" onClick={handleCrop}>
                Crop
              </button>
            </div>
           
           {
            croppedImage && (
               <div className="cropped">
            <label>Preview</label>
              <div style={{ marginBottom: "10px" }}>
               
                  <img src={croppedImage} alt="Cropped" className="cropped-img"/>
               
              </div>
              <button className="crop-save" onClick={updateDp}>
                Save
              </button>
            </div>
            )
           }
            
          </div>
        </div>
      )}

    {/* dp setting is ending here */}
{/* view photo part is starting from here */}

{
  view && (
<div className="photo-overlay">
<div className="photo-nav">

<div className="left-nav">
{
you.map((profile)=>(


<img src={`https://res.cloudinary.com/dnd9qzxws/image/upload/v1743761726/${profile.dp}`}  alt="Profile" key={profile.id} />

 
))
}
<p>You</p>
</div>


<div className="right-nav" onClick={()=>{setView(false)}}>
<RxCross2 id="right-cross"/>
</div>


</div>

{
you.map((profile)=>(
<div className="view-photo" key={profile.id}>

<img src={`https://res.cloudinary.com/dnd9qzxws/image/upload/v1743761726/${profile.dp}`}  alt="Profile" />
</div>
 
))
}
</div>

  )
}





















{/* view photo part is ending here */}

{/* Logout Popup */}
{isOpen && (
        <div className="popup-overlay">
          <div className="logout-popup">
            <div className="popup-text">
              <h3>Logout?</h3>
              <p>Are you sure you want to logout?</p>
              <p id="see">See you next time! Click 'Logout' to confirm.</p>
            </div>
            <div className="popup-button">
              <button type="button" id="logoutCancel" onClick={() => setIsOpen(false)}>
                Cancel
              </button>
              <button id="logoutBtn" onClick={() => navigate("/login")}>
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    





{
  remove && (
    <div className="popup-overlay">
    <div className="logout-popup">
      <div className="popup-text">
        <h3>Delete Profile picture</h3>
        <p>Are you sure to delete ?</p>
        <p id="see">Click 'Delete' to confirm.</p>
      </div>
      <div className="popup-button">
        <button type="button" id="logoutCancel" onClick={() => setRemove(false)}>
          Cancel
        </button>
        <button id="logoutBtn" onClick={deleteDp}>
          Delete
        </button>
      </div>
    </div>
  </div>
  )
}

   











  {
   navProfile &&(
      <div className="nav-profile">
         <TiArrowLeftThick  onClick={()=>{setNavProfile(false)}} id="left-arrow"/>
        
      <div className="heading-part">
      <h2 id="chat-heading">Profile</h2>
      </div>


      <div className="profile-scroll">
       

    
      {
      you.map((profile)=>(
       

     <div className="profile-pic" key={profile.id} id="profile-pic">

<div className="dp-wrapper1">
     <img  src={`https://res.cloudinary.com/dnd9qzxws/image/upload/v1743761726/${profile.dp}`} className="profile-pic-img" id="profile-pic-img" onClick={showPopup}    onMouseEnter={() => setIsHovered(true)}  onMouseLeave={() => setIsHovered(false)} alt="Profile" />
    
        {
  loader &&(
      <div class="facebook-loader">
  
   <div class="dot"></div>
  <div class="dot"></div>
  <div class="dot"></div>
 
      </div>
  )
}
    
     </div>
     </div>
      ))
}


     <div className="change-profile">
    {
      ((isHovered && !showUpload) || (!isHovered && showUpload) || (isHovered && showUpload))&&(
        <p id="pic-text"> <ImCamera id="profile-camera"/><br></br>CHANGE <br></br>PROFILE PHOTO</p>
      )
    }
    
        
      </div>


     
    <div className="upload-popup" id="upload-popup">
    <ul>
      <li  onClick={viewProfile}>
      <HiOutlineEye id="up"/> View photo
      </li>
      <li>
      <MdOutlinePhotoCamera id="up"/> Take photo
     
      </li>
      <label for="file-input">
      <li>
       
        <MdOutlineDriveFolderUpload id="up"/> Upload photo 
       
        
        <input type="file" id="file-input" accept="image/*"  onChange={handleFileChange} onClick={closePopup}/> 
      </li>
      </label>
      <li onClick={Remove}>
      <RiDeleteBin6Line id="up"/> Remove photo
      </li>
    </ul>
  </div>

   

  












     
     {
      you.map((profile)=>(
        <div key={profile.id}>
          <h2>{profile.username}</h2>
          <p id="your-mobile">+91 {profile.phone}</p>
          <div className="p-t-z pt">
          <div>
          <MdEmail className="email-icon"/>
          </div>
        <div className="ptContent">
        <span>Email</span>
        <span>{profile.email}</span>
      
        </div>

       
      </div>





        </div>
        
      ))
     }








         
      <div className="profile-text">
        

      <div className="p-t-f pt">
        <div> <TbInfoSquareRoundedFilled id="about-icon"/></div>
        <div className="ptContent">
        <span>About</span>
        {
          aboutIcon?(
            <div>
            <input type="text" id="about-input" className="about-input" value={about} 
            onChange={handleChange} placeholder={placeholder} autoFocus required/>
          
            </div>
          ):(

            
              you.map((profile)=>(
                <span>{profile.about}</span>
              ))
            


          
          )
        }
       
      
        </div>
        {
          abtn?(
            <div className="bttn">
            <div className="edit-icon" onClick={visible} > <TiTick  className="tick"/></div>
            <div className="edit-icon" onClick={visible1} > <ImCross  className="cross-tick"/></div>
            </div>
          ):(
            <div className="edit-icon" onClick={Invisible}> <FaEdit id="edit-icon"/></div>
          )
        }
       
     
       
       
      </div>



      <div className="p-t-s pt">
        <IoSettingsSharp id="setting-icon"/>
        <span>Settings</span>
      
      </div>


      </div>

      </div>


  </div>
   )
  }
      
  










{you.map((profile)=>(
<img src={`https://res.cloudinary.com/dnd9qzxws/image/upload/v1743761726/${profile.dp}`} id="profile-default" key={profile.id} alt="Not found" onClick={()=>{setNavProfile(true)}}/>
))}
    <NavLink to="/chatboard" className="link chat"><MdChat /></NavLink>
    <NavLink to="/moments" className="link moments"><SiEventstore /></NavLink>
    <NavLink to="/connect" className="link connect"><TbFriends /></NavLink>
    <NavLink to="/calls" className="link calls"><BiSolidPhoneCall /></NavLink>
    {/* <NavLink to="#" id="logout" className="link logout" onClick={sendData}><IoLogOut /></NavLink> */}

    <button id="logout" className="link logout" onClick={()=>{setIsOpen(true)}}>
        <IoLogOut />
      </button>





        </div>
   )
}




   </div>
}
export default Navbar;