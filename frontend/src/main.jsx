// Entry point for the React application. This file mounts the app
// into the DOM and wraps it with any top-level providers.
import React from "react";
import ReactDOM from "react-dom/client";
// BrowserRouter enables client-side routing for the app.
import { BrowserRouter } from "react-router-dom";
// Root application component.
import App from "./App.jsx";
// AuthProvider supplies authentication context to the component tree.
import { AuthProvider } from "./context/AuthContext.jsx";
// Global stylesheet for the app (Tailwind + custom CSS).
import "./index.css";

// Find the DOM node to mount the React app into.
const container = document.getElementById("root");

// Create a root for React 18+ concurrent rendering APIs.
const root = ReactDOM.createRoot(container);

/*
  Render tree (top-down):
  - React.StrictMode: development-only checks and warnings.
  - BrowserRouter: enables routes, history, and navigation.
  - AuthProvider: provides authentication state and helpers via context.
  - App: main application component that contains routes/views.
*/
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
