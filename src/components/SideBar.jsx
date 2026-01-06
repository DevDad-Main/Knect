import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import MenuItems from "./MenuItems";
import { CirclePlus, LogOut, UserIcon, Bell } from "lucide-react";
import { useApp } from "../components/AppContext";
import toast from "react-hot-toast";

import ThemeToggle from "./ThemeToggle";
import { googleLogout } from "@react-oauth/google";

const SideBar = ({ sideBarOpen, setSideBarOpen }) => {
  const [notifications, setNotifications] = useState([]);
  const { user, updateUser } = useApp();
  const location = useLocation();
  const unreadCount = notifications.filter((n) => !n.read).length;
  const navigate = useNavigate();

  const signoutUser = async () => {
    try {
      const response = await updateUser("v1/users/logout", {}, "POST");

      if (response) {
        if (user?.authProvider === "google") {
          googleLogout();
        }
        navigate("/login");
        toast.success("Logged out successfully");
      } else {
        toast.error("Logout failed");
      }
    } catch (error) {
      toast.error(error.message || "Logout failed");
    }
  };

  return (
    <div
      className={`w-60 xl:w-72 bg-primary border-r border-primary
  flex flex-col justify-between
  fixed top-0 left-0 bottom-0 z-40
  ${sideBarOpen ? "translate-x-0" : "-translate-x-full"}
  transition-all duration-300 ease-in-out
  lg:translate-x-0 lg:flex hidden`}
    >
      {/* 🔽 CHANGED: flex-1 added here */}
      <div className="w-full flex-1">
        <div className="flex mt-2 relative">
          <h1
            onClick={() => navigate("/feed")}
            className="w-26 ml-7 my-2 text-purple-700 text-2xl font-bold cursor-pointer flex-1 dark:text-purple-400"
          >
            Knect
          </h1>

          <div className="flex items-center gap-2 mr-3 mt-3">
            <div className="relative">
              <Bell
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
            <ThemeToggle />
          </div>
        </div>

        <hr className="border-secondary mb-8" />

        <MenuItems setSideBarOpen={setSideBarOpen} />

        <Link
          to="/create-post"
          className="flex items-center justify-center gap-2 py-2.5 mt-6 mx-6 rounded-lg
          bg-gradient-to-r from-indigo-500 to-purple-600
          hover:from-indigo-700 hover:to-purple-800
          active:scale-95 transition text-white cursor-pointer"
        >
          <CirclePlus className="w-5 h-5" />
          Create Post
        </Link>
      </div>

      {/* Bottom user section (now stays pinned) */}
      <div className="w-full border-t border-secondary p-4 px-7 flex items-center justify-between">
        <div className="flex gap-2 items-center cursor-pointer">
          {user?.profile_photo ? (
            <img
              onClick={() => navigate(`/profile/${user?._id}`)}
              src={user.profile_photo}
              className="w-10 h-10 object-cover rounded-full"
            />
          ) : (
            <UserIcon
              onClick={() => navigate(`/profile/${user?._id}`)}
              className="text-tertiary"
            />
          )}
          <div>
            <h1 className="text-sm font-medium text-primary">
              {user?.fullName}
            </h1>
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
