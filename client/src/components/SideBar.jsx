import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate, matchPath } from "react-router-dom";
import MenuItems from "./MenuItems";
import { CirclePlus, LogOut, User, UserIcon, Bell } from "lucide-react";
import { fetchData, updateData } from "./utils";
import toast from "react-hot-toast";
import RecentMessages from "./RecentMessages";
import NotificationBell from "./NotificationBell";
import { io } from "socket.io-client";

const SideBar = ({ sideBarOpen, setSideBarOpen }) => {
  const [notifications, setNotifications] = useState([]);
  const socket = useRef(null);
  const location = useLocation();

  const isInChatWith = (userId) => {
    console.log("location.pathname:", location.pathname);
    return matchPath(`/messages/${userId}`, location.pathname);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;
  useEffect(() => {
    socket.current = io(import.meta.env.VITE_BASEURL, {
      auth: { token: sessionStorage.getItem("token") },
      transports: ["websocket"],
      withCredentials: true,
    });

    socket.current.on("notification", async (notification) => {
      // If we are already in the chat with this person then we dont receive notifications

      if (
        notification.type === "message" &&
        isInChatWith(notification.from._id)
      ) {
        // console.log(
        //   "Skipping notification while in chat with:",
        //   notification.from._id,
        // );

        // delete it from DB
        const id = notification._id;
        await updateData(
          `api/v1/notification/delete/${id}`,
          {},
          "DELETE",
          false,
        );

        // also remove it locally (just in case it sneaks in)
        setNotifications((prev) => prev.filter((n) => n._id !== id));

        return; // 🚀 stop here so we don’t add it
      }

      setNotifications((prev) => [notification, ...prev]);

      // Optional: show toast based on type
      // if (notification.type === "message") {
      //   toast(`${notification.from.full_name} sent you a message`);
      // } else if (notification.type === "like") {
      //   toast(`${notification.from.full_name} liked your post`);
      // } else if (notification.type === "comment") {
      //   toast(`${notification.from.full_name} commented on your post`);
      // }
      // // Optional: live toast
      // toast.success(`${notification.from.full_name} sent you a message`);
    });

    return () => {
      socket.current.disconnect();
    };
  }, []);
  const navigate = useNavigate();

  const [user, setUserData] = useState(null);
  // const user = useSelector((state) => state.user.value);
  const fetchUser = async () => {
    try {
      const data = await fetchData(`api/v1/user/user`);
      if (data) {
        setUserData(data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const data = await fetchData("api/v1/notification/get-all");
      if (data) {
        setNotifications(data); // preload from DB
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const signoutUser = async () => {
    try {
      const data = await updateData("api/v1/user/logout");
      if (data) {
        navigate("/login");
      }
    } catch (error) {
      toast.error(error.message);
      console.log(error);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    const refresh = () => fetchNotifications();
    window.addEventListener("refreshNotifications", refresh);
    return () => window.removeEventListener("refreshNotifications", refresh);
  }, []);
  // const { signOut } = console.log("Sign Out");

  return (
    <div
      className={`w-60 xl:w-72 bg-white border-r border-gray-200 flex flex-col justify-between items-center max-sm:absolute top-0 bottom-0 z-20 ${sideBarOpen ? "translate-x-0" : "max-sm:-translate-x-full"} transition-all duration-300 ease-in-out`}
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
            className="w-26 ml-7 my-2 text-purple-700 text-2xl font-bold cursor-pointer flex-1"
          >
            Knect
          </h1>

          <div className="relative mr-3 mt-3">
            <Bell
              onClick={() => navigate("/notifications")}
              className="w-6 h-6 text-gray-700 cursor-pointer"
            />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full min-w-[18px] h-4 px-1 flex items-center justify-center text-xs font-medium">
                {unreadCount}
              </span>
            )}
          </div>
        </div>
        <hr className="border-gray-300 mb-8" />
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

      <div className="w-full border-t border-gray-200 p-4 px-7 flex items-center justify-between">
        <div className="flex gap-2 items-center cursor-pointer">
          {/* <User /> */}
          {user?.profile_picture ? (
            <img
              onClick={() => navigate(`/profile/${user?._id}`)}
              src={user?.profile_picture}
              className="w-10 h-10 object-cover rounded-full "
            />
          ) : (
            <UserIcon onClick={() => navigate(`/profile/${user?._id}`)} />
          )}
          <div>
            <h1 className="text-sm font-medium">{user?.full_name}</h1>
            <p className="text-xs text-gray-500">@{user?.username}</p>
          </div>
        </div>
        <LogOut
          onClick={signoutUser}
          className="w-4.5 text-gray-400 hover:text-gray-700 transition cursor-pointer"
        />
      </div>
    </div>
  );
};

export default SideBar;
