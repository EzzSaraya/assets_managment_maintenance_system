import { useEffect, useState } from "react";
import { healthCheck } from "./services/api";

function App() {
  const [message, setMessage] = useState("Checking backend connection...");

  useEffect(() => {
    healthCheck()
      .then((data) => setMessage(data.message))
      .catch(() => setMessage("Backend connection failed"));
  }, []);

  return (
    <div style={{ padding: "40px", fontFamily: "Arial" }}>
      <h1>Enterprise Asset and Maintenance Management System</h1>
      <h2>React Frontend</h2>
      <p>{message}</p>
    </div>
  );
}

export default App;