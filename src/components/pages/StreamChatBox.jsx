import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Chat,
  Channel,
  ChannelHeader,
  MessageList,
  MessageInput,
  Thread,
  Window,
  MessageActions,
  Avatar
} from "stream-chat-react";
import { ArrowLeft, Phone, Video, MoreVertical } from "lucide-react";
import toast from "react-hot-toast";
import "stream-chat-react/dist/css/v2/index.css";
import { useApp } from "../AppContext";
import { useStreamChat } from "../StreamChatContext";

const StreamChatBox = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user, getConnections, getProfile } = useApp();
  const { chatClient, createDirectMessageChannel, isConnecting, error } = useStreamChat();
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [otherUser, setOtherUser] = useState(null);

  // Dynamic theme that properly updates with dark mode
  const getDynamicTheme = () => {
    const isDark = document.documentElement.classList.contains('dark');
    return {
      "--str-chat__primary-color": isDark ? "#4f46e5" : "#0064ff",
      "--str-chat__secondary-color": isDark ? "#7c3aed" : "#0d47a1",
      "--str-chat__background-color": isDark ? "var(--bg-primary)" : "#ffffff",
      "--str-chat__surface-color": isDark ? "var(--bg-secondary)" : "#f8fafc",
      "--str-chat__text-color": isDark ? "var(--text-primary)" : "#1a202c",
      "--str-chat__text-low-emphasis-color": isDark ? "var(--text-tertiary)" : "#718096",
      "--str-chat__border-color": isDark ? "var(--border-primary)" : "#e2e8f0",
      "--str-chat__avatar-background-color": isDark ? "var(--bg-tertiary)" : "#edf2f7",
      "--str-chat__message-text-color": isDark ? "var(--text-primary)" : "#1a202c",
      "--str-chat__message-background-color": isDark ? "var(--bg-secondary)" : "#f7fafc",
      "--str-chat__message-background-color-sent": isDark ? "var(--bg-tertiary)" : "#0064ff",
      "--str-chat__message-text-color-sent": isDark ? "var(--text-primary)" : "#ffffff",
      "--str-chat__input-background-color": isDark ? "var(--bg-secondary)" : "#ffffff",
      "--str-chat__input-border-color": isDark ? "var(--border-primary)" : "#e2e8f0",
      "--str-chat__input-border-radius": "12px",
      "--str-chat__avatar-border-radius": "50%",
      "--str-chat__message-border-radius": "16px",
      "--str-chat__message-padding": "12px 16px",
    };
  };

  useEffect(() => {
    if (chatClient && userId && user) {
      initializeChannel();
    }

    return () => {
      if (channel) {
        channel.stopWatching();
      }
    };
  }, [chatClient, userId, user]);

  const initializeChannel = async () => {
    try {
      setLoading(true);

      // Try multiple methods to get user info
      let userProfile = null;

      // Method 1: Try profile API first
      try {
        const profileData = await getProfile(userId);
        if (profileData && (profileData.user || profileData)) {
          userProfile = profileData.user || profileData;
          console.log('✅ Fetched user from profile API:', userProfile);
        }
      } catch (profileErr) {
        console.warn('❌ Profile API failed:', profileErr.message);
      }

      // Method 2: Try Stream Chat client for user info
      if (!userProfile && chatClient) {
        try {
          const channelData = chatClient.channel('messaging', [user._id, userId].sort().join('-'));
          const state = await channelData.query();
          const members = Object.values(state.members || {});
          const otherMember = members.find(member => member.user?.id !== user._id);

          if (otherMember?.user) {
            userProfile = {
              _id: otherMember.user.id,
              fullName: otherMember.user.name || 'Unknown User',
              username: otherMember.user.username || 'unknown',
              profile_photo: otherMember.user.image,
            };
            console.log('✅ Fetched user from Stream Chat:', userProfile);
          }
        } catch (streamErr) {
          console.warn('❌ Stream Chat user fetch failed:', streamErr.message);
        }
      }

      // Method 3: Fallback to connections
      if (!userProfile) {
        try {
          const connectionsData = await getConnections();
          if (connectionsData && connectionsData.connections) {
            const foundUser = connectionsData.connections.find(conn => conn._id === userId);
            if (foundUser) {
              userProfile = foundUser;
              console.log('✅ Fetched user from connections:', userProfile);
            }
          }
        } catch (connErr) {
          console.warn('❌ Connections fallback failed:', connErr.message);
        }
      }

      // Final fallback - create minimal user info
      if (!userProfile) {
        userProfile = {
          _id: userId,
          fullName: 'User',
          username: 'user',
          profile_photo: null
        };
        console.warn('⚠️ Using minimal user info:', userProfile);
      }

      setOtherUser(userProfile);

      // Create or get direct message channel
      const dmChannel = await createDirectMessageChannel(userId);
      setChannel(dmChannel);
      setLoading(false);
    } catch (err) {
      console.error('❌ Failed to initialize channel:', err);
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate("/messages");
  };

  // Simple Stream Video calling without complex integration for now
  const startVideoCall = () => {
    if (!otherUser?._id) return;

    toast.success('Video calling is being integrated. Coming soon! 📹');
  };

  const startVoiceCall = () => {
    if (!otherUser?._id) return;

    toast.success('Voice calling is being integrated. Coming soon! 📞');
  };

  if (isConnecting || loading) {
    return (
      <div className="h-screen bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-secondary">Loading chat...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 p-6 rounded-lg max-w-md mx-auto">
            <h2 className="text-xl font-bold mb-4">Chat Error</h2>
            <p className="mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!chatClient) {
    return (
      <div className="h-screen bg-primary flex items-center justify-center">
        <div className="text-center">
          <p className="text-secondary">Chat client not ready</p>
        </div>
      </div>
    );
  }

  if (!otherUser) {
    return (
      <div className="h-screen bg-primary flex items-center justify-center">
        <div className="text-center">
          <p className="text-secondary">User not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-primary flex flex-col" style={getDynamicTheme()}>
      {/* Modern Header - Mobile Optimized */}
      <div className="flex items-center justify-between px-3 py-2 sm:px-4 sm:py-3 border-b border-primary bg-primary shadow-sm">
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          <button
            onClick={handleBack}
            className="p-1.5 sm:p-2 hover:bg-secondary/50 rounded-lg transition-all duration-200 lg:hidden flex-shrink-0"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          </button>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative flex-shrink-0">
              {otherUser?.profile_photo ? (
                <img
                  src={otherUser.profile_photo}
                  alt={otherUser.fullName}
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover ring-2 ring-offset-2 ring-indigo-500/20"
                />
              ) : (
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center ring-2 ring-offset-2 ring-indigo-500/20">
                  <span className="text-white font-bold text-sm sm:text-base">
                    {otherUser?.profile.fullName?.charAt(0) || 'U'}
                  </span>
                </div>
              )}
              {/* Online indicator */}
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded-full border-2 border-primary"></div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="text-center sm:text-left">
                <h2 className="font-semibold text-primary text-sm sm:text-base truncate">
                  {otherUser?.profile.fullName || 'Unknown User'}
                </h2>
                <p className="text-xs text-tertiary flex items-center gap-1 sm:gap-2">
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full"></span>
                  Active now
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          {/* Video Call Button */}
          <button
            onClick={startVideoCall}
            className="p-1.5 sm:p-2 hover:bg-secondary/50 rounded-lg transition-all duration-200 group"
            title="Start video call"
          >
            <Video className="w-4 h-4 sm:w-5 sm:h-5 text-tertiary group-hover:text-blue-600 transition-colors" />
          </button>

          {/* Voice Call Button */}
          <button
            onClick={startVoiceCall}
            className="p-1.5 sm:p-2 hover:bg-secondary/50 rounded-lg transition-all duration-200 group"
            title="Start voice call"
          >
            <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-tertiary group-hover:text-green-600 transition-colors" />
          </button>

          {/* More Options */}
          <button className="p-1.5 sm:p-2 hover:bg-secondary/50 rounded-lg transition-all duration-200 lg:hidden">
            <MoreVertical className="w-4 h-4 sm:w-5 sm:h-5 text-tertiary" />
          </button>
        </div>
      </div>

      {/* Stream Chat Components with Enhanced Features */}
      <Chat client={chatClient} theme={document.documentElement.classList.contains('dark') ? "messaging dark" : "messaging light"}>
        <Channel channel={channel}>
          <Window>
            <MessageList
              hideDateSeparators={false}
              messageActions={[
                "edit",
                "delete",
                "quote",
                "react",
                "reply",
                "flag",
                "copy"
              ]}
              additionalMessageInputProps={{
                className: "resize-none mobile-textarea",
                minRows: 1,
                maxRows: 4,
                style: {
                  minHeight: "44px",
                }
              }}
            />
            <MessageInput
              placeholder="Type a message..."
              grow={true}
              disabled={false}
              sendButton={true}
              emojiPicker={true}
              emojiPickerPosition="top"
              emojiPickerIsOpen={false}
              fileUploads={true}
              imageUploads={true}
              maxNumberOfFiles={10}
              multipleUploads={true}
              quotedMessageEnabled={true}
              mentionAllAppUsersEnabled={false}
              mentionUsersEnabled={true}
              additionalTextareaProps={{
                className: "resize-none mobile-textarea",
                minRows: 1,
                maxRows: 4,
              }}
            />
          </Window>
        </Channel>
      </Chat>
    </div>
  );
};

export default StreamChatBox;
