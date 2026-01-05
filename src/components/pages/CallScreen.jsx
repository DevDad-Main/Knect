import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Phone, Video, PhoneOff, VideoOff, Mic, MicOff, Maximize2 } from 'lucide-react';
import toast from 'react-hot-toast';

const CallScreen = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [callType, setCallType] = useState('video');
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [otherUserName, setOtherUserName] = useState('User');
  
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    // Parse URL parameters
    const params = new URLSearchParams(window.location.search);
    const type = params.get('type') || 'video';
    const name = params.get('name') || 'User';
    
    setCallType(type);
    setOtherUserName(name);

    // Initialize WebRTC connection
    initializeCall();

    return () => {
      // Cleanup on unmount
      endCall();
    };
  }, [userId]);

  useEffect(() => {
    // Update call duration
    const interval = setInterval(() => {
      if (isConnected) {
        setCallDuration(prev => prev + 1);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isConnected]);

  const initializeCall = async () => {
    try {
      // Simulate connection (replace with actual WebRTC)
      setTimeout(() => {
        setIsConnected(true);
        toast.success(`Connected to ${otherUserName}`);
      }, 2000);

      // In a real implementation, you would:
      // 1. Create WebRTC peer connection
      // 2. Get user media (camera/mic)
      // 3. Set up signaling server
      // 4. Handle ICE candidates and offers/answers
      
    } catch (error) {
      console.error('Failed to initialize call:', error);
      toast.error('Failed to start call');
    }
  };

  const endCall = () => {
    // End WebRTC connection
    setIsConnected(false);
    navigate('/messages');
    toast('Call ended');
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    // In real implementation: toggle local audio track
  };

  const toggleVideo = () => {
    setIsVideoOff(!isVideoOff);
    // In real implementation: toggle local video track
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-screen bg-gray-900 flex flex-col">
      {/* Main Call Area */}
      <div className="flex-1 relative">
        {/* Remote Video Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              {callType === 'video' ? (
                <Video className="w-24 h-24 text-gray-600 mx-auto mb-4" />
              ) : (
                <Phone className="w-24 h-24 text-gray-600 mx-auto mb-4" />
              )}
              <h2 className="text-white text-2xl font-semibold mb-2">{otherUserName}</h2>
              <p className="text-gray-400">
                {isConnected ? formatDuration(callDuration) : 'Connecting...'}
              </p>
            </div>
          </div>
        </div>

        {/* Local Video (Video Call) */}
        {callType === 'video' && (
          <div className="absolute top-4 right-4 w-32 h-48 bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
              // In real implementation: srcObject would be local video stream
              poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100' height='100' fill='%234B5563'/%3E%3Ctext x='50' y='50' text-anchor='middle' dy='.3em' fill='%239CA3AF' font-family='sans-serif' font-size='14'%3EYou%3C/text%3E%3C/svg%3E"
            />
          </div>
        )}
      </div>

      {/* Call Controls */}
      <div className="bg-gray-800 p-6 border-t border-gray-700">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-4">
            
            {/* Mute/Unmute */}
            <button
              onClick={toggleMute}
              className={`p-4 rounded-full transition-all ${
                isMuted 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              {isMuted ? (
                <MicOff className="w-6 h-6 text-white" />
              ) : (
                <Mic className="w-6 h-6 text-white" />
              )}
            </button>

            {/* End Call */}
            <button
              onClick={endCall}
              className="p-4 bg-red-600 hover:bg-red-700 rounded-full transition-all"
            >
              <PhoneOff className="w-6 h-6 text-white" />
            </button>

            {/* Video On/Off (Video Call Only) */}
            {callType === 'video' && (
              <button
                onClick={toggleVideo}
                className={`p-4 rounded-full transition-all ${
                  isVideoOff 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                {isVideoOff ? (
                  <VideoOff className="w-6 h-6 text-white" />
                ) : (
                  <Video className="w-6 h-6 text-white" />
                )}
              </button>
            )}

            {/* Fullscreen (Video Call Only) */}
            {callType === 'video' && (
              <button
                className="p-4 bg-gray-700 hover:bg-gray-600 rounded-full transition-all"
                onClick={() => document.documentElement.requestFullscreen()}
              >
                <Maximize2 className="w-6 h-6 text-white" />
              </button>
            )}
          </div>

          {/* Call Status */}
          <div className="text-center mt-4">
            <p className="text-gray-400 text-sm">
              {isConnected 
                ? `${callType === 'video' ? 'Video' : 'Voice'} call with ${otherUserName}` 
                : `Connecting to ${otherUserName}...`
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CallScreen;