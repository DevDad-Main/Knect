import React, { useEffect, useState } from "react";
import { useApp } from "../AppContext.jsx";
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
  Link,
} from "lucide-react";
import toast from "react-hot-toast";

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();
  const { getNotifications, updateUser } = useApp();

  const unreadCount = notifications.filter((n) => !n.read).length;
  const fetchNotifications = async () => {
    try {
      const data = await getNotifications();
      if (data) {
        // Filter out self-generated notifications
        const filteredNotifications = (data.notifications || []).filter(
          (notification) => notification.fromUser._id !== user?._id
        );
        setNotifications(filteredNotifications);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleNotificationClick = async (n) => {
    try {
      if (n.type === "message") {
        navigate(`/messages/${n.fromUser.username}`);
        handleReadNotifcation(n);
      } else if (n.type === "connection") {
        navigate(`/profile/${n.fromUser.username}`);
        handleReadNotifcation(n);
      } else if (n.type === "like" || n.type === "comment") {
        navigate(`/post/${n.entityId}`);
        handleReadNotifcation(n);
      }
    } catch (err) {
      console.error(err);
    }
  };
  const handleReadNotifcation = async (n) => {
    try {
      if (!n.read) {
        const notificationId = n._id;
        await updateUser(`v1/notifications/read/${notificationId}`, {}, "POST");
        setNotifications((prev) =>
          prev.map((notif) =>
            notif._id === n._id ? { ...notif, read: true } : notif,
          ),
        );

        window.dispatchEvent(new Event("refreshNotifications"));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteNotification = async (id) => {
    try {
      await updateUser(`v1/notifications/delete/${id}`, {}, "DELETE");
      setNotifications((prev) => prev.filter((n) => n._id !== id));

      window.dispatchEvent(new Event("refreshNotifications"));
    } catch (err) {
      console.error(err);
    }
  };

  const handleClearAll = async () => {
    try {
      await updateUser(`v1/notifications/clear-all`, {}, "DELETE");
      setNotifications([]);
    } catch (err) {
      console.error(err);
    }
  };

  const getIcon = (type) => {
    if (type === "message") return <MessageCircle className="text-green-500" />;
    if (type === "like") return <Heart className="text-red-500" />;
    if (type === "comment")
      return <MessageSquare className="text-purple-500" />;
    if (type === "connection") return <Link className="text-blue-500" />;
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
    <div className="min-h-screen bg-secondary p-6">
      <div className="max-w-4xl mx-auto bg-primary shadow-md rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-tertiary hover:text-primary mt-2"
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            Back
          </button>
          <div className="flex-1"></div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-primary">
            <Bell /> Notifications
          </h1>
          <div className="flex-1 flex justify-end">
            {notifications.length > 0 && (
              <button
                onClick={handleClearAll}
                className="text-sm text-red-500 hover:underline"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        {sectionOrder.map((section) => {
          const items = groupedNotifications[section];
          if (!items || items.length === 0) return null;

          return (
            <div key={section} className="mb-6">
              <h2 className="text-lg font-semibold mb-2 text-primary">{section}</h2>
              <div className="space-y-2">
                {items.map((n) => (
                  <div
                    key={n._id}
                    className={`flex items-start gap-3 p-3 rounded-lg transition hover:bg-secondary ${!n.read ? "bg-indigo-50 dark:bg-indigo-900/20" : ""
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
                      <p className="text-sm font-medium text-primary">{n.fromUser.fullName}</p>
                      <p className="text-xs text-tertiary truncate">
                        {n.type === "like" && "liked your post"}
                        {n.type === "comment" && "commented on your post"}
                        {n.type === "message" && "sent you a message"}
                        {n.type === "connection" && "wants to connect with you"}
                      </p>
                      <p className="text-[10px] text-tertiary mt-0.5">
                        {moment(n.createdAt).fromNow()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleReadNotifcation(n)}
                        className="text-tertiary hover:text-green-500 p-1 rounded-full"
                        title="Read Notification"
                      >
                        <Eye size={20} />
                      </button>

                      <button
                        onClick={() => handleDeleteNotification(n._id)}
                        className="text-tertiary hover:text-red-500 p-1 rounded-full"
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
          <p className="text-tertiary text-center mt-8">No notifications yet</p>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
