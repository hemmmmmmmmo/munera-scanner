import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

export default function App() {
  const qrRef = useRef(null);
  const [status, setStatus] = useState('Scan a QR code to begin');

  useEffect(() => {
    const scanner = new Html5Qrcode("qr-reader");

    scanner
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: 250 },
        async (decodedText) => {
          scanner.stop();
          setStatus("⏳ Verifying...");

          try {
            const res = await fetch(
              `https://munera-attendance-backend.onrender.com/scan?id=${encodeURIComponent(decodedText)}`
            );
            const data = await res.json();
            setStatus(`✅ ${data.message}`);
          } catch (err) {
            setStatus("❌ Failed to contact server");
          }

          setTimeout(() => {
            setStatus("Ready for next scan...");
            scanner.start(
              { facingMode: 'environment' },
              { fps: 10, qrbox: 250 },
              () => {}, // skip repeated logic for now
              () => {}
            );
          }, 3000);
        },
        (error) => {
          // console.log("Scan error", error);
        }
      )
      .catch((err) => {
        setStatus("❌ Failed to start scanner: " + err);
      });

    return () => {
      scanner.stop().catch(() => {});
    };
  }, []);

  return (
    <div style={{ padding: 20, textAlign: 'center' }}>
      <h2>MUNERA QR Scanner</h2>
      <div id="qr-reader" ref={qrRef} style={{ width: "300px", margin: "0 auto" }}></div>
      <p style={{ marginTop: '20px', fontWeight: 'bold' }}>{status}</p>
    </div>
  );
}
