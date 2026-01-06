import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate, matchPath } from "react-router-dom";
import MenuItems from "./MenuItems";
import { CirclePlus, LogOut, User, UserIcon, Bell } from "lucide-react";
import { useApp } from "../components/AppContext";
import toast from "react-hot-toast";
import RecentMessages from "./RecentMessages";
import NotificationBell from "./NotificationBell";
import ThemeToggle from "./ThemeToggle";
import { io } from "socket.io-client";
import { googleLogout } from "@react-oauth/google";

const SideBar = ({ sideBarOpen, setSideBarOpen }) => {
  const [notifications, setNotifications] = useState([]);
  const { user, getNotifications, updateUser } = useApp();
  const socket = useRef(null);
  const location = useLocation();

  // Ref to always have the latest pathname
  const locationRef = useRef(location.pathname);
  useEffect(() => {
    locationRef.current = location.pathname;
  }, [location.pathname]);

  const isInChatWith = (userId) => {
    return locationRef.current === `/messages/${userId}`;
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    socket.current = io(import.meta.env.VITE_BASEURL, {
      // No manual token needed - cookies will be sent automatically
      transports: ["websocket"],
      withCredentials: true,
    });

    socket.current.on("notification", async (notification) => {
      if (
        notification.type === "message" &&
        isInChatWith(notification.from._id)
      ) {
        // delete it from DB
        const id = notification._id;
        await updateUser(`v1/notifications/delete/${id}`, {}, "DELETE");

        // also remove it locally (just in case it sneaks in)
        setNotifications((prev) => prev.filter((n) => n._id !== id));

        return; // 🚀 stop here so we don’t add it
      }

      // otherwise add to notifications
      setNotifications((prev) => [notification, ...prev]);
    });

    return () => {
      socket.current.disconnect();
    };
  }, []);

  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      const data = await getNotifications();
      if (data) {
        setNotifications(data); // preload from DB
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    // fetchNotifications();
  }, []);

  console.log("USER ", user)

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

  useEffect(() => {
    const refresh = () => fetchNotifications();
    window.addEventListener("refreshNotifications", refresh);
    return () => window.removeEventListener("refreshNotifications", refresh);
  }, []);
  // const { signOut } = console.log("Sign Out");

  return (
    <div
      className={`w-60 xl:w-72 bg-primary border-r border-primary flex flex-col justify-between items-center
    fixed top-0 left-0 bottom-0 z-20
    ${sideBarOpen ? "translate-x-0" : "-translate-x-full"}
    transition-all duration-300 ease-in-out`}
    >
      <div className="w-full">
        {/* <img */}
        {/*   onClick={() => navigate("/")} */}
        {/*   src={assets.logo} */}
        {/*   className="w-26 ml-7 my-2 cursor-pointer" */}
        {/* /> */}
        <div className="flex mt-2 relative">
          <h1
            onClick={() => navigate("/feed")}
            className="w-26 ml-7 my-2 text-purple-700 text-2xl font-bold cursor-pointer flex-1 dark:text-purple-400 lg:ml-7 lg:flex-1 ml-16"
          >
            Knect
          </h1>

          <div className="flex items-center gap-2 mr-3 mt-3">
            <ThemeToggle />
            <div className="relative">
              <Bell
                setSideBarOpen={setSideBarOpen}
                onClick={() => {
                  navigate("/notifications");
                  setSideBarOpen(false);
                }}
                className="w-6 h-6 text-gray-700 dark:text-gray-300 cursor-pointer"
              />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full min-w-[18px] h-4 px-1 flex items-center justify-center text-xs font-medium">
                  {unreadCount}
                </span>
              )}
            </div>
          </div>
        </div>
        <hr className="border-secondary mb-8" />
        <MenuItems setSideBarOpen={setSideBarOpen} />
        {/* <div className="m-3 lg:hidden"> */}
        {/*   <RecentMessages /> */}
        {/* </div> */}
        <Link
          to="/create-post"
          className="flex items-center justify-center gap-2 py-2.5 mt-6 mx-6 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-700 hover:to-purple-800 active:scale-95 transition text-white cursor-pointer"
        >
          <CirclePlus className="w-5 h-5" />
          Create Post
        </Link>
      </div>

      <div className="w-full border-t border-secondary p-4 px-7 flex items-center justify-between">
        <div className="flex gap-2 items-center cursor-pointer">
          {/* <User /> */}
          {user?.profile_photo ? (
            <img
              onClick={() => navigate(`/profile/${user?._id}`)}
              src={user?.profile_photo}
              className="w-10 h-10 object-cover rounded-full "
            />
          ) : (
            <UserIcon onClick={() => navigate(`/profile/${user?._id}`)} className="text-tertiary" />
          )}
          <div>
            <h1 className="text-sm font-medium text-primary">{user?.fullName}</h1>
            <p className="text-xs text-tertiary">@{user?.username}</p>
          </div>
        </div>
        <LogOut
          onClick={signoutUser}
          className="w-4.5 text-tertiary hover:text-primary transition cursor-pointer"
        />
      </div>
    </div>
  );
};

export default SideBar;
