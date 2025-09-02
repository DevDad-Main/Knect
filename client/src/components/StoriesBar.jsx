import React, { useState, useEffect } from "react";
import { Plus, TrashIcon } from "lucide-react";
import moment from "moment";
import StoryModal from "./StoryModal";
import StoryViewer from "./StoryViewer";
import { fetchData, updateData } from "./utils"; // assuming updateData handles DELETE
import toast from "react-hot-toast";
import { useCurrentUser } from "../hooks/useCurrentUser";

const StoriesBar = () => {
  const [stories, setStories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [viewStory, setViewStory] = useState(false);

  // 👇 get logged in user id from token/session
  // const user = JSON.parse(sessionStorage.getItem("token"));
  const user = useCurrentUser();
  const userId = user?._id;

  const fetchStories = async () => {
    try {
      const data = await fetchData("api/v1/story/stories");
      if (data) setStories(data);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (storyId) => {
    try {
      const data = await updateData(
        `api/v1/story/delete/${storyId}`,
        {},
        "DELETE",
      );
      if (data) {
        fetchStories(); // refresh list
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchStories();
  }, []);

  return (
    <div className="w-screen sm:w-[calc(100vw-240px)] lg:max-w-2xl no-scrollbar overflow-x-auto px-4">
      <div className="flex gap-4 pb-5">
        {/* Add story card */}
        <div
          onClick={() => setShowModal(true)}
          className="rounded-lg shadow-sm min-w-30 max-w-30 max-h-40 aspect-[3/4] cursor-pointer hover:shadow-lg transition-all duration-200 border-2 border-dashed border-indigo-300 bg-gradient-to-b from-indigo-50 to-white"
        >
          <div className="h-full flex flex-col items-center justify-center p-4">
            <div className="size-10 bg-indigo-500 rounded-full flex items-center justify-center mb-3">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <p className="text-sm font-medium text-slate-700">Create Story</p>
          </div>
        </div>

        {/* Render story cards */}
        {stories.map((story) => {
          const content =
            typeof story.content === "string" ? story.content : "";
          const userName = story.user?.full_name || "Unknown";
          const userImg = story.user?.profile_picture || "/fallback.png";
          const createdAt = story.createdAt
            ? moment(story.createdAt).fromNow()
            : "";

          const isOwner = story.user?._id === userId; // 👈 check owner

          return (
            <div
              key={story._id}
              onClick={() => setViewStory(story)}
              className="relative rounded-lg shadow min-w-30 max-w-30 max-h-40 cursor-pointer hover:shadow-lg transition-all duration-200 bg-gradient-to-b active:scale-95"
              style={{ background: story.background_color }}
            >
              <img
                src={userImg}
                alt={userName}
                className="absolute size-8 top-3 left-3 z-10 rounded-full ring ring-gray-100 shadow"
              />

              {/* only show delete button if owner */}
              {isOwner && (
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // prevent opening story
                    handleDelete(story._id);
                  }}
                  className="absolute right-1 top-2 text-white hover:text-red-500 transition"
                >
                  <TrashIcon className="w-6 h-6" />
                </button>
              )}

              <p className="absolute top-18 left-3 text-white/60 text-sm truncate max-w-24">
                {content}
              </p>
              <p className="text-white absolute bottom-1 right-2 z-10 text-xs">
                {createdAt}
              </p>

              {story.media_type !== "text" && (
                <div className="absolute inset-0 z-1 rounded-lg bg-black overflow-hidden">
                  {story.media_type === "image" ? (
                    <img
                      src={story.media_url}
                      alt=""
                      className="h-full w-full object-cover hover:scale-110 transition duration-500 opacity-70 hover:opacity-80"
                    />
                  ) : (
                    <video
                      src={story.media_url}
                      className="h-full w-full object-cover hover:scale-110 transition duration-500 opacity-70 hover:opacity-80"
                    />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modals */}
      {showModal && (
        <StoryModal setShowModal={setShowModal} fetchStories={fetchStories} />
      )}
      {viewStory && (
        <StoryViewer viewStory={viewStory} setViewStory={setViewStory} />
      )}
    </div>
  );
};

export default StoriesBar;
