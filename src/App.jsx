import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

const App = () => {
  const qrCodeRegionId = "reader";
  const html5QrCodeRef = useRef(null);
  const [status, setStatus] = useState("Waiting to scan...");

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

              try {
                const res = await fetch("https://munera-attendance-backend.onrender.com/scan", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ qr: decodedText }),
                });

                const data = await res.json();
                if (res.ok) {
                  setStatus(`✅ ${data.message}`);
                } else {
                  setStatus(`❌ ${data.error || "Error"}`);
                }
              } catch (err) {
                setStatus("❌ Failed to connect to server");
              }
            },
            (errorMessage) => {
              // ignore scan errors
            }
          );
        } else {
          setStatus("❌ No camera devices found");
        }
      } catch (err) {
        console.error("Camera access error:", err);
        setStatus(`❌ Camera error: ${err.message || err}`);
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
    <div style={{ textAlign: "center", paddingTop: "2rem" }}>
      <h1>MUNERA Scanner</h1>
      <div id={qrCodeRegionId} style={{ width: "300px", margin: "auto" }} />
      <p>{status}</p>
    </div>
  );
};

export default App;
