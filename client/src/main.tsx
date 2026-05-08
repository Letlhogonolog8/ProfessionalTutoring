import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Basic polyfills for WebRTC support
if (typeof window !== 'undefined') {
  // Add global reference for libraries that expect it
  window.global = window;
}

createRoot(document.getElementById("root")!).render(<App />);