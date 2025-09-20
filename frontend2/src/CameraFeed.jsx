import React, { useRef, useEffect } from "react";

function Camerafeed() {
  const videoRef = useRef(null);

  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing camera: ", err);
      }
    }
    startCamera();
  }, []);

  return (
    <div>
      <h2>Live Camera Feed</h2>
      <video ref={videoRef} autoPlay playsInline style={{ width: "600px",height:"400px" }}/>
    </div>
  );
}

export default Camerafeed;
