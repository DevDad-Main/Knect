import {
  BadgeCheck,
  Heart,
  MessageCircle,
  PenBox,
  Share,
  TrashIcon,
  UserIcon,
  X,
  ExternalLink,
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
  const [likes, setLikes] = useState(post.likesCount);
  const [selectedImage, setSelectedImage] = useState(null);

  const postWithHashtag = post.content.replace(
    /(#\w+)/g,
    '<span class="text-indigo-600">$1</span>',
  );

  const handleLike = async () => {
    try {
      const data = await updateData(
        `v1/posts/toggle-post-like/${post._id}`,
        {},
      );
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
        `v1/posts/delete-post/${postId}`,
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
    <div className="bg-primary rounded-xl shadow-lg p-4 space-y-4 w-full max-w-2xl relative hover:shadow-xl transition-all duration-200 ">
      {/* User Info*/}
      <div
        onClick={() => navigate("/profile/" + post.user._id)}
        className="inline-flex items-center gap-3 cursor-pointer"
      >
        {post.user?.profile_photo ? (
          <img
            src={post.user?.profile_photo}
            className="w-10 h-10 rounded-full shadow object-cover"
          />
        ) : (
          <UserIcon className="w-10 h-10 rounded-full shadow object-cover" />
        )}
        <div>
          <div className="flex items-center space-x-1">
            <span>{post.user?.fullName}</span>
            <BadgeCheck className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-tertiary text-sm">
            @{post.user?.username} - {moment(post.createdAt).fromNow()}
          </div>
        </div>
      </div>

      {/* Trash Icon if owner */}
      {isOwner && (
        <>
          { /*TODO: Add Update Post content functionality. */}
          {/* <button
             onClick={handleDelete}
             className="absolute top-4 right-11 text-gray-400 hover:text-blue-500 transition"
           >
             <PenBox className="w-5 h-5" />
           </button> */}
          <button
            onClick={handleDelete}
            className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition"
          >
            <TrashIcon className="w-5 h-5" />
          </button>
        </>
      )
      }

      {/* Content */}
      {
        post.content && (
          <div
            className="text-primary text-sm whitespace-pre-line"
            dangerouslySetInnerHTML={{ __html: postWithHashtag }}
          />
        )
      }

      {/* Images */}
      <div className="grid grid-cols-2 gap-2">
        {post.image_urls.map((img, index) => (
          <img
            key={index}
            src={img}
            className={`w-full h-48 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity ${post.image_urls.length === 1 && "col-span-2 h-auto"}`}
            alt=""
            onClick={() => setSelectedImage(img)}
          />
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 text-secondary text-sm pt-2 border-t border-secondary">
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
          <ExternalLink className="w-4 h-4" />
        </div>
      </div>

      {/* Image Modal */}
      {
        selectedImage && (
          <div
            className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <div className="relative max-w-7xl max-h-full">
              {/* Close Button */}
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
              >
                <X className="w-8 h-8" />
              </button>

              {/* Image */}
              <img
                src={selectedImage}
                alt="Full size image"
                className="max-w-full max-h-[80vh] object-contain rounded-lg"
                onClick={(e) => e.stopPropagation()}
              />

              {/* Download Button */}
              <a
                href={selectedImage}
                download
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="absolute -top-12 left-0 bg-white text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2 text-sm font-medium"
              >
                Save Image
              </a>
            </div>
          </div>
        )
      }
    </div >
  );
};

export default PostCard;
