import {
  BadgeCheck,
  Heart,
  MessageCircle,
  PenBox,
  Share,
  TrashIcon,
  UserIcon,
} from "lucide-react";
import moment from "moment";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { updateData } from "./utils";
import { useCurrentUser } from "../hooks/useCurrentUser";

const PostCard = ({ post, onDelete }) => {
  const navigate = useNavigate();
  const currentUser = useCurrentUser();
  const [likes, setLikes] = useState(post.likes_count);

  const postWithHashtag = post.content.replace(
    /(#\w+)/g,
    '<span class="text-indigo-600">$1</span>',
  );

  const handleLike = async () => {
    try {
      const data = await updateData("api/v1/post/like", { postId: post._id });
      if (data) {
        setLikes((prev) => {
          if (prev.includes(currentUser._id)) {
            return prev.filter((id) => id !== currentUser._id);
          } else {
            return [...prev, currentUser._id];
          }
        });
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    const postId = post._id;
    try {
      const data = await updateData(
        `api/v1/post/delete/${postId}`,
        {},
        "DELETE",
      );
      if (data) {
        if (onDelete) onDelete(post._id); // let parent update posts list
      }
    } catch (error) {
      toast.error(error.message || "Failed to delete post");
    }
  };

  const isOwner = post.user?._id === currentUser?._id;

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 space-y-4 w-full max-w-2xl relative hover:shadow-xl transition-all duration-200 ">
      {/* User Info*/}
      <div
        onClick={() => navigate("/profile/" + post.user._id)}
        className="inline-flex items-center gap-3 cursor-pointer"
      >
        {post.user?.profile_picture ? (
          <img
            src={post.user?.profile_picture}
            className="w-10 h-10 rounded-full shadow object-cover"
          />
        ) : (
          <UserIcon className="w-10 h-10 rounded-full shadow object-cover" />
        )}
        <div>
          <div className="flex items-center space-x-1">
            <span>{post.user?.full_name}</span>
            <BadgeCheck className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-gray-500 text-sm">
            @{post.user?.username} - {moment(post.createdAt).fromNow()}
          </div>
        </div>
      </div>

      {/* Trash Icon if owner */}
      {isOwner && (
        <>
          <button
            onClick={handleDelete}
            className="absolute top-4 right-11 text-gray-400 hover:text-blue-500 transition"
          >
            <PenBox className="w-5 h-5" />
          </button>
          <button
            onClick={handleDelete}
            className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition"
          >
            <TrashIcon className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Content */}
      {post.content && (
        <div
          className="text-gray-800 text-sm whitespace-pre-line"
          dangerouslySetInnerHTML={{ __html: postWithHashtag }}
        />
      )}

      {/* Images */}
      <div className="grid grid-cols-2 gap-2">
        {post.image_urls.map((img, index) => (
          <img
            key={index}
            src={img}
            className={`w-full h-48 object-cover rounded-lg ${post.image_urls.length === 1 && "col-span-2 h-auto"}`}
            alt=""
          />
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 text-gray-600 text-sm pt-2 border-t border-gray-300">
        <div className="flex items-center gap-1">
          <Heart
            className={`w-4 h-4 cursor-pointer ${likes.includes(currentUser?._id) && "text-red-500 fill-red-500"}`}
            onClick={handleLike}
          />
          <span>{likes.length}</span>
        </div>

        <div
          onClick={() => navigate(`/post/${post._id}`)}
          className="flex items-center gap-1 cursor-pointer hover:text-indigo-600"
        >
          <MessageCircle className="w-4 h-4" />
          <span>{post.commentsCount || 0}</span>
        </div>

        <div className="flex items-center gap-1">
          <Share className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};

export default PostCard;
