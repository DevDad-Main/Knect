import { Toaster } from "react-hot-toast";
import { useRef, useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { useNavigate } from "react-router";
import AuthErrorHandler from "./components/AuthErrorHandler";
import { GoogleOAuthProvider } from "@react-oauth/google";

// You'll need to replace this with your actual Google OAuth Client ID
const GOOGLE_CLIENT_ID = "your-google-oauth-client-id-here";

export const App = () => {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <div className="min-h-screen flex flex-col justify-between">
        <Toaster />
        <AuthErrorHandler />
        <Outlet />
      </div>
    </GoogleOAuthProvider>
  );
};

export default App;
