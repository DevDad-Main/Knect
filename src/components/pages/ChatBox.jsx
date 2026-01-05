import React, { useState, useEffect, useRef } from "react";
import { ImageIcon, SendHorizonalIcon, SendIcon, UserIcon } from "lucide-react";
import { updateWithFormData, fetchData, updateData } from "../utils";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { io } from "socket.io-client";
import { useApp } from "../../components/AppContext";
import { useTheme } from "../ThemeContext";

const ChatBox = () => {
  const navigate = useNavigate();
  const [isSending, setIsSending] = useState(false);
  const [socketReady, setSocketReady] = useState(false);
  const { userId } = useParams();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [user, setUser] = useState({});
  const { user: currentUser } = useApp();
  const { theme } = useTheme();
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
      const to_user_id = userId;
      const data = await fetchData(`api/v1/message/get/${to_user_id}`);
      if (data) {
        setMessages(data);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const sendMessage = async () => {
    if (isSending) return;
    if (!text && !image) return toast.error("You can't send an empty message");

    if (!socketReady) return toast.error("Socket not connected yet");

    setIsSending(true);

    const formData = new FormData();
    // formData.append("from_user_id", currentUser._id);
    formData.append("to_user_id", userId);
    formData.append("text", text);
    if (image) formData.append("image", image);

    try {
      const data = await updateWithFormData("api/v1/message/send", formData);
      if (data) {
        setText("");
        setImage(null);

        // Emit real-time event after saving to DB
        socket.current.emit("send_message", data);
        setMessages((prev) => [...prev, data]);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSending(false);
    }
  };

  useEffect(() => {
    // No token needed - cookies are sent automatically
    socket.current = io(import.meta.env.VITE_BASEURL, {
      transports: ["websocket"],
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
        const data = await updateData(`api/v1/user/profile/${id}`);

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
        <div className="flex items-center gap-2 p-2 md:px-10 xl:pl-42 bg-gradient-to-r from-secondary to-tertiary border-b border-secondary">
          {user?.profile_photo ? (
            <img
              onClick={() => navigate(`/profile/${user._id}`)}
              src={user.profile_photo}
              alt=""
              className="size-8 rounded-full object-cover cursor-pointer"
            />
          ) : (
            <UserIcon
              onClick={() => navigate(`/profile/${user._id}`)}
              className="size-8 rounded-full object-cover cursor-pointer"
            />
          )}
          <div>
            <p className="font-medium text-primary">{user.full_name}</p>
            <p className="text-sm text-tertiary -mt-1.5">
              @{user.username}
            </p>{" "}
          </div>
        </div>

        <div className="p-5 md:px-10 h-full overflow-y-scroll bg-primary">
          <div className="space-y-4 max-w-4xl mx-auto">
            {messages
              .toSorted((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
              .map((message, index) => (
                <div
                  key={index}
                  className={`flex flex-col ${message.to_user_id !== user._id ? "items-start" : "items-end"}`}
                >
                  <div
                    className={`p-2 text-sm max-w-sm bg-tertiary text-primary rounded-lg shadow ${message.to_user_id !== user._id ? "rounded-bl-none" : "rounded-br-none"}`}
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
                    <div className="text-sm pt-1 text-quaternary">
                      <p className="text-quaternary">{new Date(message.createdAt).toLocaleTimeString()}</p>
                    </div>
                  </div>
                </div>
              ))}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input area */}
        <div className="px-4 bg-secondary">
          <div               className="flex items-center gap-3 pl-5 p-1.5 bg-tertiary w-full max-w-xl mx-auto border border-secondary shadow rounded-full mb-5">
            <input
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              onChange={(e) => setText(e.target.value)}
              value={text}
              type="text"
              className="flex-1 outline-none text-primary bg-transparent placeholder-text-tertiary"
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
                <ImageIcon className="mr-1 size-7 text-tertiary cursor-pointer" />
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
              onClick={() => {
                toast.promise(sendMessage(), {
                  loading: "Sending message...",
                });
              }}
              disabled={isSending}
              className={`accent-gradient hover:opacity-90 
    active:scale-95 text-white p-2 rounded-full 
    ${isSending ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
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
