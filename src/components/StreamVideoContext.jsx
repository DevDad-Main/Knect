import React, { createContext, useContext, useState, useEffect } from "react";
import { useApp } from "./AppContext";

const StreamVideoContext = createContext();

export const StreamVideoProvider = ({ children }) => {
  const [videoClient, setVideoClient] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeVideoClient = async () => {
      try {
        if (!import.meta.env.VITE_STREAM_VIDEO_API_KEY) {
          throw new Error('Stream Video API key not configured');
        }

        // Note: In production, you'll get this token from your backend
        // For now, we'll use a development approach
        const client = new StreamVideoClient({
          apiKey: import.meta.env.VITE_STREAM_VIDEO_API_KEY,
          user: {
            id: user?._id || 'development-user', // This would come from your auth
            name: user?.fullName || 'Development User',
            image: user?.profile_photo,
          },
          token: 'development-token', // This would come from your backend
        });

        setVideoClient(client);
        setIsLoading(false);
        console.log('✅ Stream Video client initialized');
      } catch (err) {
        console.error('❌ Failed to initialize Stream Video:', err);
        setError(err.message);
        setIsLoading(false);
      }
    };

    initializeVideoClient();
  }, []);

  const startVideoCall = async (otherUserId, otherUserName) => {
    if (!videoClient) {
      throw new Error('Video client not initialized');
    }

    try {
      // Create a unique call ID
      const callId = `video-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Create the call
      const call = videoClient.call('default', callId, {
        data: {
          created_by_name: 'Current User',
          custom: {
            participant_name: otherUserName || 'User',
          },
        },
        settings: {
          video: {
            camera_default: 'front',
            enabled: true,
          },
          audio: {
            default_mic: 'front',
            enabled: true,
          },
        },
      });

      // Navigate to call page
      const roomId = `video-call-${callId}`;
      window.open(`/call/${otherUserId}?type=video&room=${roomId}&name=${encodeURIComponent(otherUserName)}`, '_blank');

      return call;
    } catch (err) {
      console.error('Failed to start video call:', err);
      throw err;
    }
  };

  const startVoiceCall = async (otherUserId, otherUserName) => {
    if (!videoClient) {
      throw new Error('Video client not initialized');
    }

    try {
      // Create a unique call ID
      const callId = `voice-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Create the call
      const call = videoClient.call('default', callId, {
        data: {
          created_by_name: 'Current User',
          custom: {
            participant_name: otherUserName || 'User',
          },
        },
        settings: {
          video: {
            enabled: false, // Voice only
          },
          audio: {
            default_mic: 'front',
            enabled: true,
          },
        },
      });

      // Navigate to call page
      const roomId = `voice-call-${callId}`;
      window.open(`/call/${otherUserId}?type=voice&room=${roomId}&name=${encodeURIComponent(otherUserName)}`, '_blank');

      return call;
    } catch (err) {
      console.error('Failed to start voice call:', err);
      throw err;
    }
  };

  return (
    <StreamVideoContext.Provider
      value={{
        videoClient,
        isLoading,
        error,
        startVideoCall,
        startVoiceCall,
      }}
    >
      {children}
    </StreamVideoContext.Provider>
  );
};

export const useStreamVideo = () => {
  const context = useContext(StreamVideoContext);
  if (!context) {
    throw new Error("useStreamVideo must be used within a StreamVideoProvider");
  }
  return context;
};

export default StreamVideoContext;