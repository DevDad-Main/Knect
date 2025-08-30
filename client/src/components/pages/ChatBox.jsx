import React, { useState, useEffect, useRef } from "react";
import { ImageIcon, SendHorizonalIcon, SendIcon } from "lucide-react";
import { updateWithFormData, fetchData, updateData } from "../utils";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import Cookies from "js-cookie";

const ChatBox = () => {
  const token = Cookies.get("token");
  const [socketReady, setSocketReady] = useState(false);
  const { userId } = useParams();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [user, setUser] = useState({});
  const currentUser = useCurrentUser();
  const messagesEndRef = useRef(null);
  const socket = useRef(null);

  // const fetchUser = async () => {
  //   try {
  //     const data = await fetchData(`api/v1/user/user`);
  //     if (data) {
  //       setCurrentUser(data);
  //     }
  //   } catch (error) {
  //     toast.error(error.message);
  //   }
  // };

  useEffect(() => {
    // fetchUser();
  }, [currentUser]);

  const fetchUserMessages = async () => {
    try {
      const data = await updateData(`api/v1/message/get`, {
        to_user_id: userId,
      });
      if (data) {
        setMessages(data);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const sendMessage = async () => {
    if (!text && !image) return toast.error("You can't send an empty message");

    if (!socketReady) return toast.error("Socket not connected yet");

    const formData = new FormData();
    // formData.append("from_user_id", currentUser._id);
    formData.append("to_user_id", userId);
    formData.append("text", text);
    if (image) formData.append("image", image);

    try {
      const data = await updateWithFormData("api/v1/message/send", formData, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      });
      if (data) {
        setText("");
        setImage(null);

        // Emit real-time event after saving to DB
        socket.current.emit("send_message", data);
        setMessages((prev) => [...prev, data]);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    const token = Cookies.get("accessToken");
    if (!token) return;

    socket.current = io(import.meta.env.VITE_BASEURL, {
      query: { token: sessionStorage.getItem("token") },
      withCredentials: true,
    });

    socket.current.on("connect", () => setSocketReady(true));

    socket.current.on("receive_message", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => socket.current.disconnect();
  }, []);

  useEffect(() => {
    const fetchUser = async (id) => {
      try {
        const data = await updateData(`api/v1/user/profiles/${id}`);

        if (data) {
          setUser(data.profile);
        }
      } catch (error) {
        toast.error(error.message);
      }
    };

    if (userId) {
      fetchUser(userId);
      fetchUserMessages();
    }
  }, [userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    user && (
      <div className="flex flex-col h-screen">
        <div className="flex items-center gap-2 p-2 md:px-10 xl:pl-42 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-300">
          <img
            src={user.profile_picture}
            alt=""
            className="size-8 rounded-full object-cover"
          />
          <div>
            <p className="font-medium">{user.full_name}</p>
            <p className="text-sm text-gra-500 -mt-1.5">
              @{user.username}
            </p>{" "}
          </div>
        </div>

        <div className="p-5 md:px-10 h-full overflow-y-scroll">
          <div className="space-y-4 max-w-4xl mx-auto">
            {messages
              .toSorted((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
              .map((message, index) => (
                <div
                  key={index}
                  className={`flex flex-col ${message.to_user_id !== user._id ? "items-start" : "items-end"}`}
                >
                  <div
                    className={`p-2 text-sm max-w-sm bg-white text-slate-700 rounded-lg shadow ${message.to_user_id !== user._id ? "rounded-bl-none" : "rounded-br-none"}`}
                  >
                    {/* Check to see if the message has an image, if it does then we show it otherwise just the message */}
                    {message.message_type === "image" && (
                      <img
                        src={message.media_url}
                        alt=""
                        className="w-full max-w-sm rounded-lg mb-1"
                      />
                    )}
                    <p>{message.text}</p>
                    <div className="text-sm pt-1 text-slate-600">
                      <p>{new Date(message.createdAt).toLocaleTimeString()}</p>
                    </div>
                  </div>
                </div>
              ))}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input area */}
        <div className="px-4">
          <div className="flex items-center gap-3 pl-5 p-1.5 bg-white w-full max-w-xl mx-auto border border-gray-200 shadow rounded-full mb-5">
            <input
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              onChange={(e) => setText(e.target.value)}
              value={text}
              type="text"
              className="flex-1 outline-none text-slate-700"
              placeholder="Type a message..."
            />
            <label htmlFor="image">
              {image ? (
                <img
                  src={URL.createObjectURL(image)}
                  alt=""
                  className="h-8 rounded"
                />
              ) : (
                <ImageIcon className="mr-1 size-7 text-gray-400 cursor-pointer" />
              )}
              <input
                type="file"
                id="image"
                accept="image/*"
                hidden
                onChange={(e) => setImage(e.target.files?.[0])}
              />
            </label>
            <button
              onClick={sendMessage}
              className="bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-700 hover:to-purple-800 active:scale-95 cursor-pointer text-white p-2 rounded-full"
            >
              <SendHorizonalIcon size={18} className="ml-0.5" />
            </button>
          </div>
        </div>
      </div>
    )
  );
};

export default ChatBox;
