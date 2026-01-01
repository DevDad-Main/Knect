import { BadgeCheck, X } from "lucide-react";
import React, { useEffect, useState } from "react";

const StoryViewer = ({ viewStory, setViewStory }) => {
  const [progress, setProgress] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [videoCurrentTime, setVideoCurrentTime] = useState(0);
  const videoRef = React.useRef(null);

  useEffect(() => {
    let timer, progressInterval;
    let animationFrameId;

    //Media type is either text or image
    if (viewStory && viewStory.mediaType !== "video") {
      setProgress(0);

      const duration = 10000; // 10 seconds for text or image
      const setTime = 100;
      let elapsedTime = 0;

      progressInterval = setInterval(() => {
        elapsedTime += setTime;
        setProgress((elapsedTime / duration) * 100);
      }, setTime);

      //Close story after 10 seconds has finished
      timer = setTimeout(() => {
        setViewStory(null);
      }, duration);
    } else if (viewStory && viewStory.mediaType === "video") {
      // Smooth progress animation for videos
      let startTime = null;

      const animateProgress = (timestamp) => {
        if (!startTime) startTime = timestamp;
        if (videoRef.current && videoDuration > 0) {
          const currentTime = videoRef.current.currentTime;
          const progress = (currentTime / videoDuration) * 100;
          setProgress(progress);

          if (currentTime < videoDuration) {
            animationFrameId = requestAnimationFrame(animateProgress);
          }
        } else {
          animationFrameId = requestAnimationFrame(animateProgress);
        }
      };

      animationFrameId = requestAnimationFrame(animateProgress);
    }

    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [viewStory, setViewStory, videoDuration]);

  // Handle video time updates
  const handleVideoTimeUpdate = () => {
    if (videoRef.current && videoDuration > 0) {
      const currentTime = videoRef.current.currentTime;
      setVideoCurrentTime(currentTime);
      setProgress((currentTime / videoDuration) * 100);
    }
  };

  const handleVideoLoadedMetadata = () => {
    if (videoRef.current) {
      setVideoDuration(videoRef.current.duration);
      setVideoCurrentTime(0);
      setProgress(0);
    }
  };

  const handleCloseFunction = () => {
    setViewStory(null);
  };

  if (!viewStory) {
    return null;
  }
  const renderContent = () => {
    switch (viewStory.mediaType) {
      case "image":
        return (
          <img
            src={viewStory.media_url}
            alt=""
            className="max-w-full max-h-scree object-contain"
          />
        );
      case "video":
        return (
          <video
            ref={videoRef}
            // Automatically closes the story when we finish the video
            onEnded={() => setViewStory(null)}
            onTimeUpdate={handleVideoTimeUpdate}
            onLoadedMetadata={handleVideoLoadedMetadata}
            src={viewStory.media_url}
            className="max-h-screen w-full h-full object-contain"
            autoPlay
            playsInline
            muted
          />
        );
      case "text":
        return (
          <div className="w-full h-full flex items-center justify-center p-8 text-white text-2xl text-center">
            {viewStory.content}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className="fixed inset-0 h-screen bg-black bg-opacity-90 z-110 flex items-center justify-center"
      style={{
        backgroundColor:
          viewStory.mediaType === "text"
            ? viewStory.backgroundColour
            : "#000000",
      }}
    >
      {/* Progress Bar*/}
      <div className="absolute top-0 left-0 w-full h-1 bg-gray-700">
        <div
          className="h-full bg-white transition-none linear"
          style={{
            width: `${progress}%`,
            transition: viewStory?.mediaType === 'video' ? 'none' : 'width 100ms linear'
          }}
        ></div>
      </div>
      {/* User Info - Top Left*/}
      <div className="absolute top-4 left-4 flex items-center space-x-3 p-2 px-4 sm:p-4 sm:px-8 backdrop-blur-2xl rounded bg-black/50">
        <img
          src={viewStory?.profilePhoto || viewStory?.profile_photo}
          alt="users profile photo"
          className="size-7 sm:size-8 rounded-full object-cover border border-white"
        />
        <div className="text-white font-medium flex items-center gap-1.5">
          <span>{viewStory?.user?.username}</span>
          <BadgeCheck size={18} />
        </div>
      </div>
      {/* Close Button*/}
      <button
        onClick={handleCloseFunction}
        className="absolute top-4 right-4 text-white text-3xl font-bold"
      >
        <X className="w-8 h-8 hover:scale-110 transition cursor-pointer" />
      </button>
      {/* Content Wrapper */}
      <div className="max-w-[90vw] max-h-[90vh] flex items-center justify-center">
        {renderContent()}
      </div>
    </div>
  );
};

export default StoryViewer;
