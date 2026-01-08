import React, { useState, useEffect } from "react";
import {
  Users,
  UserPlus,
  UserCheck,
  UserRoundPen,
  MessageSquare,
  UserIcon,
  ArrowLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { updateData, fetchData } from "../components/utils";

const MobileConnectionsModal = ({
  isOpen,
  onClose,
  userId,
  initialTab = "followers",
  isOwnProfile = false
}) => {
  const [user, setUser] = useState(null);
  const [currentTab, setCurrentTab] = useState(initialTab);
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 1024 : false
  );
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

  if (!isMobile) return null;
  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 ${isOpen ? 'visible' : 'invisible'}`} data-mobile-connections-open={isOpen}>
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/60 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />

      {/* Bottom Sheet */}
      <div className={`absolute bottom-0 left-0 right-0 bg-primary rounded-t-3xl transition-transform duration-300 ease-out flex flex-col ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}
        style={{
          height: '85vh',
          maxHeight: '85vh',
          overflow: 'hidden'
        }}>

        {/* Handle bar */}
        <div className="flex justify-center py-3 flex-shrink-0">
          <div className="w-12 h-1 bg-tertiary/30 rounded-full"></div>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 pb-3 border-b border-secondary flex-shrink-0">
          <h3 className="text-lg font-semibold text-primary">
            {isOwnProfile ? "Your Connections" : "User Connections"}
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-secondary transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-tertiary" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex-shrink-0 px-4 py-3 border-b border-secondary">
          <div className="flex gap-2 overflow-x-auto">
            {dataArray.map((tab) => (
              <button
                onClick={() => setCurrentTab(tab.label)}
                key={tab.label}
                className={`flex items-center gap-2 px-4 py-2 text-sm rounded-full whitespace-nowrap transition-colors ${currentTab === tab.label
                    ? "bg-indigo-600 text-white"
                    : "bg-secondary text-tertiary hover:text-primary"
                  }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                  {tab.value.length}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Users List */}
        <div className="flex-1 overflow-y-auto px-4 py-3">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            (() => {
              const currentTabData = dataArray.find((item) => item.label === currentTab);
              if (!currentTabData || !currentTabData.value || currentTabData.value.length === 0) {
                return (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 bg-secondary rounded-full flex items-center justify-center">
                      <UserIcon className="w-8 h-8 text-tertiary" />
                    </div>
                    <h3 className="text-lg font-medium text-primary mb-2">No {currentTab.toLowerCase()} found</h3>
                    <p className="text-tertiary">
                      {currentTab === "Followers" && "No one is following you yet"}
                      {currentTab === "Following" && "You haven't followed anyone yet"}
                      {currentTab === "Pending" && "No pending connection requests"}
                      {currentTab === "Connections" && "No connections yet"}
                    </p>
                  </div>
                );
              }
              return (
                <div className="space-y-3">
                  {currentTabData.value.map((userItem) => (
                    <div
                      key={userItem._id}
                      className="bg-primary border border-secondary rounded-xl p-4 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex gap-3">
                        {/* Avatar */}
                        <div className="flex-shrink-0">
                          {userItem?.profile_photo ? (
                            <img
                              src={userItem.profile_photo}
                              alt=""
                              className="w-12 h-12 rounded-full object-cover border-2 border-primary shadow-sm"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                              <UserIcon className="w-6 h-6 text-tertiary" />
                            </div>
                          )}
                        </div>

                        {/* User Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-primary truncate">{userItem.full_name}</p>
                              <p className="text-tertiary text-sm">@{userItem.username}</p>
                            </div>
                          </div>

                          {userItem.bio && (
                            <p className="text-tertiary text-sm mb-3 line-clamp-2">
                              {userItem.bio}
                            </p>
                          )}

                          {/* Actions */}
                          <div className="flex gap-2">
                            <button
                              onClick={() => navigate(`/profile/${userItem._id}`)}
                              className="flex-1 px-3 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                            >
                              View Profile
                            </button>
                            {isOwnProfile && currentTab === "Following" && (
                              <button
                                onClick={() => handleUnfollow(userItem._id)}
                                className="flex-1 px-3 py-2 text-sm bg-secondary text-primary rounded-lg hover:bg-tertiary transition-colors"
                              >
                                Unfollow
                              </button>
                            )}
                            {isOwnProfile && currentTab === "Pending" && (
                              <button
                                onClick={() => acceptConnection(userItem._id)}
                                className="flex-1 px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                              >
                                Accept
                              </button>
                            )}
                            {isOwnProfile && currentTab === "Connections" && (
                              <button
                                onClick={() => navigate(`/messages/${userItem._id}`)}
                                className="flex-1 px-3 py-2 text-sm bg-slate-100 text-black rounded-lg hover:bg-slate-200 transition-colors flex items-center justify-center gap-1"
                              >
                                <MessageSquare className="w-4 h-4" />
                                Message
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileConnectionsModal;
