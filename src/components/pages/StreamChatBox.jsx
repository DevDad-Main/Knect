import React, { useEffect, useState } from "react";
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
   * Dynamic theme (kept from your version)
   * -------------------------------------------- */
  const getDynamicTheme = () => {
    const isDark = document.documentElement.classList.contains("dark");
    return {
      "--str-chat__primary-color": isDark ? "#4f46e5" : "#0064ff",
      "--str-chat__secondary-color": isDark ? "#7c3aed" : "#0d47a1",
      "--str-chat__background-color": isDark ? "var(--bg-primary)" : "#ffffff",
      "--str-chat__surface-color": isDark ? "var(--bg-secondary)" : "#f8fafc",
      "--str-chat__text-color": isDark ? "var(--text-primary)" : "#1a202c",
      "--str-chat__border-color": isDark ? "var(--border-primary)" : "#e2e8f0",
      "--str-chat__message-border-radius": "16px",
      "--str-chat__input-border-radius": "12px",
    };
  };

  /* --------------------------------------------
   * Channel bootstrap (SDK-first)
   * -------------------------------------------- */
  useEffect(() => {
    if (!chatClient || !userId) return;

    let isMounted = true;

    const init = async () => {
      try {
        const dmChannel = await createDirectMessageChannel(userId);

        if (!isMounted) return;

        await dmChannel.watch(); // ensures presence, typing, read states
        setChannel(dmChannel);
      } catch (err) {
        console.error("Failed to init DM:", err);
        toast.error("Failed to open chat");
      }
    };

    init();

    return () => {
      isMounted = false;
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
    <div className="h-screen flex flex-col bg-primary" style={getDynamicTheme()}>
      {/* Mobile back bar */}
      <div className="lg:hidden flex items-center gap-2 px-3 py-2 border-b border-primary">
        <button
          onClick={() => navigate("/messages")}
          className="p-2 hover:bg-secondary/50 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5 text-primary" />
        </button>
        <span className="text-sm text-tertiary">Back</span>
      </div>

      <Chat
        client={chatClient}
        theme={
          document.documentElement.classList.contains("dark")
            ? "messaging dark"
            : "messaging light"
        }
      >
        <Channel channel={channel}>
          <Window>
            {/* Stream SDK Header (presence, typing, avatars) */}
            <ChannelHeader />

            {/* Messages */}
            <MessageList />

            {/* Input with GIFs, commands, uploads, mentions */}
            <MessageInput
              grow
              enableMentions
              commands={["giphy", "shrug", "me"]}
              noFiles={false}
              AttachmentButton={() => null} // ✅ MUST be a function
              InputButtons={() => (
                <div className="flex items-center gap-1">
                  <ChatPlusMenu />
                </div>
              )}
            />
          </Window>

          {/* Threads (replies) */}
          <Thread />
        </Channel>
      </Chat>
    </div>
  );
};

export default StreamChatBox;
