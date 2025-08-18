import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import io from "socket.io-client";
import { GoDotFill } from "react-icons/go";
import { IoCameraReverseSharp } from "react-icons/io5";
import { IoMdFlashOff } from "react-icons/io";
import { IoMdFlash } from "react-icons/io";
import { HiSpeakerWave } from "react-icons/hi2";
import { MdCallEnd, MdMicOff, MdMic, MdVideocam, MdVideocamOff } from "react-icons/md";
import { TbHeadphonesFilled } from "react-icons/tb";
import { FaBluetoothB } from "react-icons/fa";
import { socket } from "./Socket";
const backendUrl = process.env.REACT_APP_BACKEND_URL; 
const CallPage = () => {
  
  const navigate = useNavigate();
const [isConnected, setIsConnected] = useState(false); // NEW

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
const [isLoudSpeaker, setIsLoudSpeaker] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(true);
  const [status,setStatus]=useState("Calling...");
  const callusername=sessionStorage.getItem("callusername");
    const [contactDp, setContactDp] = useState("");
  const myPhone=sessionStorage.getItem("myPhone");
  const roomId=sessionStorage.getItem("roomId");
    const contactPhone=sessionStorage.getItem("contactPhone");
    const [outputDevice, setOutputDevice] = useState("speaker"); 
  useEffect(() => {
    const dp = sessionStorage.getItem("contactDp") 
      || "https://res.cloudinary.com/dnd9qzxws/image/upload/v1743764088/image_dp_uwfq2g.png"; // fallback
    setContactDp(dp);
  }, []);


  // -------------------------------
  // Start the call
  // -------------------------------
useEffect(() => {
  const detectAudioDevice = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioOutputs = devices.filter(d => d.kind === "audiooutput");

      if (audioOutputs.some(d => d.label.toLowerCase().includes("bluetooth"))) {
        setOutputDevice("bluetooth");
      } else if (audioOutputs.some(d => d.label.toLowerCase().includes("headset") || d.label.toLowerCase().includes("headphone"))) {
        setOutputDevice("headphone");
      } else {
        setOutputDevice("speaker");
      }
    } catch (err) {
      console.error("Device detection error:", err);
    }
  };

  detectAudioDevice();

  // also re-check if devices change (like plugging headphones)
  navigator.mediaDevices.addEventListener("devicechange", detectAudioDevice);

  return () => {
    navigator.mediaDevices.removeEventListener("devicechange", detectAudioDevice);
  };
}, []);


  const startCall = async () => {
   
    peerConnectionRef.current = new RTCPeerConnection();

    // Handle remote stream
    peerConnectionRef.current.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
        //  if(!isLoudSpeaker){
        //    remoteVideoRef.current.volume = 0.3;
        //   }
      }
    };

    // Get audio+video
    localStreamRef.current = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
  localStreamRef.current.getVideoTracks().forEach(track => {
  track.enabled = false;
});
setIsVideoOff(true);
    // Show local video
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current;
    }

    // Add tracks to peer connection
    localStreamRef.current.getTracks().forEach((track) => {
      peerConnectionRef.current.addTrack(track, localStreamRef.current);
    });

    // ICE candidates
    peerConnectionRef.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", { candidate: event.candidate, roomId });
      }
    };

    // Create & send offer
    const offer = await peerConnectionRef.current.createOffer();
    await peerConnectionRef.current.setLocalDescription(offer);
    socket.emit("offer", { offer, roomId });
  };

  // -------------------------------
  // End call
  // -------------------------------
const endCall = () => {
 
  if (roomId) {
    socket.emit("end-call", { roomId });
  }
socket.hasJoined=false;
 if (timerRef.current) {
    clearInterval(timerRef.current);
    timerRef.current = null;
  }
   setCallDuration("00:00:00");

  if (localStreamRef.current) {
    localStreamRef.current.getTracks().forEach(track => track.stop());
    localStreamRef.current = null;
  }

 
  if (peerConnectionRef.current) {
    peerConnectionRef.current.close();
    peerConnectionRef.current = null;
  }


  sessionStorage.removeItem("roomId");
  sessionStorage.removeItem("contactPhone");
  sessionStorage.removeItem("callusername");
  sessionStorage.removeItem("contactDp");


  setIsConnected(false);
  setIsVideoOff(true);
  setIsMuted(false);
  setStatus("Calling...");


  navigate("/calls");
};




  // -------------------------------
  // Toggle mute
  // -------------------------------
