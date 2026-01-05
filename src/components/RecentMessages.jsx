import React, { useState, useEffect } from "react";
import { dummyRecentMessagesData } from "../assets/assets";
import { Link } from "react-router-dom";
import moment from "moment";
import { fetchData } from "./utils";
import toast from "react-hot-toast";
import { UserIcon } from "lucide-react";
import { useTheme } from "./ThemeContext";

const RecentMessages = () => {
  const [messages, setMessages] = useState([]);
  const { theme } = useTheme();

  const fetchRecentMessages = async () => {
    try {
      const data = await fetchData("api/v1/message/recent-messages");

      if (data) {
        // toast.success(data.message);
        const groupedMessages = data.messages.reduce((acc, message) => {
          const senderId = message.from_user_id._id;
          if (
            !acc[senderId] ||
            new Date(message.createdAt) > new Date(acc[senderId].createdAt)
          ) {
            acc[senderId] = message;
          }
          return acc;
        }, {});

        // Sort messages by date
        const sortedMessages = Object.values(groupedMessages).sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
        );

        setMessages(sortedMessages);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    //FIX: Uncomment this to fetch messages on mount
    // fetchRecentMessages(); // fetch immediately on mount
    // const interval = setInterval(fetchRecentMessages, 30000);
    // return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-primary max-w-xs mt-4 p-4 min-h-20 rounded-md shadow text-xs border border-secondary">
      <h3 className="font-semibold text-primary mb-4">Recent Messages</h3>
      <div className="flex flex-col max-h-56 overflow-y-scroll no-scrollbar">
        {messages.map((message, index) => (
          <Link
            to={`/messages/${message.from_user_id._id}`}
            key={index}
            className="flex items-start gap-2 py-2 hover:bg-secondary"
          >
            {message.from_user_id?.profile_photo ? (
              <img
                src={message.from_user_id.profile_photo}
                alt=""
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <UserIcon className="w-8 h-8 rounded-full" />
            )}
            <div className="w-full">
              <div className="flex justify-between">
                <p className="font-medium">{message.from_user_id.full_name}</p>
                <p className="mb-2 text-tertiary">{moment(message.createdAt).fromNow()}</p>
              </div>
              <div className="flex justify-between">
                <p className="text-tertiary">
                  {message.text ? message.text : "Media"}
                </p>
                {!message.seen && (
                  <p className="bg-indigo-500 text-white w-5 h-5 flex items-center justify-center rounded-full text-[10px]">
                    1
                  </p>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RecentMessages;
