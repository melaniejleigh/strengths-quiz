import { useState, useEffect } from "react";
import Quiz from "./Quiz.jsx";
import Admin from "./Admin.jsx";

function App() {
  const [route, setRoute] = useState("quiz");

  useEffect(() => {
    // Simple hash-based routing
    function handleHash() {
      setRoute(window.location.hash === "#/admin" ? "admin" : "quiz");
    }
    handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  if (route === "admin") return <Admin />;
  return <Quiz />;
}

export default App;
