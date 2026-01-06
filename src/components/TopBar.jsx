import React, { useState, useEffect } from "react";
import ThemeToggle from "./ThemeToggle";
import { LogOut, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useApp } from "./AppContext";
import toast from "react-hot-toast";
import { googleLogout } from "@react-oauth/google";

const TopBar = () => {
  const navigate = useNavigate();
  const { user, updateUser, getNotifications } = useApp();
  const [notifications, setNotifications] = useState([]);
  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await getNotifications();
        if (data) {
          setNotifications(data);
        }
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      }
    };

    fetchNotifications();
    const refresh = () => fetchNotifications();
    window.addEventListener("refreshNotifications", refresh);
    return () => window.removeEventListener("refreshNotifications", refresh);
  }, [getNotifications]);

  const signoutUser = async () => {
    try {
      console.log("Clicked Logout button");

      const response = await updateUser("v1/users/logout", {}, "POST");

      if (response) {
        console.log("Logout response", response);
        if (user?.authProvider === "google") {
          // Clears the Google OAuth session and above because if we have a success we clear the cookies as well
          googleLogout();
        }

        navigate("/login");
        toast.success("Logged out successfully");
      } else {
        toast.error("Logout failed");
      }
    } catch (error) {
      toast.error(error.message || "Logout failed");
      console.log(error);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-30 bg-primary border-b border-secondary px-4 py-3 lg:px-6 lg:hidden">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <h1 
            onClick={() => window.location.href = '/feed'}
            className="text-xl font-bold text-purple-700 dark:text-purple-400 lg:hidden cursor-pointer transition-colors duration-200 hover:text-purple-800 dark:hover:text-purple-300"
          >
            Knect
          </h1>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Mobile only: Notification bell */}
          <div className="relative lg:hidden">
            <button
              onClick={() => navigate("/notifications")}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full min-w-[18px] h-4 px-1 flex items-center justify-center text-xs font-medium">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
          
          {/* Mobile only: Theme toggle */}
          <div className="lg:hidden">
            <ThemeToggle />
          </div>
          
          {/* Mobile only: Logout button */}
          <button
            onClick={signoutUser}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 group lg:hidden"
            aria-label="Logout"
          >
            <LogOut className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default TopBar;