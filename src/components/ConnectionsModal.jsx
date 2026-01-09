import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Users,
  UserPlus,
  UserCheck,
  UserRoundPen,
  MessageSquare,
  UserIcon,
  X,
  Search,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { updateData, fetchData } from "../components/utils";

const PAGE_SIZE = 20;

const ConnectionsModal = ({
  isOpen,
  onClose,
  userId,
  initialTab = "Followers",
  isOwnProfile = false,
}) => {
  const navigate = useNavigate();
  const scrollRef = useRef(null);

  const [user, setUser] = useState(null);
  const [currentTab, setCurrentTab] = useState(initialTab);
  const [loading, setLoading] = useState(false);

  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [focusedIndex, setFocusedIndex] = useState(0);

  /* ----------------------------- Fetch (ONCE) ----------------------------- */

  const fetchConnections = async () => {
    try {
      setLoading(true);

      const endpoint = isOwnProfile
        ? "v1/auth/connections"
        : `v1/auth/user-connections/${userId}`;

      const data = await fetchData(endpoint);
      setUser(data);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  /* ----------------------------- Tabs ----------------------------- */

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

  const activeTab = tabs.find((t) => t.label === currentTab);

  /* ------------------------ Client-side Search ------------------------ */

  const filteredList = useMemo(() => {
    if (!activeTab) return [];

    if (!query) return activeTab.value;

    return activeTab.value.filter((u) =>
      `${u.full_name} ${u.username}`
        .toLowerCase()
        .includes(query.toLowerCase())
    );
  }, [activeTab, query]);

  const visibleItems = filteredList.slice(0, visibleCount);

  /* ------------------------ Infinite Scroll (client) ------------------------ */

  const handleScroll = () => {
    if (!scrollRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } =
      scrollRef.current;

    if (scrollTop + clientHeight >= scrollHeight - 80) {
      setVisibleCount((c) => c + PAGE_SIZE);
    }
  };

  /* ------------------------ Keyboard Navigation ------------------------ */

  const handleKeyDown = (e) => {
    if (!filteredList.length) return;

    if (e.key === "ArrowDown") {
      setFocusedIndex((i) =>
        Math.min(i + 1, filteredList.length - 1)
      );
    }

    if (e.key === "ArrowUp") {
      setFocusedIndex((i) => Math.max(i - 1, 0));
    }

    if (e.key === "Enter") {
      const item = filteredList[focusedIndex];
      if (item) navigate(`/profile/${item._id}`);
    }

    if (e.key === "Escape") onClose();
  };

  /* ----------------------------- Effects ----------------------------- */

  useEffect(() => {
    if (isOpen) {
      setVisibleCount(PAGE_SIZE);
      setFocusedIndex(0);
      fetchConnections();
    }
  }, [isOpen]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
    setFocusedIndex(0);
  }, [currentTab, query]);

  if (!isOpen) return null;

  /* ----------------------------- UI ----------------------------- */

  return (
    <div
      className="fixed inset-0 z-50"
      tabIndex={-1}
      onKeyDown={handleKeyDown}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="absolute right-0 top-0 h-full w-full max-w-lg sm:max-w-xl bg-primary shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-secondary">
          <h2 className="text-lg font-semibold">
            {isOwnProfile ? "Your Connections" : "User Connections"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-secondary"
          >
            <X className="w-5 h-5 text-tertiary" />
          </button>
        </div>

        {/* Search */}
        <div className="px-6 py-3 border-b border-secondary">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-tertiary" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search connections..."
              className="pl-9 pr-3 py-2 w-full rounded-lg bg-secondary outline-none"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 py-3 border-b border-secondary overflow-x-hidden">
          <div className="bg-secondary rounded-xl p-1 flex">
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
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
        >
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin h-8 w-8 rounded-full border-b-2 border-primary" />
            </div>
          ) : visibleItems.length === 0 ? (
            <div className="text-center py-16">
              <UserIcon className="w-12 h-12 mx-auto text-tertiary mb-3" />
              <p className="text-tertiary">
                No {currentTab.toLowerCase()} found
              </p>
            </div>
          ) : (
            visibleItems.map((userItem, index) => (
              <div
                key={userItem._id}
                className={`border border-secondary rounded-2xl p-5 transition ${focusedIndex === index
                  ? "bg-secondary/60"
                  : "hover:bg-secondary/40"
                  }`}
              >
                <div className="flex gap-4">
                  {userItem.profile_photo ? (
                    <img
                      src={userItem.profile_photo}
                      alt=""
                      className="w-16 h-18 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center">
                      <UserIcon className="w-6 h-6 text-tertiary" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="text-base font-semibold leading-tight truncate">
                      {userItem.fullName}
                    </p>
                    <p className="text-sm text-tertiary font-medium">
                      @{userItem.username}
                    </p>

                    <div className="flex flex-wrap gap-2 mt-4">
                      <button
                        onClick={() => navigate(`/profile/${userItem._id}`)}
                        className="px-4 py-2 text-sm font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition"
                      >
                        View
                      </button>

                      {isOwnProfile && currentTab === "Following" && (
                        <button
                          onClick={() =>
                            updateData("v1/auth/unfollow", {
                              id: userItem._id,
                            }).then(fetchConnections)
                          }
                          className="px-4 py-2 text-sm font-medium rounded-lg bg-secondary hover:bg-tertiary transition"
                        >
                          Unfollow
                        </button>
                      )}

                      {isOwnProfile && currentTab === "Pending" && (
                        <button
                          onClick={() =>
                            updateData("v1/auth/accept", {
                              id: userItem._id,
                            }).then(fetchConnections)
                          }
                          className="px-4 py-2 text-sm font-medium rounded-lg bg-green-600 text-white hover:bg-green-700 transition"
                        >
                          Accept
                        </button>
                      )}

                      {isOwnProfile && currentTab === "Connections" && (
                        <button
                          onClick={() => navigate(`/messages/${userItem._id}`)}
                          className="px-4 py-2 text-sm font-medium rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center gap-2 transition"
                        >
                          <MessageSquare className="w-4 h-4" />
                          Message
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ConnectionsModal;
