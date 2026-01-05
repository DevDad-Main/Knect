import React, { useEffect, useState } from "react";
import { dummyConnectionsData } from "../../assets/assets";
import { Eye, MessageSquare, User, UserIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../AppContext";
import toast from "react-hot-toast";
import { useTheme } from "../ThemeContext";

const Messages = () => {
  const navigate = useNavigate();
  const [connections, setConnections] = useState([]);
  const { getConnections } = useApp();
  const { theme } = useTheme();

  const fetchMessages = async () => {
    try {
      const data = await getConnections();

      if (data) {
        setConnections(data.connections);
      }
    } catch (error) {
      toast.error(error.message);
    }
    // navigate("/messages");
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  return (
    <div className="min-h-screen relative bg-secondary">
      <div className="max-w-6xl mx-auto p-6">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">Messages</h1>
          <p className="text-secondary">Talk to your friends and family!</p>
        </div>

        {/* Connected Users */}
        <div className="flex flex-col gap-3">
          {connections.map((user) => (
            <div
              key={user._id}
              className="max-w-xl flex flex-warp gap-5 p-6 bg-primary shadow rounded-md border border-secondary"
            >
              {user?.profile_photo ? (
                <img
                  src={user.profile_photo}
                  alt=""
                  className="mt-4.5 rounded-full size-12 mx-auto"
                />
              ) : (
                <UserIcon className=" mt-4.5 rounded-full size-12 mx-auto" />
              )}
              <div className="flex-1">
                <p className="font-medium text-primary">{user.full_name}</p>
                <p className="text-tertiary mb-2">@{user.username}</p>
                <p className="text-sm text-secondary">{user.bio}</p>
              </div>

              <div className="flex flex-col gap-2 mt-4">
                <button
                  onClick={() => navigate(`/messages/${user._id}`)}
                  className="size-10 flex items-center justify-center text-sm rounded bg-tertiary hover:bg-quaternary text-primary active:scale-95 transition cursor-pointer gap-1"
                >
                  <MessageSquare className="w-4 h-4" />
                </button>

                <button
                  onClick={() => navigate(`/profile/${user._id}`)}
                  className="size-10 flex items-center justify-center text-sm rounded bg-secondary hover:bg-tertiary text-primary active:scale-95 transition cursor-pointer"
                >
                  <User className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Messages;