const toggleMute = () => {
  if (!localStreamRef.current) return;

  // toggle local track
  localStreamRef.current.getAudioTracks().forEach((track) => {
    track.enabled = !track.enabled;
  });

  // toggle state safely
  setIsMuted(prev => {
    const newMuteState = !prev;
    socket.emit("mute-status", { isMuted: newMuteState, roomId }); // send roomId
    return newMuteState;
  });
};


const [remoteMuted,setRemoteMuted]=useState(false);
useEffect(() => {
  if(remoteMuted){
    alert("muted");
  }
  socket.on("mute-status", ({ isMuted }) => {
    setRemoteMuted(isMuted); // state for showing remote muted status
  });

  return () => {
    socket.off("mute-status");
  };
}, [roomId]);

  // -------------------------------
  // Toggle video
  // -------------------------------
// Local video OFF at start


const toggleVideo = () => {
  if (!localStreamRef.current) return;
  const newStatus = !isVideoOff;

  localStreamRef.current.getVideoTracks().forEach((track) => {
    track.enabled = !track.enabled;
  });
  setIsVideoOff(newStatus);

  // Send video status to other user
  socket.emit("video-status", { roomId, isVideoOff: newStatus });
};

const [isRemoteVideoOff, setIsRemoteVideoOff] = useState(true);

useEffect(() => {
  socket.on("video-status", ({ isVideoOff }) => {
    setIsRemoteVideoOff(isVideoOff);
  });

  return () => {
    socket.off("video-status");
  };
}, [roomId]);

  // -------------------------------
  // Socket listeners
  // -------------------------------










const [callDuration, setCallDuration] = useState("00:00:00");
const startTimeRef = useRef(null);
const timerRef = useRef(null);



 const [isCaller, setIsCaller] = useState(false);
 const isCallerRef = useRef(false);
const ringingAudioRef = useRef(null);

const [isLoud, setIsLoud] = useState(false);

