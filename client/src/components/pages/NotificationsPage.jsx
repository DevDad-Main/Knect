import React, { useEffect, useState } from "react";
import { fetchData, updateData } from "../utils";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import {
  Bell,
  MessageCircle,
  Heart,
  MessageSquare,
  Trash2,
  ArrowLeft,
  Eye,
} from "lucide-react";

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  const unreadCount = notifications.filter((n) => !n.read).length;
  const fetchNotifications = async () => {
    try {
      const data = await fetchData("api/v1/notification/get-all");
      if (data) setNotifications(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [unreadCount]);

  const handleNotificationClick = async (n) => {
    try {
      if (n.type === "message") navigate(`/messages/${n.from._id}`);
      else if (n.type === "like" || n.type === "comment")
        navigate(`/post/${n.entityId}`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleReadNotifcation = async (n) => {
    try {
      if (!n.read) {
        const notificationId = n._id;
        await updateData(`api/v1/notification/read/${notificationId}`);
        setNotifications((prev) =>
          prev.map((notif) =>
            notif._id === n._id ? { ...notif, read: true } : notif,
          ),
        );
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteNotification = async (id) => {
    try {
      await updateData(`api/v1/notification/delete/${id}`, {}, "DELETE");
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleClearAll = async () => {
    try {
      await updateData(`api/v1/notification/clear-all`, {}, "DELETE");
      setNotifications([]);
    } catch (err) {
      console.error(err);
    }
  };

  const getIcon = (type) => {
    if (type === "message") return <MessageCircle className="text-blue-500" />;
    if (type === "like") return <Heart className="text-red-500" />;
    if (type === "comment") return <MessageSquare className="text-green-500" />;
  };

  const groupedNotifications = notifications.reduce((groups, n) => {
    const date = moment(n.createdAt);
    let key;
    if (date.isSame(moment(), "day")) key = "Today";
    else if (date.isSame(moment().subtract(1, "day"), "day")) key = "Yesterday";
    else if (date.isAfter(moment().subtract(7, "days"))) key = "Last 7 Days";
    else key = "Older";

    if (!groups[key]) groups[key] = [];
    groups[key].push(n);
    return groups;
  }, {});

  const sectionOrder = ["Today", "Yesterday", "Last 7 Days", "Older"];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 mt-2"
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            Back
          </button>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bell /> Notifications
          </h1>
          {notifications.length > 0 && (
            <button
              onClick={handleClearAll}
              className="text-sm text-red-500 hover:underline"
            >
              Clear All
            </button>
          )}
        </div>

        {sectionOrder.map((section) => {
          const items = groupedNotifications[section];
          if (!items || items.length === 0) return null;

          return (
            <div key={section} className="mb-6">
              <h2 className="text-lg font-semibold mb-2">{section}</h2>
              <div className="space-y-2">
                {items.map((n) => (
                  <div
                    key={n._id}
                    className={`flex items-start gap-3 p-3 rounded-lg transition hover:bg-gray-100 ${
                      !n.read ? "bg-indigo-50" : ""
                    }`}
                  >
                    <div
                      className="flex-shrink-0"
                      onClick={() => handleNotificationClick(n)}
                    >
                      {getIcon(n.type)}
                    </div>
                    <div
                      className="flex-1 cursor-pointer"
                      onClick={() => handleNotificationClick(n)}
                    >
                      <p className="text-sm font-medium">{n.from.full_name}</p>
                      <p className="text-xs text-gray-600 truncate">{n.text}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {moment(n.createdAt).fromNow()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleReadNotifcation(n)}
                        className="text-gray-400 hover:text-green-500 p-1 rounded-full"
                        title="Read Notification"
                      >
                        <Eye size={20} />
                      </button>

                      <button
                        onClick={() => handleDeleteNotification(n._id)}
                        className="text-gray-400 hover:text-red-500 p-1 rounded-full"
                        title="Delete Notification"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {notifications.length === 0 && (
          <p className="text-gray-500 text-center mt-8">No notifications yet</p>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
