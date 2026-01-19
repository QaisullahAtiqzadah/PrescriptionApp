import { useState } from "react";
import { checkActivation } from "./utils/activation.js";

export default function Activate({ onActivated }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");
    if (!code.trim()) return setError("Please enter activation code");

    try {
      const success = await checkActivation(code.trim());
      if (success) onActivated();
      else setError("Invalid activation code");
    } catch (e) {
      console.error("Activation failed", e);
      setError("Activation failed. Try again.");
    }
    
  };

  return (
    <div style={{ padding: 40, maxWidth: 400, margin: "0 auto" }}>
      <h2>Activation Required</h2>
      <input
        type="password"
        placeholder="Enter activation code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        style={{ width: "100%", padding: "8px", marginBottom: "10px", fontSize: "16px" }}
      />
      <button
        onClick={handleSubmit}
        style={{ width: "100%", padding: "10px", fontSize: "16px", cursor: "pointer" }}
      >
        Activate
      </button>
      {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}
    </div>
  );
}
