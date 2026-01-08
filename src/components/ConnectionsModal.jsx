import React, { useState, useEffect } from "react";
import {
  Users,
  UserPlus,
  UserCheck,
  UserRoundPen,
  MessageSquare,
  UserIcon,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { updateData, fetchData } from "../components/utils";

const ConnectionsModal = ({
  isOpen,
  onClose,
  userId,
  initialTab = "followers",
  isOwnProfile = false
}) => {
  const [user, setUser] = useState(null);
  const [currentTab, setCurrentTab] = useState(initialTab);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchConnections = async () => {
    try {
      setLoading(true);
      const endpoint = isOwnProfile ? "v1/auth/connections" : `v1/auth/user-connections/${userId}`;
      const data = await fetchData(endpoint);

      if (data) {
        setUser(data);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUnfollow = async (targetUserId) => {
    try {
      const data = await updateData("v1/auth/unfollow", { id: targetUserId });

      if (data) {
        setUser(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            following: prev.following?.filter(u => u._id !== targetUserId) || []
          };
        });
        fetchConnections();
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const acceptConnection = async (targetUserId) => {
    try {
      const data = await updateData("v1/auth/accept", { id: targetUserId });

      if (data) {
        setUser(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            pendingConnections: prev.pendingConnections?.filter(u => u._id !== targetUserId) || [],
            connections: [...(prev.connections || []), prev.pendingConnections?.find(u => u._id === targetUserId)].filter(Boolean)
          };
        });
        fetchConnections();
      } else {
        toast.error("Failed to accept connection");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (isOpen && userId) {
      fetchConnections();
    }
  }, [isOpen, userId]);

  const dataArray = [
    {
      label: "Followers",
      value: user?.followers || [],
      icon: Users,
    },
    {
      label: "Following",
      value: user?.following || [],
      icon: UserCheck,
    },
  ];

  if (isOwnProfile) {
    dataArray.push(
      {
        label: "Pending",
        value: user?.pendingConnections || [],
        icon: UserRoundPen,
      },
      {
        label: "Connections",
        value: user?.connections || [],
        icon: UserPlus,
      }
    );
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-primary rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-secondary">
          <h2 className="text-2xl font-bold text-primary">
            {isOwnProfile ? "Your Connections" : "User Connections"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-tertiary transition-colors"
          >
            <X className="w-5 h-5 text-tertiary" />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="inline-flex flex-wrap items-center border border-secondary rounded-md p-1 m-6 bg-primary shadow-sm">
              {dataArray.map((tab) => (
                <button
                  onClick={() => setCurrentTab(tab.label)}
                  key={tab.label}
                  className={`cursor-pointer flex items-center px-3 py-1 text-sm rounded-md transition-colors ${currentTab === tab.label ? "bg-tertiary font-medium text-primary" : "text-tertiary hover:text-primary"}`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="ml-1">{tab.label}</span>
                  <span className="ml-2 text-xs bg-gray100 text-gray-700 px-2 py-0.5 rounded-full">
                    {tab.value.length}
                  </span>
                </button>
              ))}
            </div>

            {/* Users List */}
            <div className="px-6 pb-6 max-h-96 overflow-y-auto">
              <div className="flex flex-wrap gap-6">
                {(() => {
                  const currentTabData = dataArray.find((item) => item.label === currentTab);
                  if (!currentTabData || !currentTabData.value || currentTabData.value.length === 0) {
                    return (
                      <div className="flex items-center justify-center w-full py-8">
                        <p className="text-tertiary">No {currentTab.toLowerCase()} found</p>
                      </div>
                    );
                  }
                  return currentTabData.value.map((userItem) => (
                    <div
                      key={userItem._id}
                      className="w-full max-w-88 flex gap-5 p-6 bg-primary shadow rounded-md border border-secondary"
                    >
                      {userItem?.profile_photo ? (
                        <img
                          src={userItem.profile_photo}
                          alt=""
                          className="mt-6 rounded-full w-16 h-16 shadow-md mx-auto object-cover"
                        />
                      ) : (
                        <UserIcon className=" mt-6 rounded-full w-16 h-16 shadow-md mx-auto" />
                      )}

                      <div className="flex-1">
                        <p className="font-medium text-primary">{userItem.full_name}</p>
                        <p className="text-tertiary">@{userItem.username}</p>
                        <p className="text-tertiary">{userItem.bio?.slice(0, 30) || ''}...</p>
                        <div className="flex max-sm:flex-col gap-2 mt-4">
                          <button
                            onClick={() => navigate(`/profile/${userItem._id}`)}
                            className="w-full p-2 text-sm rounded accent-gradient hover:opacity-90 active:scale-95 transition text-white cursor-pointer"
                          >
                            View Profile
                          </button>
                          {isOwnProfile && currentTab === "Following" && (
                            <button
                              onClick={() => handleUnfollow(userItem._id)}
                              className="w-full p-2 text-sm rounded bg-tertiary hover:bg-quaternary text-primary active:scale-95 transition cursor-pointer"
                            >
                              Unfollow
                            </button>
                          )}
                          {isOwnProfile && currentTab === "Pending" && (
                            <button
                              onClick={() => acceptConnection(userItem._id)}
                              className="w-full p-2 text-sm rounded bg-tertiary hover:bg-quaternary text-primary active:scale-95 transition cursor-pointer"
                            >
                              Accept
                            </button>
                          )}
                          {isOwnProfile && currentTab === "Connections" && (
                            <button
                              onClick={() => navigate(`/messages/${userItem._id}`)}
                              className="w-full p-2 text-sm rounded bg-slate-100 hover:bg-slate-200 text-black active:scale-95 transition cursor-pointer flex items-center justify-center gap-1"
                            >
                              <MessageSquare className="w-4 h-4" />
                              Message
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ConnectionsModal;
