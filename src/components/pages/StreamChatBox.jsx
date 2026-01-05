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
import { useStreamChat } from "../../components/StreamChatContext";
import { useApp } from "../../components/AppContext";
import { ArrowLeft, Phone, Video, MoreVertical } from "lucide-react";
import toast from "react-hot-toast";
import "stream-chat-react/dist/css/v2/index.css";

const StreamChatBox = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user, getConnections, getProfile } = useApp();
  const { chatClient, createDirectMessageChannel, isConnecting, error } = useStreamChat();
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [otherUser, setOtherUser] = useState(null);
  const [callInProgress, setCallInProgress] = useState(false);
  const [activeCall, setActiveCall] = useState(null);

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

  // Listen for incoming calls
  useEffect(() => {
    if (!chatClient) return;

    const handleCallEvent = (event) => {
      console.log('📞 Incoming call event:', event);

      if (event.type === 'call.created' || event.type === 'call.ringing') {
        const incomingCall = event.call;
        const caller = incomingCall.members.find(member => member.user?.id !== user._id);

        if (caller) {
          setActiveCall(incomingCall);
          toast(`${incomingCall.data?.call_type === 'video' ? '📹' : '📞'} Incoming call from ${caller.user?.name || 'User'}`, {
            duration: 5000,
          });
        }
      }
    };

    // Subscribe to call events
    chatClient.on('call.created', handleCallEvent);
    chatClient.on('call.ringing', handleCallEvent);
    chatClient.on('call.accepted', (event) => {
      console.log('📞 Call accepted:', event);
      setActiveCall(event.call);
    });
    chatClient.on('call.rejected', (event) => {
      console.log('❌ Call rejected:', event);
      setActiveCall(null);
    });
    chatClient.on('call.ended', (event) => {
      console.log('📞 Call ended:', event);
      setActiveCall(null);
    });

    return () => {
      chatClient.off('call.created', handleCallEvent);
      chatClient.off('call.ringing', handleCallEvent);
      chatClient.off('call.accepted');
      chatClient.off('call.rejected');
      chatClient.off('call.ended');
    };
  }, [chatClient, user]);

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
          const channel = chatClient.channel('messaging', [user._id, userId].sort().join('-'));
          const state = await channel.query();
          const members = Object.values(state.members || {});
          const otherMember = members.find(member => member.user?.id !== user._id);

          if (otherMember?.user) {
            userProfile = {
              _id: otherMember.user.id,
              fullName: otherMember.user.name || 'Unknown User',
              username: otherMember.user.username || 'unknown',
              profile_photo: otherMember.user.image
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
          if (connectionsData?.connections) {
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

      // Create or get the direct message channel
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

  // Stream Chat Calling Functions
  const startVideoCall = async () => {
    if (!otherUser?._id) return;

    try {
      setCallInProgress(true);

      // Use Stream Chat's calling feature
      if (chatClient) {
        // Start a video call through Stream Chat
        const call = chatClient.call(otherUser._id, {
          data: {
            call_type: 'video',
            user_ids: [otherUser._id],
            created_by_id: user._id,
          },
        });

        // Navigate to a simple call interface
        navigate(`/messages/${userId}?call_id=${call.cid}`);

        toast.success(`Calling ${otherUser.fullName || 'User'}...`);
      } else {
        toast.error('Chat client not ready');
      }
    } catch (error) {
      console.error('Failed to start video call:', error);
      toast.error('Failed to start video call');
      setCallInProgress(false);
    }
  };

  const startVoiceCall = async () => {
    if (!otherUser?._id) return;

    try {
      setCallInProgress(true);

      // Use Stream Chat's calling feature
      if (chatClient) {
        // Start a voice call through Stream Chat
        const call = chatClient.call(otherUser._id, {
          data: {
            call_type: 'audio',
            user_ids: [otherUser._id],
            created_by_id: user._id,
          },
        });

        // Navigate to a simple call interface
        navigate(`/messages/${userId}?call_id=${call.cid}`);

        toast.success(`Calling ${otherUser.fullName || 'User'}...`);
      } else {
        toast.error('Chat client not ready');
      }
    } catch (error) {
      console.error('Failed to start voice call:', error);
      toast.error('Failed to start voice call');
      setCallInProgress(false);
    }
  };

  if (isConnecting || loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-primary">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-secondary">Loading chat...</p>
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
            onClick={handleBack}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Back to Messages
          </button>
        </div>
      </div>
    );
  }

  if (!chatClient || !channel) {
    return (
      <div className="flex items-center justify-center h-screen bg-primary">
        <div className="text-center">
          <p className="text-secondary mb-4">Chat not available</p>
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Back to Messages
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
    "--str-chat__message-text-color": "#1a202c",
    "--str-chat__message-background-color": "#f7fafc",
    "--str-chat__message-background-color-sent": "#0064ff",
    "--str-chat__message-text-color-sent": "#ffffff",
    "--str-chat__input-background-color": "#ffffff",
    "--str-chat__input-border-color": "#e2e8f0",
    "--str-chat__input-border-radius": "12px",
    "--str-chat__avatar-border-radius": "50%",
    "--str-chat__message-border-radius": "16px",
    "--str-chat__message-padding": "12px 16px",
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
    "--str-chat__message-text-color": "var(--text-primary)",
    "--str-chat__message-background-color": "var(--bg-secondary)",
    "--str-chat__message-background-color-sent": "var(--bg-tertiary)",
    "--str-chat__message-text-color-sent": "var(--text-primary)",
    "--str-chat__input-background-color": "var(--bg-secondary)",
    "--str-chat__input-border-color": "var(--border-primary)",
    "--str-chat__input-border-radius": "12px",
    "--str-chat__avatar-border-radius": "50%",
    "--str-chat__message-border-radius": "16px",
    "--str-chat__message-padding": "12px 16px",
  };

  const currentTheme = document.documentElement.classList.contains('dark') ? darkChatTheme : chatTheme;

  // Incoming Call Overlay
  if (activeCall) {
    const isIncoming = activeCall.state === 'ringing';
    const isVideo = activeCall.data?.call_type === 'video';
    const caller = activeCall.members.find(member => member.user?.id !== user._id);

    return (
      <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
        <div className="bg-primary rounded-2xl p-6 max-w-sm w-full mx-auto text-center border border-primary shadow-2xl">
          {/* Caller Info */}
          <div className="mb-6">
            {isVideo && caller?.user?.image ? (
              <img
                src={caller.user.image}
                alt={caller.user.name}
                className="w-24 h-24 rounded-full mx-auto mb-4 ring-4 ring-indigo-500/20"
              />
            ) : (
              <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-white font-bold text-3xl">
                  {caller?.user?.name?.charAt(0) || 'U'}
                </span>
              </div>
            )}
            <h2 className="text-2xl font-bold text-primary mb-1">
              {caller?.user?.name || 'Unknown User'}
            </h2>
            <p className="text-tertiary">
              {isIncoming ? 'Incoming' : 'Active'} {isVideo ? 'Video' : 'Voice'} Call
            </p>
          </div>

          {/* Call Actions */}
          <div className="flex justify-center gap-4">
            {isIncoming && (
              <button
                onClick={async () => {
                  try {
                    await activeCall.accept();
                    toast.success('Call accepted');
                  } catch (error) {
                    toast.error('Failed to accept call');
                  }
                }}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-full transition-all duration-200 flex items-center gap-2"
              >
                <Phone className="w-5 h-5" />
                Accept
              </button>
            )}
            <button
              onClick={async () => {
                try {
                  await activeCall.reject();
                  setActiveCall(null);
                  toast.success('Call rejected');
                } catch (error) {
                  toast.error('Failed to reject call');
                }
              }}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-full transition-all duration-200 flex items-center gap-2"
            >
              <PhoneOff className="w-5 h-5" />
              {isIncoming ? 'Reject' : 'End'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-primary flex flex-col" style={currentTheme}>
      {/* Modern Header - Mobile Optimized */}
      <div className="flex items-center justify-between px-3 py-2 sm:px-4 sm:py-3 border-b border-primary bg-primary shadow-sm">
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          <button
            onClick={handleBack}
            className="p-1.5 sm:p-2 hover:bg-secondary/50 rounded-lg transition-all duration-200 lg:hidden flex-shrink-0"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          </button>
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <div className="relative flex-shrink-0">
              {otherUser?.profile_photo ? (
                <img
                  src={otherUser.profile_photo}
                  alt={otherUser.fullName}
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover ring-2 ring-offset-2 ring-indigo-500/20"
                />
              ) : (
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center ring-2 ring-offset-2 ring-indigo-500/20">
                  <span className="text-white font-semibold text-xs sm:text-sm">
                    {otherUser?.profile.fullName?.charAt(0) || 'U'}
                  </span>
                </div>
              )}
              {/* Online indicator */}
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded-full border-2 border-primary"></div>
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="font-semibold text-primary text-sm sm:text-sm truncate">{otherUser?.profile.fullName || 'Unknown User'}</h2>
              <p className="text-xs text-tertiary flex items-center gap-1 truncate">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0"></span>
                <span className="truncate">Active now</span>
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          {/* Voice Call Button */}
          <button
            onClick={startVoiceCall}
            disabled={callInProgress}
            className="p-1.5 sm:p-2 hover:bg-secondary/50 rounded-lg transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
            title="Voice call"
          >
            <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-tertiary group-hover:text-green-600 transition-colors" />
          </button>
          {/* Video Call Button */}
          <button
            onClick={startVideoCall}
            disabled={callInProgress}
            className="p-1.5 sm:p-2 hover:bg-secondary/50 rounded-lg transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
            title="Video call"
          >
            <Video className="w-4 h-4 sm:w-5 sm:h-5 text-tertiary group-hover:text-blue-600 transition-colors" />
          </button>
          {/* More Options Button */}
          <button
            className="p-1.5 sm:p-2 hover:bg-secondary/50 rounded-lg transition-all duration-200 lg:hidden"
            title="More options"
          >
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
                "copy",
                "thread"
              ]}
              additionalMessageInputProps={{
                className: "mobile-optimized-input",
                style: {
                  minHeight: "44px", // Minimum touch target for mobile
                }
              }}
              messageLimit={50} // Performance optimization for mobile
              loadMoreThreshold={0.8} // Load more when scrolled 80% down
              autoScrollThreshold={200} // Distance from bottom to auto-scroll
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
                maxRows: 4, // Equivalent to ~120px max height
              }}
            />
          </Window>
          <Thread />
        </Channel>
      </Chat>
    </div>
  );
};

export default StreamChatBox;
