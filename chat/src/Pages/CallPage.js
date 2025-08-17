import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import io from "socket.io-client";
import { GoDotFill } from "react-icons/go";
import { IoCameraReverseSharp } from "react-icons/io5";
import { MdCallEnd, MdMicOff, MdMic, MdVideocam, MdVideocamOff } from "react-icons/md";

import { socket } from "./Socket";
const backendUrl = process.env.REACT_APP_BACKEND_URL; 
const CallPage = () => {
  
  const navigate = useNavigate();
const [isConnected, setIsConnected] = useState(false); // NEW

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [status,setStatus]=useState("Calling...");
  const callusername=sessionStorage.getItem("callusername");
    const [contactDp, setContactDp] = useState("");
  const myPhone=sessionStorage.getItem("myPhone");
  const roomId=sessionStorage.getItem("roomId");
    const contactPhone=sessionStorage.getItem("contactPhone");
  useEffect(() => {
    const dp = sessionStorage.getItem("contactDp") 
      || "https://res.cloudinary.com/dnd9qzxws/image/upload/v1743764088/image_dp_uwfq2g.png"; // fallback
    setContactDp(dp);
  }, []);


  // -------------------------------
  // Start the call
  // -------------------------------



  const startCall = async () => {
   
    peerConnectionRef.current = new RTCPeerConnection();

    // Handle remote stream
    peerConnectionRef.current.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
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
    // Stop local tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
    }

    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }

    socket.emit("end-call", { roomId });
    navigate("/calls"); // Go back to home after ending call
  };

  // -------------------------------
  // Toggle mute
  // -------------------------------
 const toggleMute = () => {
  if (!localStreamRef.current) return;

  localStreamRef.current.getAudioTracks().forEach((track) => {
    track.enabled = !track.enabled;
  });

  const newMuteState = !isMuted;
  setIsMuted(newMuteState);

 
  socket.emit("mute-status", { isMuted: newMuteState});
};

const [remoteMuted,setRemoteMuted]=useState(false);
useEffect(() => {
  socket.on("mute-status", ({ isMuted }) => {
    setRemoteMuted(isMuted); // state for showing remote muted status
  });

  return () => {
    socket.off("mute-status");
  };
}, []);

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
}, []);

  // -------------------------------
  // Socket listeners
  // -------------------------------
 const [isCaller, setIsCaller] = useState(false);
useEffect(() => {
 
   if (!socket.hasJoined) {
    socket.emit("join-room", roomId);
    socket.hasJoined = true;   // 👈 custom flag
  }

  // If this user is the caller, start the call
  socket.on("you-are-caller", () => {
    
    startCall();
    setStatus("Ringing...");
   
  });

  // If the caller hears that someone joined, they start the call
  socket.on("user-joined", () => {
  startCall();
  setStatus("Connected");
  setIsConnected(true);
  });

  socket.on("offer", async ({ offer }) => {
    // Only run if not already connected
    if (!peerConnectionRef.current) {
      peerConnectionRef.current = new RTCPeerConnection();

      peerConnectionRef.current.ontrack = (event) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      localStreamRef.current = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      localStreamRef.current.getVideoTracks().forEach(track => {
  track.enabled = false;
});
setIsVideoOff(true);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStreamRef.current;
      }
      localStreamRef.current.getTracks().forEach((track) => {
        peerConnectionRef.current.addTrack(track, localStreamRef.current);
      });

      peerConnectionRef.current.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("ice-candidate", { candidate: event.candidate, roomId });
        }
      };
    }

    await peerConnectionRef.current.setRemoteDescription(
      new RTCSessionDescription(offer)
    );

    const answer = await peerConnectionRef.current.createAnswer();
    await peerConnectionRef.current.setLocalDescription(answer);
    socket.emit("answer", { answer, roomId });
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
  };
}, [roomId]);


// camera rotation is starting from here 
const [isFrontCamera, setIsFrontCamera] = useState(true);
// add at top inside your component
const [cameraIndex, setCameraIndex] = useState(0); // 👈 current camera index
const [videoDevices, setVideoDevices] = useState([]); // 👈 store all available video devices

useEffect(() => {
  // Fetch available video devices once
  navigator.mediaDevices.enumerateDevices().then((devices) => {
    const cams = devices.filter((d) => d.kind === "videoinput");
    setVideoDevices(cams);
  });
}, []);

// --- Switch camera function ---
const switchCamera = async () => {
  if (videoDevices.length < 2) {
    alert("Only one camera available");
    return;
  }

  try {
    const nextIndex = (cameraIndex + 1) % videoDevices.length;
    const newStream = await navigator.mediaDevices.getUserMedia({
      video: { deviceId: { exact: videoDevices[nextIndex].deviceId } },
      audio: true,
    });

    const newVideoTrack = newStream.getVideoTracks()[0];

    // Replace in peer connection
    const sender = peerConnectionRef.current
      ?.getSenders()
      .find((s) => s.track && s.track.kind === "video");

    if (sender) {
      sender.replaceTrack(newVideoTrack);
    }

    // Stop old track
    localStreamRef.current.getVideoTracks().forEach((t) => t.stop());

    // Assign new stream
    localStreamRef.current = newStream;
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = newStream;
    }

    // Respect video on/off state
    newVideoTrack.enabled = !isVideoOff;

    setCameraIndex(nextIndex); //  update index
  } catch (err) {
    console.error("Error switching camera:", err);
  }
};

// camera rotation is ending here 







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


















const hasVideo = localStreamRef.current?.getVideoTracks().some(track => track.enabled);

  return (
    <div className="main-video-call" >
      {/* Video Section */}
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
         </div>
        )
       }


          {/* Own Video (always rendered, just hidden when OFF) */}
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
  backgroundColor: isMuted ? "gray" : "#444",
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
             <MdMicOff size={24} color="#fff" />
            ) :(
               <MdMic size={24} color="#fff" />
            )
          }
         
        </button>

        <button
          onClick={toggleVideo}
          style={{
            backgroundColor: isVideoOff ? "gray" : "#444",
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
              <MdVideocamOff size={24} color="#fff" />
                 
             ) : (
                <MdVideocam size={24} color="#fff" />
             )
            }
         
       
        </button>




       <button
  onClick={switchCamera}
  style={{
    backgroundColor: "#444",
    border: "none",
    padding: "10px",
    borderRadius: "50%",
    cursor: "pointer",
    pointerEvents: isConnected ? "auto" : "none",
    opacity: isConnected ? 1 : 0.5,
    WebkitTapHighlightColor: "transparent",
  }}
>
  <IoCameraReverseSharp size={24}/>
</button>















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
