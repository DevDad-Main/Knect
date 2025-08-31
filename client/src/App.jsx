import { Toaster } from "react-hot-toast";
import { useRef, useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import NotificationBell from "./components/NotificationBell";
import { io } from "socket.io-client";

export const App = () => {
  const [notifications, setNotifications] = useState([]);
  const socket = useRef(null);

  useEffect(() => {
    socket.current = io(import.meta.env.VITE_BASEURL, {
      auth: { token: sessionStorage.getItem("token") },
      transports: ["websocket"],
      withCredentials: true,
    });

    socket.current.on("notification", (notification) => {
      setNotifications((prev) => [notification, ...prev]);

      // Optional: live toast
      // toast.success(`${notification.from.full_name} sent you a message`);
    });

    return () => {
      socket.current.disconnect();
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <Toaster />

      {/* Fixed header with bell */}
      <header className="flex items-center justify-end p-4 shadow bg-transparent">
        <NotificationBell
          notifications={notifications}
          setNotifications={setNotifications}
        />
      </header>
      <Outlet />
    </div>
  );
};

export default App;
