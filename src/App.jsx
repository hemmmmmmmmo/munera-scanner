import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

const App = () => {
  const qrCodeRegionId = "reader";
  const html5QrCodeRef = useRef(null);
  const [status, setStatus] = useState("Waiting to scan...");
  const [statusColor, setStatusColor] = useState("gray");
  const [manualId, setManualId] = useState("");

  useEffect(() => {
    async function startScanner() {
      try {
        const devices = await Html5Qrcode.getCameras();
        if (!devices || devices.length === 0) throw new Error("No camera found");

        const backCamera = devices.find(d => /back|rear|wide/i.test(d.label)) || devices[0];

        html5QrCodeRef.current = new Html5Qrcode(qrCodeRegionId);
        await html5QrCodeRef.current.start(
          backCamera.id,
          {
            fps: 10,
            qrbox: { width: 200, height: 300 },
            aspectRatio: 1.0,
            disableFlip: true,
            experimentalFeatures: {
              useBarCodeDetectorIfSupported: true,
            },
          },
          async (decodedText) => {
            console.log("SCANNED TEXT:", decodedText);
            setStatus("🔍 Scanned! Processing...");
            setStatusColor("orange");

            let id;
            try {
              const url = new URL(decodedText);
              id = url.searchParams.get("id");
            } catch {
              id = null;
            }

            if (!id) {
              setStatus("❌ Invalid QR code");
              setStatusColor("red");
              return;
            }

            await submitId(id);
          },
          (err) => console.warn("Scan error:", err)
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

  async function submitId(id) {
    try {
      const res = await fetch("https://munera-attendance-backend.onrender.com/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, scannedBy: "MUNERA Staff" }),
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
      console.error("Fetch error:", err);
      setStatus("❌ Failed to connect to server");
      setStatusColor("red");
    }
  }

  const handleManualSubmit = () => {
    if (!manualId.trim()) {
      setStatus("❌ Enter a valid ID");
      setStatusColor("red");
      return;
    }
    setStatus("🔍 Submitting manually...");
    setStatusColor("orange");
    submitId(manualId.trim());
    setManualId("");
  };

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

      {/* ✅ Manual Fallback Input */}
      <div style={{ marginTop: "2rem" }}>
        <input
          type="text"
          placeholder="Enter Delegate ID"
          value={manualId}
          onChange={(e) => setManualId(e.target.value)}
          style={{
            padding: "10px",
            fontSize: "16px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            width: "70%",
            maxWidth: "300px",
          }}
        />
        <br />
        <button
          onClick={handleManualSubmit}
          style={{
            marginTop: "10px",
            padding: "10px 20px",
            fontSize: "16px",
            borderRadius: "8px",
            border: "none",
            backgroundColor: "#4a00e0",
            color: "white",
            cursor: "pointer",
          }}
        >
          Submit ID Manually
        </button>
      </div>

      <p style={{ fontSize: "16px", color: statusColor, marginTop: "1rem" }}>
        {status}
      </p>
    </div>
  );
};

export default App;
