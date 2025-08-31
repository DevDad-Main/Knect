import React, { useState, useEffect } from "react";
import { Bell, UserIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import { updateData } from "./utils"; // your helper for POST requests

const NotificationBell = ({ notifications, setNotifications, setIsOpen }) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleNotificationClick = async (notification) => {
    setOpen(false);

    const fromUserId = notification.from._id;
    try {
      // Mark as seen in backend
      await updateData("api/v1/message/mark-as-seen", {
        fromUserId,
      });
      setNotifications((prev) => prev.filter((n) => n.from._id !== fromUserId));

      navigate(`/messages/${fromUserId}`);
    } catch (err) {
      console.error(err);
    }
  };

  // useEffect(() => {
  //   if (setIsOpen) {
  //     setOpen(false);
  //   }
  // }, [setIsOpen]);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-full hover:bg-gray-100"
      >
        <Bell className="w-6 h-6 text-gray-700" />
        {notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
            {notifications.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 left-3 mt-0 w-72 bg-white rounded-xl shadow-xl p-2 z-50 max-h-80 overflow-y-auto border border-gray-200">
          {notifications.length === 0 ? (
            <p className="text-sm text-gray-500 p-3">No notifications</p>
          ) : (
            notifications.map((n, i) => (
              <div
                onClick={() => handleNotificationClick(n)}
                key={i}
                className="flex items-start gap-2 p-2 hover:bg-gray-50 cursor-pointer rounded-md"
              >
                {n.from.profile_picture ? (
                  <img
                    src={n.from.profile_picture}
                    alt=""
                    className="h-8 w-8 mt-2 rounded-full"
                  />
                ) : (
                  <UserIcon className="h-8 w-8 mt-2 rounded-full" />
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium">{n.from.full_name}</p>
                  <p className="text-xs text-gray-500 truncate">
                    {n.text || "Sent you a message"}
                  </p>
                  <p className="text-[10px] text-gray-400">
                    {moment(n.createdAt).fromNow()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
