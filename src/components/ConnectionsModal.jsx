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
  initialTab = "Followers",
  isOwnProfile = false,
}) => {
  const [user, setUser] = useState(null);
  const [currentTab, setCurrentTab] = useState(initialTab);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  /*

Add search with debounce

Add infinite scroll

Add virtualized list

Add keyboard navigation

Convert to route-based drawer (/connections)
  */

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

  const handleUnfollow = async (id) => {
    try {
      await updateData("v1/auth/unfollow", { id });
      fetchConnections();
    } catch (e) {
      toast.error(e.message);
    }
  };

  const acceptConnection = async (id) => {
    try {
      await updateData("v1/auth/accept", { id });
      fetchConnections();
    } catch (e) {
      toast.error(e.message);
    }
  };

  useEffect(() => {
    if (isOpen && userId) fetchConnections();
  }, [isOpen, userId]);

  const tabs = [
    { label: "Followers", value: user?.followers || [], icon: Users },
    { label: "Following", value: user?.following || [], icon: UserCheck },
  ];

  if (isOwnProfile) {
    tabs.push(
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

  const activeTab = tabs.find((t) => t.label === currentTab);

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`absolute right-0 top-0 h-full w-full max-w-md bg-primary shadow-2xl flex flex-col transition-transform duration-300
          ${isOpen ? "translate-x-0" : "translate-x-full"}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-secondary">
          <h2 className="text-lg font-semibold">
            {isOwnProfile ? "Your Connections" : "User Connections"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-secondary transition"
          >
            <X className="w-5 h-5 text-tertiary" />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-4 py-3 border-b border-secondary">
          <div className="bg-secondary rounded-xl p-1 flex w-full">
            {tabs.map((tab) => (
              <button
                key={tab.label}
                onClick={() => setCurrentTab(tab.label)}
                className={`flex-1 flex items-center justify-center gap-1 px-2 py-2 text-xs font-medium rounded-lg transition
                  ${currentTab === tab.label
                    ? "bg-indigo-600 text-white"
                    : "text-tertiary hover:text-primary"
                  }
                `}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full">
                  {tab.value.length}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin h-8 w-8 rounded-full border-b-2 border-primary" />
            </div>
          ) : !activeTab || activeTab.value.length === 0 ? (
            <div className="text-center py-16">
              <UserIcon className="w-12 h-12 mx-auto text-tertiary mb-3" />
              <p className="text-tertiary">
                No {currentTab.toLowerCase()} found
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeTab.value.map((userItem) => (
                <div
                  key={userItem._id}
                  className="border border-secondary rounded-xl p-4 hover:bg-secondary/40 transition"
                >
                  <div className="flex gap-3">
                    {userItem.profile_photo ? (
                      <img
                        src={userItem.profile_photo}
                        alt=""
                        className="w-11 h-11 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-secondary flex items-center justify-center">
                        <UserIcon className="w-5 h-5 text-tertiary" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">
                        {userItem.full_name}
                      </p>
                      <p className="text-sm text-tertiary">
                        @{userItem.username}
                      </p>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-2 mt-3">
                        <button
                          onClick={() =>
                            navigate(`/profile/${userItem._id}`)
                          }
                          className="px-3 py-1.5 text-xs rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition"
                        >
                          View
                        </button>

                        {isOwnProfile && currentTab === "Following" && (
                          <button
                            onClick={() => handleUnfollow(userItem._id)}
                            className="px-3 py-1.5 text-xs rounded-lg bg-secondary hover:bg-tertiary transition"
                          >
                            Unfollow
                          </button>
                        )}

                        {isOwnProfile && currentTab === "Pending" && (
                          <button
                            onClick={() => acceptConnection(userItem._id)}
                            className="px-3 py-1.5 text-xs rounded-lg bg-green-600 text-white hover:bg-green-700 transition"
                          >
                            Accept
                          </button>
                        )}

                        {isOwnProfile && currentTab === "Connections" && (
                          <button
                            onClick={() =>
                              navigate(`/messages/${userItem._id}`)
                            }
                            className="px-3 py-1.5 text-xs rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center gap-1 transition"
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
          )}
        </div>
      </div>
    </div>
  );
};

export default ConnectionsModal;
