// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// Make sure "root" exists in index.html
const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("❌ Root element not found. Check your index.html file.");
}

// React 18 rendering API
ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
