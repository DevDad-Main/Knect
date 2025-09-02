import React, { useState, useEffect, useRef } from "react";
import { Bell, UserIcon } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import moment from "moment";
import { updateData } from "./utils";

const NotificationBell = ({ notifications, onClickBell }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const unreadCount = notifications.filter((n) => !n.read).length;

  // ✅ Close if you click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ Close if route changes
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        // onClick={() => setOpen((prev) => !prev)}
        onClick={onClickBell}
        className="relative p-2 rounded-full hover:bg-gray-100"
      >
        <Bell className="w-6 h-6 text-gray-700" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
            {unreadCount}
          </span>
        )}
      </button>

      {/* {open && ( */}
      {/*   <div className="absolute right-0 left-1 mt-1 w-72 bg-white rounded-xl shadow-lg p-2 z-50 max-h-80 overflow-y-auto border border-gray-200"> */}
      {/*     {notifications.length === 0 ? ( */}
      {/*       <p className="text-sm text-gray-500 p-3">No notifications</p> */}
      {/*     ) : ( */}
      {/*       notifications.map((n, i) => ( */}
      {/*         <div */}
      {/*           onClick={() => handleNotificationClick(n)} */}
      {/*           key={i} */}
      {/*           className="flex items-start gap-2 p-2 hover:bg-gray-50 cursor-pointer rounded-md" */}
      {/*         > */}
      {/*           {n.from?.profile_picture ? ( */}
      {/*             <img */}
      {/*               src={n.from.profile_picture} */}
      {/*               alt="" */}
      {/*               className="h-8 w-8 rounded-full" */}
      {/*             /> */}
      {/*           ) : ( */}
      {/*             <UserIcon className="h-8 w-8 rounded-full" /> */}
      {/*           )} */}
      {/*           <div className="flex-1"> */}
      {/*             <p className="text-sm font-medium">{n.from.full_name}</p> */}
      {/*             <p className="text-xs text-gray-500 truncate"> */}
      {/*               {n.type === "message" && "Sent you a message"} */}
      {/*               {n.type === "like" && "Liked your post"} */}
      {/*               {n.type === "comment" && "Commented on your post"} */}
      {/*             </p> */}
      {/*             <p className="text-[10px] text-gray-400"> */}
      {/*               {moment(n.createdAt).fromNow()} */}
      {/*             </p> */}
      {/*           </div> */}
      {/*         </div> */}
      {/*       )) */}
      {/*     )} */}
      {/*   </div> */}
      {/* )} */}
    </div>
  );
};

export default NotificationBell;
