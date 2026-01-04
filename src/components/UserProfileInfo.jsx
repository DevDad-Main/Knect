import { Calendar, MapPin, PenBox, UserIcon, Verified } from "lucide-react";
import React, { useState, useEffect } from "react";
import moment from "moment";
import { useCurrentUser } from "../hooks/useCurrentUser";

const UserProfileInfo = ({ user, posts, profileId, setShowEdit, onProfilePhotoClick }) => {
  const currentUser = useCurrentUser();

  return (
    <div className="relative py-4 px-6 md:px-8 bg-primary">
      <div className="flex flex-col md:flex-row items-start gap-6">
        <div
          className="w-32 h-32 border-4 border-primary shadow-lg absolute -top-16 rounded-full cursor-pointer group"
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
          <>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
              {/* Mobile: Edit button first, User details second */}
              {/* Desktop: User details first, Edit button second */}
              <div className="order-2 sm:order-1">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-primary">
                    {user.fullName}
                  </h1>
                  <Verified className="text-blue-500" />
                </div>
                <p className="text-tertiary">
                  {user.username ? `@${user.username}` : "Add a username"}
                </p>
              </div>
              {/* If user is not on other profile that means he is opening his profile so we give it edit button */}
              {profileId === currentUser?._id && (
                <button
                  onClick={() => setShowEdit(true)}
                  className="flex items-center justify-center gap-2 border border-secondary hover:bg-tertiary px-4 py-2 rounded-lg font-medium transition-colors order-1 sm:order-2 cursor-pointer"
                >
                  <PenBox className="w-4 h-4" />
                  Edit
                </button>
              )}
            </div>
          </>
          <p className="text-secondary text-sm max-w-md mt-4">{user.bio}</p>
          {/* Location and Created At */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-tertiary mt-4">
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

          <div className="flex items-center gap-6 mt-6 border-t border-secondary pt-4">
            {/* Posts */}
            <div>
              <span className="sm:text-xl font-bold text-primary">
                {posts.length}
              </span>
              <span className="text-xs sm:text-sm text-tertiary ml-1.5">
                Posts
              </span>
            </div>

            {/* Followers */}
            <div>
              <span className="sm:text-xl font-bold text-primary">
                {user.followers.length}
              </span>
              <span className="text-xs sm:text-sm text-tertiary ml-1.5">
                Followers
              </span>
            </div>
            {/* Following */}
            <div>
              <span className="sm:text-xl font-bold text-primary">
                {user.following.length}
              </span>
              <span className="text-xs sm:text-sm text-tertiary ml-1.5">
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