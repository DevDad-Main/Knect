import { Calendar, MapPin, PenBox, UserIcon, Verified } from "lucide-react";
import React, { useState, useEffect } from "react";
import moment from "moment";
import { useCurrentUser } from "../hooks/useCurrentUser";

const UserProfileInfo = ({ user, posts, profileId, setShowEdit, onProfilePhotoClick, onStatClick, activeTab }) => {
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

        <div className="w-full pt-16 md:pt-0 md:pl-36 relative">
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
                  className="absolute -top-2 -right-2 p-2 rounded-full bg-primary border border-secondary hover:bg-tertiary shadow-md transition-all duration-200 group order-1 sm:order-2 cursor-pointer"
                >
                  <PenBox className="w-3.5 h-3.5 text-tertiary group-hover:text-primary" />
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

          <div className="mt-6 border-t border-secondary pt-4">
            <div className="bg-primary rounded-xl shadow-md p-1 flex w-fit mx-auto">

              {/* Followers */}
              <button
                onClick={() => onStatClick && onStatClick('followers')}
                className="flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer text-secondary hover:text-primary"
              >
                <div className="text-center">
                  <span className="sm:text-xl font-bold block">{user.followers?.length || 0}</span>
                  <span className="text-xs sm:text-sm">Followers</span>
                </div>
              </button>

              {/* Following */}
              <button
                onClick={() => onStatClick && onStatClick('following')}
                className="flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer text-secondary hover:text-primary"
              >
                <div className="text-center">
                  <span className="sm:text-xl font-bold block">{user.following?.length || 0}</span>
                  <span className="text-xs sm:text-sm">Following</span>
                </div>
              </button>

              {/* Connections - only show for own profile */}
              {profileId === currentUser?._id && (
                <button
                  onClick={() => onStatClick && onStatClick('connections')}
                  className="flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer text-secondary hover:text-primary"
                >
                  <div className="text-center">
                    <span className="sm:text-xl font-bold block">{user.connections?.length || 0}</span>
                    <span className="text-xs sm:text-sm">Connections</span>
                  </div>
                </button>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default UserProfileInfo;
