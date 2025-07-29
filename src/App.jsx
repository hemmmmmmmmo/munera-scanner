import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

const App = () => {
  const qrCodeRegionId = "reader";
  const html5QrCodeRef = useRef(null);
  const [status, setStatus] = useState("Waiting to scan...");
  const [statusColor, setStatusColor] = useState("gray");

  useEffect(() => {
    async function startScanner() {
      try {
        const devices = await Html5Qrcode.getCameras();
        if (devices && devices.length) {
          const cameraId = devices[0].id;
          html5QrCodeRef.current = new Html5Qrcode(qrCodeRegionId);
          html5QrCodeRef.current.start(
            cameraId,
            { fps: 10, qrbox: 250 },
            async (decodedText) => {
              setStatus("🔍 Scanned! Processing...");
              setStatusColor("orange");

              try {
                const res = await fetch("https://munera-attendance-backend.onrender.com/scan", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ qr: decodedText }),
                });

                const data = await res.json();
                if (res.ok) {
                  setStatus(`✅ ${data.message}`);
                  setStatusColor("green");
                } else {
                  setStatus(`❌ ${data.error || "Error"}`);
                  setStatusColor("red");
                }
              } catch (err) {
                setStatus("❌ Failed to connect to server");
                setStatusColor("red");
              }
            },
            (errorMessage) => {
              // ignore scan errors
            }
          );
        } else {
          setStatus("❌ No camera devices found");
          setStatusColor("red");
        }
      } catch (err) {
        console.error("Camera access error:", err);
        setStatus(`❌ Camera error: ${err.message || err}`);
        setStatusColor("red");
      }
    }

    startScanner();

    return () => {
      html5QrCodeRef.current?.stop().then(() => {
        html5QrCodeRef.current?.clear();
      });
    };
  }, []);

  return (
    <div style={{ textAlign: "center", padding: "2rem", fontFamily: "Arial, sans-serif" }}>
      <img src="https://res.cloudinary.com/dzg9ysvfy/image/upload/v1753788269/MUNERA_qao0gq.png" alt="MUNERA Logo" style={{ width: "100px", marginBottom: "10px" }} />
      <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>MUNERA Scanner</h1>

      <div
        id={qrCodeRegionId}
        style={{
          width: "300px",
          height: "300px",
          margin: "20px auto",
          border: "2px solid #ddd",
          borderRadius: "10px",
        }}
      ></div>

      <p style={{ color: statusColor, fontWeight: "bold", fontSize: "1rem" }}>{status}</p>
      <p style={{ marginTop: "40px", fontSize: "0.9rem", color: "#666" }}>
        📍 NYU Abu Dhabi — Dec 2025
      </p>
    </div>
  );
};

export default App;
