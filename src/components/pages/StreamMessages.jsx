import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Chat,
  ChannelList,
  ChannelPreviewMessenger
} from "stream-chat-react";
import { useStreamChat } from "../../components/StreamChatContext";
import { useApp } from "../../components/AppContext";
import { MessageCircle, User, ArrowLeft } from "lucide-react";
import "stream-chat-react/dist/css/v2/index.css";

const StreamMessages = () => {
  const navigate = useNavigate();
  const { user, getConnections } = useApp();
  const { chatClient, getDirectMessageChannels, isConnecting, error } = useStreamChat();
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("messages");

  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    try {
      setLoading(true);
      const data = await getConnections();
      if (data) {
        setConnections(data.connections || []);
      }
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch connections:', err);
      setLoading(false);
    }
  };

  const handleChannelClick = (channel) => {
    // Get the other user's ID from the channel
    const members = Object.keys(channel.state.members);
    const otherUserId = members.find(id => id !== user._id);
    if (otherUserId) {
      navigate(`/messages/${otherUserId}`);
    }
  };

  const handleUserClick = (userId) => {
    navigate(`/messages/${userId}`);
  };

  const handleBack = () => {
    navigate("/feed");
  };

// Modern channel preview component inspired by Stream's design
  const CustomChannelPreview = (props) => {
    const { channel, setActiveChannel } = props;
    
    // Get the other user from channel members
    const members = Object.values(channel.state.members);
    const otherUser = members.find(member => member.user.id !== user._id);
    const isOnline = otherUser?.user?.online;

    return (
      <div
        onClick={() => {
          setActiveChannel(channel);
          handleChannelClick(channel);
        }}
        className="flex items-center gap-3 p-4 hover:bg-secondary/30 cursor-pointer transition-all duration-200 border-b border-primary hover:shadow-sm"
      >
        <div className="relative">
          {otherUser?.user?.image ? (
            <img
              src={otherUser.user.image}
              alt={otherUser.user.name}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-offset-2 ring-indigo-500/20"
            />
          ) : (
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center ring-2 ring-offset-2 ring-indigo-500/20">
              <span className="text-white font-semibold text-sm">
                {otherUser?.user?.name?.charAt(0) || 'U'}
              </span>
            </div>
          )}
          {/* Online indicator */}
          <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-primary ${
            isOnline ? 'bg-green-500' : 'bg-gray-400'
          }`}></div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold text-primary text-sm truncate">
              {otherUser?.user?.name || 'Unknown User'}
            </h3>
            {channel.state.last_message_at && (
              <span className="text-xs text-tertiary font-medium">
                {new Date(channel.state.last_message_at).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </span>
            )}
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-tertiary truncate flex items-center gap-1">
              {channel.state.unreadCount > 0 && (
                <span className="w-2 h-2 bg-indigo-600 rounded-full"></span>
              )}
              {channel.state.last_message?.text || 'No messages yet'}
            </p>
            {channel.state.unreadCount > 0 && (
              <span className="bg-indigo-600 text-white text-xs rounded-full px-2 py-1 min-w-[20px] h-5 flex items-center justify-center font-medium">
                {channel.state.unreadCount}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (isConnecting || loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-primary">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-secondary">Loading messages...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-primary">
        <div className="text-center">
          <p className="text-red-500 mb-4">Error: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!chatClient) {
    return (
      <div className="flex items-center justify-center h-screen bg-primary">
        <div className="text-center">
          <p className="text-secondary mb-4">Chat not available</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Modern theme for Stream Chat inspired by Stream's official demos
  const chatTheme = {
    "--str-chat__primary-color": "#0064ff",
    "--str-chat__secondary-color": "#0d47a1",
    "--str-chat__background-color": "#ffffff",
    "--str-chat__surface-color": "#f8fafc",
    "--str-chat__text-color": "#1a202c",
    "--str-chat__text-low-emphasis-color": "#718096",
    "--str-chat__border-color": "#e2e8f0",
    "--str-chat__avatar-background-color": "#edf2f7",
    "--str-chat__avatar-border-radius": "50%",
  };

  // Dark theme variant
  const darkChatTheme = {
    "--str-chat__primary-color": "#4f46e5",
    "--str-chat__secondary-color": "#7c3aed",
    "--str-chat__background-color": "var(--bg-primary)",
    "--str-chat__surface-color": "var(--bg-secondary)",
    "--str-chat__text-color": "var(--text-primary)",
    "--str-chat__text-low-emphasis-color": "var(--text-tertiary)",
    "--str-chat__border-color": "var(--border-primary)",
    "--str-chat__avatar-background-color": "var(--bg-tertiary)",
    "--str-chat__avatar-border-radius": "50%",
  };

  const currentTheme = document.documentElement.classList.contains('dark') ? darkChatTheme : chatTheme;

  return (
    <div className="h-screen bg-primary flex flex-col" style={currentTheme}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-primary bg-primary">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="p-2 hover:bg-secondary rounded-lg transition-colors lg:hidden"
          >
            <ArrowLeft className="w-5 h-5 text-primary" />
          </button>
          <h1 className="text-xl font-bold text-primary">Messages</h1>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-primary bg-primary">
        <button
          onClick={() => setActiveTab("messages")}
          className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${activeTab === "messages"
              ? "text-indigo-600 border-b-2 border-indigo-600"
              : "text-tertiary hover:text-secondary"
            }`}
        >
          <MessageCircle className="w-4 h-4 inline mr-2" />
          Chats
        </button>
        <button
          onClick={() => setActiveTab("connections")}
          className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${activeTab === "connections"
              ? "text-indigo-600 border-b-2 border-indigo-600"
              : "text-tertiary hover:text-secondary"
            }`}
        >
          <User className="w-4 h-4 inline mr-2" />
          Connections
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === "messages" ? (
          <Chat client={chatClient} theme={document.documentElement.classList.contains('dark') ? "messaging dark" : "messaging light"}>
            <ChannelList
              filters={{
                type: 'messaging',
                members: { $in: [user._id] },
              }}
              sort={{ last_message_at: -1 }}
              Preview={CustomChannelPreview}
            />
          </Chat>
        ) : (
          <div className="h-full overflow-y-auto">
            {connections.length > 0 ? (
              connections.map((connection) => (
                <div
                  key={connection._id}
                  onClick={() => handleUserClick(connection._id)}
                  className="flex items-center gap-3 p-4 hover:bg-secondary/30 cursor-pointer transition-all duration-200 border-b border-primary hover:shadow-sm"
                >
                  <div className="relative">
                    {connection.profile_photo ? (
                      <img
                        src={connection.profile_photo}
                        alt={connection.fullName}
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-offset-2 ring-indigo-500/20"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center ring-2 ring-offset-2 ring-indigo-500/20">
                        <span className="text-white font-semibold text-sm">
                          {connection.fullName?.charAt(0) || 'U'}
                        </span>
                      </div>
                    )}
                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-primary"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-primary truncate text-sm">
                      {connection.fullName}
                    </h3>
                    <p className="text-xs text-tertiary truncate flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                      Available
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUserClick(connection._id);
                    }}
                    className="px-3 py-1.5 bg-indigo-600 text-white text-xs rounded-lg hover:bg-indigo-700 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
                  >
                    <MessageCircle className="w-3 h-3 inline mr-1" />
                    Chat
                  </button>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <User className="w-12 h-12 text-tertiary mx-auto mb-4" />
                  <p className="text-secondary">No connections yet</p>
                  <p className="text-sm text-tertiary mt-2">
                    Connect with people to start messaging
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StreamMessages;