useEffect(() => {
  if (ringingAudioRef.current) {
 
    ringingAudioRef.current.volume = 0.1; // 🔊 Initial volume
  }
}, []);
const toggleRingtoneVolume = () => {
  if (!ringingAudioRef.current) return;

  if (isLoud) {
    ringingAudioRef.current.volume = 0.1; // back to normal
    setIsLoud(false);
  } else {
    ringingAudioRef.current.volume = 0.8; // loud mode
    setIsLoud(true);
  }
};

 
useEffect(() => {
 if (!roomId || !myPhone) return;
   if (!socket.hasJoined) {
   
    socket.emit("join_call", { roomId, myPhone });
    socket.hasJoined = true;   // custom flag
  }

  // If this user is the caller, start the call
// Caller (first user)
socket.on("you-are-caller", () => {
  setIsCaller(true);
  isCallerRef.current = true;
  
  setStatus("Ringing...");
   if (ringingAudioRef.current) {
    ringingAudioRef.current.play().catch(err => {
      console.error("Autoplay prevented:", err);
    });
  }
});

socket.on("user-joined", () => {
  setStatus("Connected, calling...");
  setIsConnected(true);
   if (ringingAudioRef.current) {
    ringingAudioRef.current.pause();
    ringingAudioRef.current.currentTime = 0;
  }
  if (isCallerRef.current) {
    startCall(); // guaranteed to run for the caller
  }
   startTimeRef.current = new Date();
  timerRef.current = setInterval(() => {
    const now = new Date();
    const diff = Math.floor((now - startTimeRef.current) / 1000); // seconds

    const hrs = String(Math.floor(diff / 3600)).padStart(2, "0");
    const mins = String(Math.floor((diff % 3600) / 60)).padStart(2, "0");
    const secs = String(diff % 60).padStart(2, "0");
    const duration = `${hrs}:${mins}:${secs}`;
    setCallDuration(duration);
     socket.emit("duration", { duration, roomId });
  }, 1000);
});
// Callee (second user)
socket.on("you-are-callee", () => {
  setIsCaller(false);
  setStatus("Joining call...");
    setIsConnected(true);
  // Callee waits for offer from caller, no startCall()
});
socket.on("another-call", () => {
   setStatus("On another call");
   
  });
 socket.on("duration", ({ duration }) => {
    setCallDuration(duration); // update from caller broadcast
  });
socket.on("offer", async ({ offer }) => {
  try {
    // Ensure peerConnection exists
    if (!peerConnectionRef.current) {
      peerConnectionRef.current = new RTCPeerConnection();

      // Handle remote track
      peerConnectionRef.current.ontrack = (event) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      // ICE candidates
      peerConnectionRef.current.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("ice-candidate", { candidate: event.candidate, roomId });
        }
      };
    }

    // ✅ Always grab local stream BEFORE setting remote desc (mobile needs this)
    if (!localStreamRef.current) {
      localStreamRef.current = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });

      // Start with video off
      localStreamRef.current.getVideoTracks().forEach(track => {
        track.enabled = false;
      });
      setIsVideoOff(true);

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStreamRef.current;
      }

      // Add local tracks
      localStreamRef.current.getTracks().forEach((track) => {
        peerConnectionRef.current.addTrack(track, localStreamRef.current);
      });
    }

    // ✅ Always set remote description (don’t skip)
    await peerConnectionRef.current.setRemoteDescription(
      new RTCSessionDescription(offer)
    );

    // ✅ Create and send answer (only if not already answered)
    if (!peerConnectionRef.current.currentLocalDescription) {
      const answer = await peerConnectionRef.current.createAnswer();
      await peerConnectionRef.current.setLocalDescription(answer);
      socket.emit("answer", { answer, roomId });
    }

  } catch (err) {
    console.error("Error handling offer:", err);
  }
});


  socket.on("answer", async ({ answer }) => {
    await peerConnectionRef.current.setRemoteDescription(
      new RTCSessionDescription(answer)
    );
  });

  socket.on("ice-candidate", async ({ candidate }) => {
    try {
      await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (err) {
      console.error("Error adding ICE candidate", err);
    }
  });

  socket.on("end-call", () => {
    endCall();
  });

  return () => {
    socket.off("you-are-caller");
    socket.off("user-joined");
    socket.off("offer");
    socket.off("answer");
    socket.off("ice-candidate");
    socket.off("end-call");
    socket.off("another-call");
    socket.off("duration");
  };
}, [roomId , myPhone]);


// camera rotation is starting from here 
const [isFrontCamera, setIsFrontCamera] = useState(true);
const switchCamera = async () => {
  if (!localStreamRef.current) return;

  // Stop the current video track
  localStreamRef.current.getVideoTracks().forEach(track => track.stop());

  // Request a new stream with opposite facing mode
  const newStream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: isFrontCamera ? "environment" : "user" },
    audio: true,
  });

  const newVideoTrack = newStream.getVideoTracks()[0];

  // Replace the video track in the PeerConnection
  const sender = peerConnectionRef.current
    ?.getSenders()
    .find(s => s.track && s.track.kind === "video");
  if (sender) {
    sender.replaceTrack(newVideoTrack);
  }

  // Update localStreamRef with the new stream
  localStreamRef.current = newStream;

  // Show in local preview
  if (localVideoRef.current) {
    localVideoRef.current.srcObject = newStream;
  }

  // Flip camera state
  setIsFrontCamera(prev => !prev);
};

// camera rotation is ending here 


// flash light onoff is starting from here
const [isFlashOn, setIsFlashOn] = useState(false);
const toggleFlash = async () => {
  if (!localStreamRef.current) return;

  const videoTrack = localStreamRef.current.getVideoTracks()[0];
  if (!videoTrack) return;

  const capabilities = videoTrack.getCapabilities();
  if (!capabilities.torch) {
    alert("Flash not supported on this device");
    return;
  }

  try {
    await videoTrack.applyConstraints({
      advanced: [{ torch: !isFlashOn }]
    });
    setIsFlashOn(prev => !prev);
  } catch (err) {
    console.error("Error toggling flash:", err);
  }
};



