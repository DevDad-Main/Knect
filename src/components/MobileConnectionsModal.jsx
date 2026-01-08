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
  isOwnProfile = false,
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
      const endpoint = isOwnProfile
        ? "v1/auth/connections"
        : `v1/auth/user-connections/${userId}`;
      const data = await fetchData(endpoint);

      if (data) setUser(data);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUnfollow = async (targetUserId) => {
    try {
      const data = await updateData("v1/auth/unfollow", { id: targetUserId });
      if (data) fetchConnections();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const acceptConnection = async (targetUserId) => {
    try {
      const data = await updateData("v1/auth/accept", { id: targetUserId });
      if (data) fetchConnections();
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (isOpen && userId) fetchConnections();
  }, [isOpen, userId]);

  const dataArray = [
    { label: "Followers", value: user?.followers || [], icon: Users },
    { label: "Following", value: user?.following || [], icon: UserCheck },
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

  if (!isMobile || !isOpen) return null;

  return (
    <div className="fixed inset-0 z-50" data-mobile-connections-open={isOpen}>
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />

      {/* Bottom Sheet */}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-primary rounded-t-3xl transition-transform duration-300 ease-out flex flex-col ${isOpen ? "translate-y-0" : "translate-y-full"
          }`}
        style={{ height: "85vh", overflow: "hidden" }}
      >
        {/* Handle */}
        <div className="flex justify-center py-3">
          <div className="w-12 h-1 bg-tertiary/30 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 pb-3 border-b border-secondary">
          <h3 className="text-lg font-semibold text-primary">
            {isOwnProfile ? "Your Connections" : "User Connections"}
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-secondary"
          >
            <ArrowLeft className="w-5 h-5 text-tertiary" />
          </button>
        </div>

        {/* ✅ UPDATED TABS */}
        <div className="px-4 py-3 border-b border-secondary">
          <div className="bg-secondary rounded-xl p-1 flex w-full">
            {dataArray.map((tab) => (
              <button
                key={tab.label}
                onClick={() => setCurrentTab(tab.label)}
                className={`flex-1 flex items-center justify-center gap-1 px-2 py-2 text-xs font-medium rounded-lg transition-colors
                  ${currentTab === tab.label
                    ? "bg-indigo-600 text-white"
                    : "text-tertiary hover:text-primary"
                  }
                `}
              >
                <tab.icon className="w-4 h-4" />
                <span className="truncate">{tab.label}</span>
                <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full">
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
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : (
            (() => {
              const tabData = dataArray.find(t => t.label === currentTab);
              if (!tabData || tabData.value.length === 0) {
                return (
                  <div className="text-center py-12">
                    <UserIcon className="w-12 h-12 mx-auto text-tertiary mb-3" />
                    <p className="text-tertiary">
                      No {currentTab.toLowerCase()} found
                    </p>
                  </div>
                );
              }

              return (
                <div className="space-y-3">
                  {tabData.value.map((userItem) => (
                    <div
                      key={userItem._id}
                      className="border border-secondary rounded-xl p-4"
                    >
                      <div className="flex gap-3">
                        <img
                          src={userItem.profile_photo}
                          alt=""
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <p className="font-semibold">{userItem.full_name}</p>
                          <p className="text-sm text-tertiary">
                            @{userItem.username}
                          </p>

                          <div className="flex gap-2 mt-3">
                            <button
                              onClick={() =>
                                navigate(`/profile/${userItem._id}`)
                              }
                              className="flex-1 bg-indigo-600 text-white text-sm py-2 rounded-lg"
                            >
                              View Profile
                            </button>

                            {isOwnProfile && currentTab === "Following" && (
                              <button
                                onClick={() => handleUnfollow(userItem._id)}
                                className="flex-1 bg-secondary text-sm py-2 rounded-lg"
                              >
                                Unfollow
                              </button>
                            )}

                            {isOwnProfile && currentTab === "Pending" && (
                              <button
                                onClick={() => acceptConnection(userItem._id)}
                                className="flex-1 bg-green-600 text-white text-sm py-2 rounded-lg"
                              >
                                Accept
                              </button>
                            )}

                            {isOwnProfile && currentTab === "Connections" && (
                              <button
                                onClick={() =>
                                  navigate(`/messages/${userItem._id}`)
                                }
                                className="flex-1 bg-slate-100 text-black text-sm py-2 rounded-lg flex items-center justify-center gap-1"
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
