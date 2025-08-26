import { PenBox, Verified } from "lucide-react";
import React, { useState, useEffect } from "react";

const UserProfileInfo = ({ user, posts, profileId, setShowEdit }) => {
  return (
    <div className="relative py-4 px-6 md:px-8 bg-white">
      <div className="flex flex-col md:flex-row items-start gap-6">
        <div className="w-32 h-32 border-4 border-white shadow-lg absolute -top-16 rounded-full">
          <img
            src={user.profile_picture}
            alt=""
            className="absolute rounded-full z-2"
          />
        </div>

        <div className="w-full pt-16 md:pt-0 md:pl-36">
          <div className="flex flex-col md:flex-ro items-start justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">
                  {user.full_name}
                </h1>
                <Verified className="CSS" />
              </div>
              <p className="text-gray-600">
                {user.username ? `@${user.username}` : "Add a username"}
              </p>
            </div>
            {/* If user is not on other profile that means he is opening jis profile so we give the edit butto */}
            {!profileId && (
              <button
                onClick={() => setShowEdit(true)}
                className="flex items-center gap-2 border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded-lg font-medium transition-colors mt-4 md:mt-0"
              >
                <PenBox className="w-4 h-4" />
                Edit
              </button>
            )}
          </div>
          <p className="text-gray-700 text-sm max-w-md mt-4">{user.bio}</p>
        </div>
      </div>
    </div>
  );
};

export default UserProfileInfo;
