import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStreamVideo } from '../StreamVideoContext';
import { StreamCall, StreamVideo, SpeakerLayout, CallControls, useCallStateHooks } from '@stream-io/video-react-sdk';
import { PhoneOff, Mic, MicOff, Video, VideoOff, Maximize2, Users, Settings } from 'lucide-react';
import { ArrowLeft } from 'lucide-react';
import 'stream-chat-react/dist/css/v2/index.css';
import '@stream-io/video-react-sdk/dist/css/styles.css';

const StreamCallScreen = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { videoClient, isLoading, error } = useStreamVideo();
  
  // Get call info from URL params
  const urlParams = new URLSearchParams(window.location.search);
  const callType = urlParams.get('type') || 'video';
  const roomId = urlParams.get('room');
  const participantName = urlParams.get('name') || 'User';
  
  const [call, setCall] = useState(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  
  const { useCall, useRemoteParticipants, useLocalParticipant } = useCallStateHooks();

  // Initialize call when component mounts
  useEffect(() => {
    if (videoClient && roomId) {
      const callInstance = videoClient.call('default', roomId);
      setCall(callInstance);
      
      // Join the call
      callInstance.join({
        microphone: {
          enabled: true,
        },
        camera: {
          enabled: callType === 'video',
        },
      });

      return () => {
        // Leave call when unmounting
        if (callInstance) {
          callInstance.leave();
        }
      };
    }
  }, [videoClient, roomId]);

  const handleEndCall = () => {
    if (call) {
      call.leave();
      navigate('/messages');
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (error) {
    return (
      <div className="h-screen bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 p-6 rounded-lg max-w-md mx-auto">
            <h2 className="text-xl font-bold mb-4">Video Call Error</h2>
            <p className="mb-4">{error}</p>
            <button
              onClick={() => navigate('/messages')}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Back to Messages
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="h-screen bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-primary">Initializing video call...</p>
        </div>
      </div>
    );
  }

  if (!call) {
    return (
      <div className="h-screen bg-primary flex items-center justify-center">
        <div className="text-center">
          <p className="text-secondary">Call not found</p>
          <button
            onClick={() => navigate('/messages')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors mt-4"
          >
            Back to Messages
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/messages')}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="text-white">
            <h1 className="text-lg font-semibold">
              {callType === 'video' ? '📹 Video Call' : '📞 Voice Call'}
            </h1>
            <p className="text-sm text-gray-400">with {participantName}</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/messages')}
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
        >
          <Settings className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* Video Call Content */}
      <StreamVideo client={videoClient} call={call}>
        <SpeakerLayout participantsBarPosition="bottom">
          <CallControls onLeaveCall={handleEndCall} />
        </SpeakerLayout>
      </StreamVideo>

      {/* Local Video Picture-in-Picture */}
      <div className="absolute top-4 left-4 w-32 h-24 bg-gray-800 rounded-lg border border-gray-600 shadow-lg overflow-hidden">
        <useLocalParticipant>
          {(localParticipant) => (
            <div className="relative w-full h-full">
              {/* User Avatar */}
              <div className="absolute inset-0 flex items-center justify-center bg-gray-700">
                <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  You
                </div>
              </div>
              {/* Video Placeholder */}
              <div className="text-center text-white p-2 text-xs">
                {callType === 'video' ? 'Camera Off' : 'Voice Only'}
              </div>
            </div>
          )}
        </useLocalParticipant>
      </div>
    </div>
  );
};

export default StreamCallScreen;