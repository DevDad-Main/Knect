import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Chat, ChannelList } from "stream-chat-react";
import { useStreamChat } from "../../components/StreamChatContext";
import { useApp } from "../../components/AppContext";
import { MessageCircle, User, ArrowLeft } from "lucide-react";
import "stream-chat-react/dist/css/v2/index.css";

const StreamMessages = () => {
  const navigate = useNavigate();
  const { user, getConnections } = useApp();
  const { chatClient, isConnecting, error } = useStreamChat();

  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("messages");

  const isDark = document.documentElement.classList.contains("dark");

  const streamTheme = useMemo(() => {
    return isDark
      ? {
        "--str-chat__primary-color": "#4f46e5",
        "--str-chat__secondary-color": "#7c3aed",
        "--str-chat__background-color": "#111827",
        "--str-chat__surface-color": "#1f2937",
        "--str-chat__text-color": "#f9fafb",
        "--str-chat__text-low-emphasis-color": "#d1d5db",
        "--str-chat__border-color": "#374151",
        "--str-chat__avatar-background-color": "transparent",
        "--str-chat__avatar-border-radius": "50%",
      }
      : {
        "--str-chat__primary-color": "#4f46e5",
        "--str-chat__secondary-color": "#7c3aed",
        "--str-chat__background-color": "#ffffff",
        "--str-chat__surface-color": "#f9fafb",
        "--str-chat__text-color": "#111827",
        "--str-chat__text-low-emphasis-color": "#6b7280",
        "--str-chat__border-color": "#e5e7eb",
        "--str-chat__avatar-background-color": "transparent",
        "--str-chat__avatar-border-radius": "50%",
      };
  }, [isDark]);

  useEffect(() => {
    const fetchConnections = async () => {
      try {
        setLoading(true);
        const data = await getConnections();
        setConnections(data?.connections || []);
      } catch (err) {
        console.error("Failed to fetch connections:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchConnections();
  }, []);

  const handleChannelClick = (channel) => {
    const members = Object.keys(channel.state.members);
    const otherUserId = members.find((id) => id !== user._id);
    if (otherUserId) navigate(`/messages/${otherUserId}`);
  };

  const handleUserClick = (userId) => {
    navigate(`/messages/${userId}`);
  };

  const handleBack = () => navigate("/feed");

  const CustomChannelPreview = ({ channel, setActiveChannel }) => {
    const members = Object.values(channel.state.members);
    const otherUser = members.find((m) => m.user.id !== user._id);
    const isOnline = otherUser?.user?.online;

    return (
      <div
        onClick={() => {
          setActiveChannel(channel);
          handleChannelClick(channel);
        }}
        className="flex items-center gap-3 p-4 hover:bg-secondary/30 cursor-pointer border-b border-primary transition"
      >
        <div className="relative w-12 h-12">
          {console.log(channel.state)}
          {otherUser?.user?.image ? (
            <img
              src={otherUser.user.image}
              alt={otherUser.user.name}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <div
              className={`w-full h-full rounded-full flex items-center justify-center ${isDark
                ? "bg-gray-700 text-white"
                : "bg-gray-200 text-gray-900"
                } font-semibold`}
            >
              {otherUser?.user?.name?.charAt(0) || "U"}
            </div>
          )}

          {/* Online dot */}
          <div
            className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-primary ${isOnline ? "bg-green-500" : "bg-gray-400"
              }`}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex justify-between mb-1">
            <h3 className="font-semibold text-primary text-sm truncate">
              {otherUser?.user?.name || "Unknown User"}
            </h3>
            {channel.state.last_message_at && (
              <span className="text-xs text-tertiary">
                {new Date(channel.state.last_message_at).toLocaleTimeString(
                  [],
                  { hour: "2-digit", minute: "2-digit" }
                )}
              </span>
            )}
          </div>

          <div className="flex justify-between items-center">
            <p className="text-sm text-tertiary truncate">
              {channel.state.messageSets?.[0]?.messages?.[channel.state.messageSets[0].messages.length - 1]?.text || "No messages yet"}
            </p>

            {channel.state.unreadCount > 0 && (
              <span className="bg-indigo-600 text-white text-xs rounded-full px-2">
                {channel.state.unreadCount}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (isConnecting || loading)
    return (
      <div className="h-screen flex items-center justify-center bg-primary">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );

  if (error || !chatClient)
    return (
      <div className="h-screen flex items-center justify-center bg-primary">
        <p className="text-red-500">Chat unavailable</p>
      </div>
    );

  return (
    <div className="h-screen flex flex-col bg-primary">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-primary">
        <button
          onClick={handleBack}
          className="p-2 hover:bg-secondary rounded-lg lg:hidden"
        >
          <ArrowLeft className="w-5 h-5 text-primary" />
        </button>
        <h1 className="text-xl font-bold text-primary">Messages</h1>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-primary">
        {["messages", "connections"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 text-sm font-medium ${activeTab === tab
              ? "text-indigo-600 border-b-2 border-indigo-600"
              : "text-tertiary"
              }`}
          >
            {tab === "messages" ? (
              <MessageCircle className="inline w-4 h-4 mr-2" />
            ) : (
              <User className="inline w-4 h-4 mr-2" />
            )}
            {tab === "messages" ? "Chats" : "Connections"}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === "messages" ? (
          <div className="str-chat h-full" style={streamTheme}>
            <Chat
              client={chatClient}
              theme={isDark ? "messaging dark" : "messaging light"}
            >
              <ChannelList
                filters={{ type: "messaging", members: { $in: [user._id] } }}
                sort={{ last_message_at: -1 }}
                Preview={CustomChannelPreview}
              />
            </Chat>
          </div>
        ) : (
          <div className="h-full overflow-y-auto">
            {connections.map((c) => (
              <div
                key={c._id}
                onClick={() => handleUserClick(c._id)}
                className="flex items-center gap-3 p-4 hover:bg-secondary/30 cursor-pointer border-b border-primary transition"
              >
                <div className="relative w-12 h-12">
                  {c.profile_photo ? (
                    <img
                      src={c.profile_photo}
                      alt={c.fullName}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <div
                      className={`w-full h-full rounded-full flex items-center justify-center ${isDark
                        ? "bg-gray-700 text-white"
                        : "bg-gray-200 text-gray-900"
                        } font-semibold`}
                    >
                      {c.fullName?.charAt(0) || "U"}
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-primary">
                    {c.fullName}
                  </h3>
                  <p className="text-xs text-tertiary">Available</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StreamMessages;
