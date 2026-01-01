import { Toaster } from "react-hot-toast";
import { useRef, useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { useNavigate } from "react-router";
import AuthErrorHandler from "./components/AuthErrorHandler";

export const App = () => {
  return (
    <div className="min-h-screen flex flex-col justify-between">
      <Toaster />
      <AuthErrorHandler />
      <Outlet />
    </div>
  );
};

export default App;
