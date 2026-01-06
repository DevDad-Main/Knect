import React, { useEffect, useState } from "react";
import {
  Users,
  UserPlus,
  UserCheck,
  UserRoundPen,
  MessageSquare,
  UserIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { updateData, fetchData } from "../utils";

const Connections = () => {
  const [user, setUser] = useState(null);
  const [currentTab, setCurrentTab] = useState("Followers");
  const navigate = useNavigate();

  const fetchConnections = async () => {
    try {
      const data = await fetchData("v1/auth/connections");

      if (data) {
        setUser(data);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleUnfollow = async (userId) => {
    try {
      const data = await updateData("v1/auth/unfollow", { id: userId });

      if (data) {
        // Immediately update local state for better UX
        setUser(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            following: prev.following?.filter(u => u._id !== userId) || []
          };
        });
        // Also fetch fresh data from server
        fetchConnections();
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const acceptConnection = async (userId) => {
    try {
      const data = await updateData("v1/auth/accept", { id: userId });

      if (data) {
        // Immediately update local state for better UX
        setUser(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            pendingConnections: prev.pendingConnections?.filter(u => u._id !== userId) || [],
            connections: [...(prev.connections || []), prev.pendingConnections?.find(u => u._id === userId)].filter(Boolean)
          };
        });
        // Also fetch fresh data from server
        fetchConnections();
      } else {
        toast.error("Failed to accept connection");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, []);

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
    {
      label: "Pending",
      value: user?.pendingConnections || [],
      icon: UserRoundPen,
    },
    {
      label: "Connections",
      value: user?.connections || [],
      icon: UserPlus,
    },
  ];

  return (
    <div className="min-h-screen bg-secondary">
      <div className="max-w-6xl mx-auto p-6">
        {/* Connections Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">
            Connections
          </h1>
          <p className="text-secondary">
            Manage your network and discover new connections
          </p>
        </div>
        {/* Counts */}
        <div className="mb-8 flex flex-wrap gap-6">
          {dataArray.map((item, index) => (
            <div
              key={index}
              className="flex flex-col items-center justify-center gap-1 border h-20 w-40 border-secondary bg-primary shadow rounded-md"
            >
              <b className="text-primary">{item.value.length}</b>
              <p className="text-secondary">{item.label}</p>
            </div>
          ))}
        </div>
        {/* Tabs */}
        <div className="inline-flex flex-wrap items-center border border-secondary rounded-md p-1 bg-primary shadow-sm">
          {dataArray.map((tab) => (
            <button
              onClick={() => setCurrentTab(tab.label)}
              key={tab.label}
              className={`cursor-pointer flex items-center px-3 py-1 text-sm rounded-md transition-colors ${currentTab === tab.label ? "bg-tertiary font-medium text-primary" : "text-tertiary hover:text-primary"}`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="ml-1">{tab.label}</span>
              {tab.count !== undefined && (
                <span className="ml-2 text-s bg-gray100 text-gray-700 px-2 py-0.5 rounded-full">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
        {/* Connections */}
        <div className="flex flex-wrap gap-6 mt-6">
          {dataArray
            .find((item) => item.label === currentTab)
            .value.map((user) => (
              <div
                key={user._id}
                className="w-full max-w-88 flex gap-5 p-6 bg-primary shadow rounded-md"
              >
                {user?.profile_photo ? (
                  <img
                    src={user.profile_photo}
                    alt=""
                    className="mt-6 rounded-full w-16 h-16 shadow-md mx-auto object-cover"
                  />
                ) : (
                  <UserIcon className=" mt-6 rounded-full w-16 h-16 shadow-md mx-auto" />
                )}

                <div className="flex-1">
                  <p className="font-medium text-primary">{user.full_name}</p>
                  <p className="text-tertiary">@{user.username}</p>
                  <p className="text-tertiary">{user.bio.slice(0, 30)}...</p>
                  <div className="flex max-sm:flex-col gap-2 mt-4">
                    {
                      <button
                        onClick={() => navigate(`/profile/${user._id}`)}
                        className="w-full p-2 text-sm rounded accent-gradient hover:opacity-90 active:scale-95 transition text-white cursor-pointer"
                      >
                        View Profile
                      </button>
                    }
                    {currentTab === "Following" && (
                      <button
                        onClick={() => handleUnfollow(user._id)}
                        className="w-full p-2 text-sm rounded bg-tertiary hover:bg-quaternary text-primary active:scale-95 transition cursor-pointer"
                      >
                        Unfollow
                      </button>
                    )}
                    {currentTab === "Pending" && (
                      <button
                        onClick={() => acceptConnection(user._id)}
                        className="w-full p-2 text-sm rounded bg-tertiary hover:bg-quaternary text-primary active:scale-95 transition cursor-pointer"
                      >
                        Accept
                      </button>
                    )}
                    {currentTab === "Connections" && (
                      <button
                        onClick={() => navigate(`/messages/${user._id}`)}
                        className="w-full p-2 text-sm rounded bg-slate-100 hover:bg-slate-200 text-black active:scale-95 transition cursor-pointer flex items-center justify-center gap-1"
                      >
                        <MessageSquare className="w-4 h-4" />
                        Message
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default Connections;
