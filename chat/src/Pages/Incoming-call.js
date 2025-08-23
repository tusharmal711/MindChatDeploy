import { useRef, useState } from "react";
import { MdCallEnd,MdCall } from "react-icons/md";


const Incoming=({ callerInfo, onAccept, onReject }) =>{
    const {username,dp,phone}=callerInfo;

  const acceptRef = useRef(null);
  const rejectRef = useRef(null);
  const [dragging, setDragging] = useState({ accept: false, reject: false });
  const [startY, setStartY] = useState(0);

  const handleMouseDown = (type, e) => {
    setDragging({ accept: type === "accept", reject: type === "reject" });
    setStartY(e.clientY || e.touches[0].clientY);
  };

  const handleMouseMove = (e) => {
    if (!dragging.accept && !dragging.reject) return;
    const currentY = e.clientY || e.touches[0].clientY;
    const diff = startY - currentY; // Swipe up = positive

    const ref = dragging.accept ? acceptRef.current : rejectRef.current;
    if (ref) {
      ref.style.transform = `translateY(${-Math.min(diff, 100)}px)`; // max 100px
      ref.style.opacity = `${1 - Math.min(diff / 100, 1)}`;
    }
  };

  const handleMouseUp = () => {
    const ref = dragging.accept ? acceptRef.current : rejectRef.current;
    if (ref) {
      const transformY = parseFloat(ref.style.transform.replace("translateY(", ""));
      if (transformY <= -80) {
        // trigger action
        dragging.accept ? onAccept() : onReject();
      } 
      // Reset button
      ref.style.transform = "translateY(0)";
      ref.style.opacity = "1";
    }
    setDragging({ accept: false, reject: false });
  };

  return (
    <div
      className="incoming-call-main-container"
      style={{
        backgroundImage: `url("./Images/call-background.png")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onTouchMove={handleMouseMove}
      onTouchEnd={handleMouseUp}
    >
      <h1>Incoming call...</h1>

      <img
        className="caller-dp"
        src={`https://res.cloudinary.com/dnd9qzxws/image/upload/v1743761726/${dp}`}
        onError={(e) => {
          e.target.src =
            "https://res.cloudinary.com/dnd9qzxws/image/upload/v1743764088/image_dp_uwfq2g.png";
        }}
        alt="Caller DP"
      />

      <p>{username}</p>
      <p>+91 {phone}</p>

      <div className="incoming-call-actions">
         <button
          ref={rejectRef}
          className="reject"
          onMouseDown={(e) => handleMouseDown("reject", e)}
          onTouchStart={(e) => handleMouseDown("reject", e)}
        >
          <MdCallEnd size={24} color="#fff" />
        </button>




        <button
          ref={acceptRef}
          className="accept"
          onMouseDown={(e) => handleMouseDown("accept", e)}
          onTouchStart={(e) => handleMouseDown("accept", e)}
        >
              <MdCall size={24} color="#fff" />
          
        </button>
        
      </div>
    </div>
  );
}

export default Incoming;