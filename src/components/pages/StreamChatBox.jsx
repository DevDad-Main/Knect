import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Chat,
  Channel,
  ChannelHeader,
  MessageList,
  MessageInput,
  Thread,
  Window,
} from "stream-chat-react";
import { ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import "stream-chat-react/dist/css/v2/index.css";
import { useStreamChat } from "../StreamChatContext";
import { ChatPlusMenu } from "./ChatPlusMenu";

const StreamChatBox = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { chatClient, createDirectMessageChannel, isConnecting, error } =
    useStreamChat();

  const [channel, setChannel] = useState(null);

  /* --------------------------------------------
   * Dark mode
   * -------------------------------------------- */
  const isDark = document.documentElement.classList.contains("dark");

  /* --------------------------------------------
   * Stream theme vars (must live on .str-chat)
   * -------------------------------------------- */
  const streamTheme = useMemo(() => {
    return isDark
      ? {
        "--str-chat__primary-color": "#6366f1",
        "--str-chat__secondary-color": "#8b5cf6",
        "--str-chat__background-color": "#111827",
        "--str-chat__surface-color": "#1f2937",
        "--str-chat__text-color": "#f9fafb",
        "--str-chat__text-low-emphasis-color": "#d1d5db",
        "--str-chat__border-color": "#374151",
        "--str-chat__message-border-radius": "16px",
        "--str-chat__input-border-radius": "12px",
        "--str-chat__avatar-background-color": "#374151",
      }
      : {
        "--str-chat__primary-color": "#4f46e5",
        "--str-chat__secondary-color": "#7c3aed",
        "--str-chat__background-color": "#ffffff",
        "--str-chat__surface-color": "#f9fafb",
        "--str-chat__text-color": "#111827",
        "--str-chat__text-low-emphasis-color": "#6b7280",
        "--str-chat__border-color": "#e5e7eb",
        "--str-chat__message-border-radius": "16px",
        "--str-chat__input-border-radius": "12px",
        "--str-chat__avatar-background-color": "#f3f4f6",
      };
  }, [isDark]);

  /* --------------------------------------------
   * Channel init
   * -------------------------------------------- */
  useEffect(() => {
    if (!chatClient || !userId) return;

    let mounted = true;

    const init = async () => {
      try {
        const dmChannel = await createDirectMessageChannel(userId);
        if (!mounted) return;
        await dmChannel.watch();
        setChannel(dmChannel);
      } catch (err) {
        console.error(err);
        toast.error("Failed to open chat");
      }
    };

    init();
    return () => {
      mounted = false;
    };
  }, [chatClient, userId]);

  /* --------------------------------------------
   * Guards
   * -------------------------------------------- */
  if (isConnecting || !channel) {
    return (
      <div className="h-screen flex items-center justify-center bg-primary">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-primary">
        <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 p-6 rounded-lg">
          <p className="mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  /* --------------------------------------------
   * UI
   * -------------------------------------------- */
  return (
    <div className="h-screen flex flex-col bg-primary">
      {/* Mobile back bar */}
      <div className="lg:hidden sticky top-0 z-30 flex items-center gap-2 pl-16 py-2 border-b border-primary bg-primary">
        <button
          onClick={() => navigate("/messages")}
          className="p-2 hover:bg-secondary/50 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5 text-primary" />
        </button>
        <span className="text-sm text-tertiary">Back</span>
      </div>

      {/* Stream Chat */}
      <div className="str-chat flex-1 flex flex-col overflow-hidden" style={streamTheme}>
        <Chat
          client={chatClient}
          theme={isDark ? "messaging dark" : "messaging light"}
        >
          <Channel channel={channel}>
            <Window className="flex-1 flex flex-col overflow-hidden">
              {/* Sticky channel header */}
              <div className="sticky top-0 z-20 bg-primary">
                <ChannelHeader />
              </div>

              {/* Message list (Stream controls scrolling) */}
              <MessageList />

              {/* Sticky input */}
              <div className="sticky bottom-0 z-20 bg-primary border-t border-primary px-2 py-1">
                <MessageInput
                  grow={false}
                  enableMentions
                  commands={["giphy", "shrug", "me"]}
                  AttachmentButton={() => null}
                  InputButtons={() => (
                    <div className="flex items-center gap-1">
                      <ChatPlusMenu />
                    </div>
                  )}
                />
              </div>
            </Window>

            <Thread />
          </Channel>
        </Chat>
      </div>
    </div>
  );
};

export default StreamChatBox;
