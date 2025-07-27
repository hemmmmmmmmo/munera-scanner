import { useState } from "react";

export default function Login({ onLogin }) {
  const [pin, setPin] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (pin === "1234") {
      onLogin();
    } else {
      alert("Incorrect PIN");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-96">
        <h1 className="text-2xl font-bold mb-4">Staff Login</h1>
        <input
          type="password"
          placeholder="Enter PIN"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded mb-4"
        />
        <button
          type="submit"
          className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700 transition"
        >
          Enter
        </button>
      </form>
    </div>
  );
}

