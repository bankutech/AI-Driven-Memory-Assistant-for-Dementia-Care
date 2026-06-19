"use client";

import { useEffect, useRef, useState } from "react";
import { FaVideoSlash, FaVideo } from "react-icons/fa";

export default function LiveAssistant() {
  const videoRef = useRef(null);
  const pcRef = useRef(null);
  const [streamActive, setStreamActive] = useState(false);
  const [arOverlay, setArOverlay] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      setError(null);
      
      // 1. Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setStreamActive(true);

      // 2. Setup WebRTC Peer Connection
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
      });
      pcRef.current = pc;

      // Add tracks to PC
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      // Create Offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // Send Offer to Python Backend
      try {
        const response = await fetch("http://localhost:8000/offer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sdp: pc.localDescription.sdp,
            type: pc.localDescription.type,
          }),
        });

        if (response.ok) {
          const answer = await response.json();
          await pc.setRemoteDescription(answer);
          console.log("WebRTC connected to AI Engine");
        } else {
          console.warn("AI Backend not responding correctly. (Ensure uvicorn is running)");
        }
      } catch (err) {
        console.warn("Could not connect to AI backend. Operating in Local Camera mode only.", err);
      }

      // 3. Setup SSE Listener for AR Telemetry
      const eventSource = new EventSource("http://localhost:8000/stream/conversation");
      eventSource.addEventListener("conversation", (e) => {
        try {
          const data = JSON.parse(e.data);
          console.log("AR Telemetry received:", data);
          setArOverlay(data);
          
          // Clear overlay after 10 seconds of no face
          setTimeout(() => setArOverlay(null), 10000);
        } catch (err) {
          console.error("Error parsing SSE data", err);
        }
      });
      
      eventSource.onerror = () => {
        eventSource.close();
      };

    } catch (err) {
      console.error("Camera access denied or error:", err);
      setError("Could not access camera. Please allow camera permissions.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    setStreamActive(false);
    setArOverlay(null);
  };

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '70vh',
      backgroundColor: '#111827',
      borderRadius: '24px',
      overflow: 'hidden',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
      border: '1px solid #1f2937'
    }}>
      
      {/* Video Feed */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transition: 'opacity 0.7s ease',
          opacity: streamActive ? 1 : 0
        }}
      />

      {/* Placeholder / Empty State */}
      {!streamActive && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#9ca3af'
        }}>
          <div style={{ color: '#4b5563', marginBottom: '1rem', fontSize: '4rem' }}>
            <FaVideoSlash />
          </div>
          <p style={{ fontSize: '1.25rem', fontWeight: '500' }}>Camera is off</p>
          <p style={{ fontSize: '0.875rem', marginTop: '0.5rem', maxWidth: '400px', textAlign: 'center' }}>
            Start the Live Assistant to stream video to the AI Recognition Engine.
          </p>
          {error && (
            <p style={{
              color: '#ef4444',
              marginTop: '1rem',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              fontSize: '0.875rem'
            }}>{error}</p>
          )}
        </div>
      )}

      {/* AR HUD Overlay */}
      {streamActive && arOverlay && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 10,
          pointerEvents: 'none',
          transition: 'all 0.5s ease'
        }}>
          {/* Glassmorphism Bounding Box */}
          <div style={{
            position: 'relative',
            border: '2px solid #1E90FF',
            borderRadius: '12px',
            width: '256px',
            height: '320px',
            backgroundColor: 'rgba(30, 144, 255, 0.1)',
            backdropFilter: 'blur(2px)',
            boxShadow: '0 0 15px rgba(30,144,255,0.5)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end'
          }}>
            
            {/* Corner Bracket Accents */}
            <div style={{ position: 'absolute', top: '-2px', left: '-2px', width: '24px', height: '24px', borderTop: '4px solid #1E90FF', borderLeft: '4px solid #1E90FF', borderTopLeftRadius: '12px' }}></div>
            <div style={{ position: 'absolute', top: '-2px', right: '-2px', width: '24px', height: '24px', borderTop: '4px solid #1E90FF', borderRight: '4px solid #1E90FF', borderTopRightRadius: '12px' }}></div>
            <div style={{ position: 'absolute', bottom: '-2px', left: '-2px', width: '24px', height: '24px', borderBottom: '4px solid #1E90FF', borderLeft: '4px solid #1E90FF', borderBottomLeftRadius: '12px' }}></div>
            <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '24px', height: '24px', borderBottom: '4px solid #1E90FF', borderRight: '4px solid #1E90FF', borderBottomRightRadius: '12px' }}></div>

            {/* Info Panel */}
            <div style={{
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              backdropFilter: 'blur(8px)',
              padding: '1rem',
              borderRadius: '0 0 8px 8px',
              borderTop: '1px solid rgba(30, 144, 255, 0.3)',
              transform: 'translateY(100%)',
              marginTop: '0.5rem',
              transition: 'all 0.3s ease',
              pointerEvents: 'auto'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22c55e' }}></div>
                <h3 style={{ color: '#fff', fontWeight: 'bold', fontSize: '1.125rem' }}>{arOverlay.name}</h3>
              </div>
              <span style={{
                display: 'inline-block',
                padding: '2px 8px',
                backgroundColor: 'rgba(30, 144, 255, 0.2)',
                color: '#1E90FF',
                fontSize: '0.75rem',
                fontWeight: '600',
                borderRadius: '4px',
                marginBottom: '0.5rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                {arOverlay.relationship || 'Visitor'}
              </span>
              <p style={{
                color: '#d1d5db',
                fontSize: '0.875rem',
                lineHeight: '1.5',
                borderTop: '1px solid #374151',
                paddingTop: '0.5rem',
                marginTop: '0.25rem'
              }}>
                {arOverlay.description || 'No recent interactions recorded.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div style={{
        position: 'absolute',
        bottom: '1.5rem',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '1rem',
        zIndex: 20
      }}>
        {streamActive ? (
          <button 
            onClick={stopCamera}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              backgroundColor: '#dc2626',
              color: '#fff',
              border: 'none',
              borderRadius: '9999px',
              fontWeight: '500',
              cursor: 'pointer',
              boxShadow: '0 10px 15px -3px rgba(220, 38, 38, 0.2)',
              fontSize: '1rem'
            }}
          >
            <FaVideoSlash /> Stop Assistant
          </button>
        ) : (
          <button 
            onClick={startCamera}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 2rem',
              backgroundColor: '#1E90FF',
              color: '#fff',
              border: 'none',
              borderRadius: '9999px',
              fontWeight: '500',
              cursor: 'pointer',
              boxShadow: '0 10px 15px -3px rgba(30, 144, 255, 0.2)',
              fontSize: '1rem'
            }}
          >
            <FaVideo /> Start Live Assistant
          </button>
        )}
      </div>

    </div>
  );
}
