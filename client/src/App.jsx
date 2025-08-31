import { Toaster } from "react-hot-toast";
import { useRef, useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import NotificationBell from "./components/NotificationBell";
import { io } from "socket.io-client";

export const App = () => {
  return (
    <div className="min-h-screen flex flex-col justify-between">
      <Toaster />
      <Outlet />
    </div>
  );
};

export default App;
