import { useEffect } from "react";
import "./App.css";
import Lobby from "./components/Lobby";
import { purgeExpiredKeys } from "./utils/storageCleanUp";

function App() {
  useEffect(() => {
    purgeExpiredKeys("local");
    purgeExpiredKeys("session");
  }, []);
  return <Lobby />;
}

export default App;
