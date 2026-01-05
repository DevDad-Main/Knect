import { createContext, useContext, useState, useEffect } from "react";
import { StreamChat } from "stream-chat";
import { useApp } from "./AppContext";

const StreamChatContext = createContext();

export const StreamChatProvider = ({ children }) => {
  const { user } = useApp();
  const [chatClient, setChatClient] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);

  // Initialize Stream Chat client
  useEffect(() => {
    if (user && !chatClient) {
      initializeChatClient();
    } else if (!user && chatClient) {
      disconnectChatClient();
    }

    return () => {
      if (chatClient) {
        disconnectChatClient();
      }
    };
  }, [user]);

  const initializeChatClient = async () => {
    try {
      setIsConnecting(true);
      setError(null);

      // Check if API key is available
      const apiKey = import.meta.env.VITE_STREAM_CHAT_API_KEY;
      console.log('Stream Chat API Key available:', !!apiKey);
      if (!apiKey || apiKey === 'your_stream_chat_api_key') {
        throw new Error('VITE_STREAM_CHAT_API_KEY not configured properly');
      }

      // Get token from backend
      const token = await getStreamChatToken();
      console.log('Stream Chat token received:', !!token);

      // Initialize Stream Chat client
      const client = StreamChat.getInstance(apiKey);

      // Connect user
      await client.connectUser(
        {
          id: user._id,
          name: user.fullName,
          username: user.username,
          image: user.profile_photo,
        },
        token
      );

      setChatClient(client);
      setIsConnecting(false);
      console.log('Stream Chat connected successfully');
    } catch (err) {
      console.error('Failed to initialize Stream Chat:', err);
      setError(`Stream Chat Error: ${err.message}`);
      setIsConnecting(false);
    }
  };

  const getStreamChatToken = async () => {
    // Try to get token from backend first
    try {
      // Try the endpoint path from your backend
      const backendUrl = `${import.meta.env.VITE_BASEURL}/v1/auth/stream/chat/token`;
      console.log('Fetching token from:', backendUrl);
      console.log('Request body:', {
        userId: user._id,
        username: user.username,
        name: user.fullName,
        image: user.profile_photo,
      });

      const response = await fetch(backendUrl, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          userId: user._id,
          username: user.username,
          name: user.fullName,
          image: user.profile_photo,
        }),
      });

      console.log('Token response status:', response.status);
      console.log('Token response ok:', response.ok);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (response.ok) {
        const data = await response.json();
        console.log('Token response data:', data);
        return data.data.token; // Token is nested under data.token
      } else {
        const errorText = await response.text();
        console.error('Token endpoint error:', response.status, errorText);

        // Try to parse error as JSON
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(`Token endpoint returned ${response.status}: ${errorData.message || errorData.error || errorText}`);
        } catch {
          throw new Error(`Token endpoint returned ${response.status}: ${errorText}`);
        }
      }
    } catch (err) {
      console.error('Backend token endpoint error:', err);
      throw new Error(`Failed to get token from backend: ${err.message}`);
    }
  };

  const disconnectChatClient = async () => {
    if (chatClient) {
      await chatClient.disconnectUser();
      setChatClient(null);
    }
  };

  const createDirectMessageChannel = async (otherUserId) => {
    if (!chatClient) {
      throw new Error('Chat client not initialized');
    }

    try {
      // Create a unique channel ID for direct messages
      const channelId = [user._id, otherUserId].sort().join('-');

      const channel = chatClient.channel('messaging', channelId, {
        members: [user._id, otherUserId],
        channel_type: 'direct', // Changed from 'type' to avoid reserved field conflict
      });

      await channel.watch();
      return channel;
    } catch (err) {
      console.error('Failed to create direct message channel:', err);
      throw err;
    }
  };

  const getDirectMessageChannels = async () => {
    if (!chatClient) {
      return [];
    }

    try {
      // Get all direct message channels for the current user
      const filters = {
        type: 'messaging',
        members: { $in: [user._id] },
      };

      const sort = { last_message_at: -1 };
      const channels = await chatClient.queryChannels(filters, sort);

      return channels;
    } catch (err) {
      console.error('Failed to get channels:', err);
      return [];
    }
  };

  return (
    <StreamChatContext.Provider
      value={{
        chatClient,
        isConnecting,
        error,
        createDirectMessageChannel,
        getDirectMessageChannels,
        disconnectChatClient,
      }}
    >
      {children}
    </StreamChatContext.Provider>
  );
};

export const useStreamChat = () => {
  const context = useContext(StreamChatContext);
  if (!context) {
    throw new Error("useStreamChat must be used within a StreamChatProvider");
  }
  return context;
};

export default StreamChatContext;
