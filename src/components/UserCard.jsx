import React, { useState, useEffect } from "react";
import {
  MapPin,
  MessageCircle,
  UserIcon,
  UserPlus,
  Verified,
} from "lucide-react";
import { updateData } from "./utils";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { useTheme } from "./ThemeContext";

const UserCard = ({ user }) => {
  const navigate = useNavigate();
  const currentUser = useCurrentUser();
  const { theme } = useTheme();

  const [isFollowing, setIsFollowing] = useState(
    currentUser?.following.includes(user._id)
  );

  useEffect(() => { }, [currentUser]);

  const handleFollow = async () => {
    try {
      const data = await updateData("v1/auth/follow", {
        id: user._id,
      });

      if (data) {
        setIsFollowing(true);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleConnectionOrMessage = async () => {
    // ✅ If already connected → go to messages
    if (currentUser?.connections?.includes(user._id)) {
      return navigate(`/messages/${user._id}`);
    }

    // ✅ Otherwise → send connection request
    try {
      await updateData("v1/auth/connect", { id: user._id });
      toast.success("Connection request sent");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleProfileClick = () => {
    navigate(`/profile/${user._id}`);
  };

  const isConnected = currentUser?.connections?.includes(user._id);

  return (
    <div
      key={user._id}
      className="p-4 pt-6 flex flex-col justify-between w-full lg:w-72 max-w-xs
                 shadow-lg border border-secondary rounded-lg bg-primary
                 cursor-pointer hover:shadow-xl transition-shadow duration-200
                 mx-auto lg:mx-0"
      onClick={handleProfileClick}
    >
      {/* Avatar */}
      <div className="text-center">
        {user?.profile_photo ? (
          <img
            src={user.profile_photo.url}
            alt=""
            className="rounded-full w-20 h-20 lg:w-24 lg:h-24 shadow-md mx-auto
                       object-cover hover:scale-105 transition-transform"
          />
        ) : (
          <UserIcon className="w-20 h-20 lg:w-24 lg:h-24 mx-auto" />
        )}

        {/* Name */}
        <div className="mt-3 flex items-center justify-center gap-1">
          <p className="font-semibold text-sm lg:text-base">
            {user.fullName || user.full_name}
          </p>
          <Verified className="h-4 w-4 text-blue-500" />
        </div>

        {user.username && (
          <p className="text-tertiary text-xs lg:text-sm">
            @{user.username}
          </p>
        )}

        {user.bio && (
          <p className="text-secondary mt-2 text-xs lg:text-sm px-2 line-clamp-2">
            {user.bio}
          </p>
        )}
      </div>

      {/* Meta */}
      <div className="flex items-center justify-center gap-2 mt-3 text-xs text-tertiary">
        {user.location && (
          <div className="flex items-center gap-1 border border-secondary rounded-full px-3 py-1">
            <MapPin className="w-4 h-4" />
            <span>{user.location}</span>
          </div>
        )}

        <div className="flex items-center gap-1 border border-secondary rounded-full px-3 py-1">
          <span>{user.followers?.length || 0}</span>
          <span>Followers</span>
        </div>
      </div>

      {/* ACTIONS */}
      <div
        className="flex mt-4 gap-2"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Primary: Follow */}
        <button
          onClick={handleFollow}
          disabled={isFollowing}
          className="w-full py-2 rounded-md flex justify-center items-center gap-2
                     bg-gradient-to-r from-indigo-500 to-purple-600
                     hover:from-indigo-600 hover:to-purple-700
                     active:scale-95 transition text-white
                     text-xs lg:text-sm disabled:opacity-70"
        >
          <UserPlus className="w-4 h-4" />
          {isFollowing ? "Following" : "Follow"}
        </button>

        {/* ✅ Secondary: Connect / Message (FIXED UX) */}
        <button
          onClick={handleConnectionOrMessage}
          className="w-full py-2 rounded-md flex justify-center items-center gap-2
                     border border-secondary text-primary
                     hover:bg-secondary/30 active:scale-95 transition
                     text-xs lg:text-sm"
        >
          {isConnected ? (
            <>
              <MessageCircle className="w-4 h-4" />
              Message
            </>
          ) : (
            <>
              <UserPlus className="w-4 h-4" />
              Connect
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default UserCard;