// flash light onoff is ending here



const [you , setYou]=useState([]);
useEffect(() => {
  const fetchContacts = async () => {
    try {
      // Use sessionStorage first, then fallback to cookies
      

      if (!myPhone) {
        console.warn("No phone number found in sessionStorage or cookies.");
        return;
      }

      const res = await fetch(`${backendUrl}api/fetchYou`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone : myPhone}),
      });

      if (!res.ok) throw new Error("Failed to fetch your profile");

      const data = await res.json();
    
         
    //  console.log("Fetched profile data:", data); // 🧪 Check this

  setYou(data);
    } catch (error) {
      console.error("Error fetching your profile:", error);
    }
  };

  fetchContacts();

  

  
}, []);




 




// const toggleLoudSpeaker = () => {
//   if (!remoteVideoRef.current) return;

//   if (isLoudSpeaker) {
   
//     remoteVideoRef.current.volume = 0.3;
//     setIsLoudSpeaker(false);
//   } else {
   
//     remoteVideoRef.current.volume = 1.0;
//     setIsLoudSpeaker(true);
//   }
// };











const hasVideo = localStreamRef.current?.getVideoTracks().some(track => track.enabled);

  return (
    <div className="main-video-call" >
      {/* Video Section */}
      <audio
  ref={ringingAudioRef}
  src="./Sounds/ringing-sound.mp3"  // 👈 put your ringtone file in `public/` folder
  loop className="ringing-tone"
/>


      {
        !isConnected ? (
                <div className="normal-call-section">
          <img  src={`https://res.cloudinary.com/dnd9qzxws/image/upload/v1743761726/${contactDp}`} className="call-dp" alt="not found" />
      <h2>{callusername}</h2>
      <h3>{status}</h3>
      </div>
        ) : (
            <div className="video-section">
       
         <div className="other-video-logo" 
          style={{
           display: isRemoteVideoOff ? "none" : "flex",
         }}
         >
           <img  src={`https://res.cloudinary.com/dnd9qzxws/image/upload/v1743761726/${contactDp}`}  alt="not found" />
      <p>{callusername}
           {remoteMuted &&(
  <span> (Muted)</span>
) }

      </p>
      </div>
      
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
         style={{
           display: isRemoteVideoOff ? "none" : "block",
         }}
          className="other-video"
        />
       {
        isRemoteVideoOff &&(
            <div className="other-video-off">
           <img  src={`https://res.cloudinary.com/dnd9qzxws/image/upload/v1743761726/${contactDp}`} className="call-dp" alt="not found" />
      <h1>{callusername}</h1>
      <p>+91 {contactPhone}</p>
      <h3>Oncall <GoDotFill className="green-dot"/>
      {remoteMuted &&(
  <span className="muted">(Muted)</span>
) }
      </h3>


      <p className="call-duration">{callDuration}</p>





         </div>
        )
       }


          {/* Own Video (always rendered, just hidden when OFF) */}
<div  className="own-video-overlay" style={{ display: isVideoOff ? "none" : "block"}}>
<video
  ref={localVideoRef}
  autoPlay
  muted
  playsInline
  className="own-video"
  style={{
   
    borderRadius: "10px",
    backgroundColor: "#222",
    display: isVideoOff ? "none" : "block",  // 👈 hide instead of unmount
  }}
/>


  <IoCameraReverseSharp size={27}  onClick={switchCamera} style={{color: isFrontCamera ? "rgba(173, 208, 255, 1)":"#aeffd5ff",
      
      position:"absolute",
      bottom: "5px",   
      right: "5px",   
      backgroundColor: isFrontCamera ? "none" : "none",
      border: "none",
      
      borderRadius: "50%",
      cursor: "pointer",
      pointerEvents: isConnected ? "auto" : "none",
      opacity: isConnected ? 1 : 0.5,
      WebkitTapHighlightColor: "transparent",
      boxShadow: "0px 2px 6px rgba(0,0,0,0.3)" // 👈 সুন্দর shadow




  }}/>




</div>




{isVideoOff && (
  <div className="own-video-off">
    {you.map((profile)=>(
<img src={`https://res.cloudinary.com/dnd9qzxws/image/upload/v1743761726/${profile.dp}`}  key={profile.id} alt="Not found"/>
))}
      <h2>You</h2>
     
  </div>
)}

           



      </div>
        )
      }
      
     
      
      
 

      {/* Control Buttons */}
      <div style={{ display: "flex", gap: "15px" }} className="call-btn">
        <button
          onClick={toggleMute}
          style={{
  backgroundColor: isMuted ? "gray" : "white",
  border: "none",
  padding: "10px",
  borderRadius: "50%",
  cursor: "pointer",
  pointerEvents: isConnected ? "auto" : "none",
  opacity: isConnected ? 1 : 0.5,
  WebkitTapHighlightColor: "transparent",  // 👈 added here
}}
        >
          {
            isMuted ?(
             <MdMicOff size={24} color="white" />
            ) :(
               <MdMic size={24} color="black" />
            )
          }
         
        </button>

        <button
          onClick={toggleVideo}
          style={{
            backgroundColor: isVideoOff ? "gray" : "white",
            border: "none",
            padding: "10px",
            borderRadius: "50%",
            cursor: "pointer",
             pointerEvents: isConnected ? "auto" : "none",  
            opacity: isConnected ? 1 : 0.5,  
            WebkitTapHighlightColor: "transparent",
          }}
        >
         {
             isVideoOff ?
             (
              <MdVideocamOff size={24} color="white" />
                 
             ) : (
                <MdVideocam size={24} color="black" />
             )
            }
         
       
        </button>







<button
  onClick={toggleFlash}
  style={{
    backgroundColor: isFlashOn ? "white" : "gray",
    border: "none",
    padding: "10px",
    borderRadius: "50%",
    cursor: "pointer",
    pointerEvents: isConnected ? "auto" : "none",
    opacity: isConnected ? 1 : 0.5,
    WebkitTapHighlightColor: "transparent",
  }}
>
  {isFlashOn ? (
    <IoMdFlash size={24} style={{color: "black"}}/>
  ) : (
    <IoMdFlashOff size={24}/>
  )}
</button> 







{
  isConnected ?(
       <button
 
  style={{
    backgroundColor: isLoudSpeaker ? "white" : "gray",
    border: "none",
    padding: "10px",
    borderRadius: "50%",
    cursor: "pointer",
   pointerEvents : "auto",
  
    WebkitTapHighlightColor: "transparent",
  }}
>
  {outputDevice === "bluetooth" ? (
    <FaBluetoothB size={24} style={{ color: isLoudSpeaker ? "black" : "white" }} />
  ) : outputDevice === "headphone" ? (
    <TbHeadphonesFilled  size={24} style={{ color: isLoudSpeaker ? "black" : "white" }} />
  ) : (
    <HiSpeakerWave size={24} style={{ color: isLoudSpeaker ? "black" : "white" }} />
  )}
</button>

  ):(
<button
 onClick={toggleRingtoneVolume}
  style={{
    backgroundColor: isLoud ? "white" : "gray",
    border: "none",
    padding: "10px",
    borderRadius: "50%",
    cursor: "pointer",
   pointerEvents : "auto",
  
    WebkitTapHighlightColor: "transparent",
  }}
>
  {outputDevice === "bluetooth" ? (
    <FaBluetoothB size={24} style={{ color: isLoud ? "black" : "white" }} />
  ) : outputDevice === "headphone" ? (
    <TbHeadphonesFilled  size={24} style={{ color: isLoud ? "black" : "white" }} />
  ) : (
    <HiSpeakerWave size={24} style={{ color: isLoud ? "black" : "white" }} />
  )}
</button>
  )
}













        <button
        className="end-call-btn"
          onClick={endCall}
         
        >
          <MdCallEnd size={24} color="#fff" />
        </button>
      </div>


    </div>
  );
};

export default CallPage;
