import React, { useState, useEffect } from "react";
import {
  Link,
  MapPin,
  MessageCircle,
  Plus,
  UserIcon,
  UserPlus,
  Verified
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
    currentUser?.following.includes(user._id),
  );

  // const fetchUser = async () => {
  //   try {
  //     const data = await fetchData(`api/v1/user/user`);
  //     if (data) {
  //       setCurrentUser(data);
  //     }
  //   } catch (error) {
  //     toast.error(error.message);
  //   }
  // };

  useEffect(() => {
    // fetchUser();
  }, [currentUser]);

  const handleFollow = async () => {
    try {
      const data = await updateData("v1/auth/follow", {
        id: user._id,
      });

      if (data) {
        // toast.success(data.message);
        setIsFollowing(true);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleConnectionRequest = async () => {
    if (currentUser.connections.includes(user._id)) {
      return navigate(`/messages/${user._id}`);
    }

    try {
      const data = await updateData(`v1/auth/connect`, { id: user._id });
    } catch (error) {
      toast.error(error.message);
    }
  };
  return (
    <div
      key={user._id}
      className="p-4 pt-6 flex flex-col justify-between w-72 shadow-lg border border-secondary rounded-lg bg-primary"
    >
      <div className="CSS text-center">
        {user?.profile_photo ? (
          <img
            src={user.profile_photo.url}
            alt=""
            className="rounded-full w-24 h-24 shadow-md mx-auto object-cover"
          />
        ) : (
          <UserIcon className="rounded-full w-24 h-24 shadow-md mx-auto object-cover" />
        )}

        {/* Name + Verified */}
        <div className="mt-4 flex items-center justify-center gap-1">
          <p className="font-semibold">
            {user.fullName || user.full_name}
          </p>
          <Verified className="h-4 w-4 text-blue-500" />
        </div>

        {user.username && (
          <p className="text-tertiary font-light">@{user.username}</p>
        )}

        {user.bio && (
          <p className="text-secondary mt-2 text-center text-sm px-4">
            {user.bio}
          </p>
        )}
      </div>

      <div className="flex items-center justify-center gap-2 mt-4 text-xs text-tertiary">
        {user.location && (
          <div className="flex items-center gap-1 border border-secondary rounded-full px-3 py-1">
            <MapPin className="w-4 h-4" />
            {user.location}
          </div>
        )}

        <div className="flex items-center gap-1 border border-secondary rounded-full px-3 py-1">
          <span>{user.followers?.length || 0}</span> Followers
        </div>
      </div>

      <div className="flex mt-4 gap-2">
        {/* Follow Button */}
        <button
          onClick={handleFollow}
          disabled={isFollowing}
          className="w-full py-2 rounded-md flex justify-center items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 active:scale-95 transition text-white cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          {isFollowing ? "Following" : "Follow"}
        </button>
        {/* Connection Request Button / Message Button */}
        <button
          onClick={handleConnectionRequest}
          className="flex items-center justify-center w-16 border border-secondary text-tertiary group rounded-md cursor-pointer active:scale-95 transition bg-primary"
        >
          {currentUser?.connections?.includes(user._id) ? (
            <MessageCircle className="w-5 h-5 group-hover:scale-105 transition" />
          ) : (
            <Plus className="w-5 h-5 group-hover:scale-105 transition" />
          )}
        </button>
      </div>
    </div>
  );
};

export default UserCard;
