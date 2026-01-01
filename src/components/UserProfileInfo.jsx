import { Calendar, MapPin, PenBox, UserIcon, Verified } from "lucide-react";
import React, { useState, useEffect } from "react";
import moment from "moment";
import { useCurrentUser } from "../hooks/useCurrentUser";

const UserProfileInfo = ({ user, posts, profileId, setShowEdit, onProfilePhotoClick }) => {
  const currentUser = useCurrentUser();

  return (
    <div className="relative py-4 px-6 md:px-8 bg-white">
      <div className="flex flex-col md:flex-row items-start gap-6">
        <div 
          className="w-32 h-32 border-4 border-white shadow-lg absolute -top-16 rounded-full cursor-pointer group"
          onClick={onProfilePhotoClick}
        >
          {user?.profile_photo ? (
            <>
              <img
                src={user.profile_photo}
                alt=""
                className="w-32 h-32 rounded-full z-2 object-cover"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 rounded-full flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-white bg-black/50 rounded-full p-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                  </svg>
                </div>
              </div>
            </>
          ) : (
            <UserIcon
              className="w-30 h-32 rounded-full z-2 object-cover"
              style={{ background: "white" }}
            />
          )}
        </div>

        <div className="w-full pt-16 md:pt-0 md:pl-36">
          <div className="flex flex-col md:flex-row items-start justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">
                  {user.fullName}
                </h1>
                <Verified className="CSS" />
              </div>
              <p className="text-gray-600">
                {user.username ? `@${user.username}` : "Add a username"}
              </p>
            </div>
            {/* If user is not on other profile that means he is opening jis profile so we give the edit butto */}
            {profileId === currentUser?._id && (
              <button
                onClick={() => setShowEdit(true)}
                className="flex items-center justify-center gap-2 border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded-lg font-medium transition-colors mt-4 md:mt-0 cursor-pointer"
              >
                <PenBox className="w-4 h-4" />
                Edit
              </button>
            )}
          </div>
          <p className="text-gray-700 text-sm max-w-md mt-4">{user.bio}</p>
          {/* Location and Created At */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500 mt-4">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
              {user.location ? user.location : "Add Location"}
            </span>

            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              Joined{" "}
              <span className="font-medium">
                {moment(user.createdAt).fromNow()}
              </span>
            </span>
          </div>

          <div className="flex items-center gap-6 mt-6 border-t border-gray-200 pt-4">
            {/* Posts */}
            <div>
              <span className="sm:text-xl font-bold text-gray-900">
                {posts.length}
              </span>
              <span className="text-xs sm:text-sm text-gray-500 ml-1.5">
                Posts
              </span>
            </div>

            {/* Followers */}
            <div>
              <span className="sm:text-xl font-bold text-gray-900">
                {user.followers.length}
              </span>
              <span className="text-xs sm:text-sm text-gray-500 ml-1.5">
                Followers
              </span>
            </div>
            {/* Following */}
            <div>
              <span className="sm:text-xl font-bold text-gray-900">
                {user.following.length}
              </span>
              <span className="text-xs sm:text-sm text-gray-500 ml-1.5">
                Following
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileInfo;
