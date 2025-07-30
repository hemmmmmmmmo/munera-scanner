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
        if (!devices || devices.length === 0) throw new Error("No camera found");

        const cameraId = devices[devices.length - 1].id;

        html5QrCodeRef.current = new Html5Qrcode(qrCodeRegionId);
        await html5QrCodeRef.current.start(
          cameraId,
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
          },
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
            } catch {
              setStatus("❌ Failed to connect to server");
              setStatusColor("red");
            }
          },
          (err) => {
            console.warn("Scan error:", err);
          }
        );
      } catch (err) {
        setStatus("❌ Camera error: " + (err?.message || "Unknown"));
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
    <div style={{ textAlign: "center", padding: "2rem" }}>
      <img
        src="https://res.cloudinary.com/dzg9ysvfy/image/upload/v1753788269/MUNERA_qao0gq.png"
        alt="MUNERA Logo"
        style={{ width: "100px", marginBottom: "10px" }}
      />
      <h1 style={{ fontSize: "24px" }}>MUNERA QR Scanner</h1>

      <div
        id={qrCodeRegionId}
        style={{
          width: "100%",
          maxWidth: "400px",
          margin: "0 auto",
          borderRadius: "12px",
          overflow: "hidden",
          aspectRatio: "1/1",
        }}
      />

      <p style={{ fontSize: "16px", color: statusColor, marginTop: "1rem" }}>
        {status}
      </p>
    </div>
  );
};

export default App;
