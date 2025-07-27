import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [pin, setPin] = useState("");
  const navigate = useNavigate();

  const handleLogin = () => {
    const correctPin = "2025"; // Replace this with your real PIN
    if (pin === correctPin) {
      localStorage.setItem("authenticated", "true");
      navigate("/scanner");
    } else {
      alert("Incorrect PIN");
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>Staff Login</h1>
      <input
        type="password"
        value={pin}
        onChange={(e) => setPin(e.target.value)}
        placeholder="Enter PIN"
        style={{ padding: "10px", fontSize: "16px", marginRight: "10px" }}
      />
      <button
        onClick={handleLogin}
        style={{ padding: "10px 20px", fontSize: "16px" }}
      >
        Enter
      </button>
    </div>
  );
}
