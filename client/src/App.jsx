import React, { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import Login from "./components/pages/Login";
import Feed from "./components/pages/Feed";
import Messages from "./components/pages/Messages";
import ChatBox from "./components/pages/ChatBox";
import Connections from "./components/pages/Connections";
import Discover from "./components/pages/Discover";
import Profile from "./components/pages/Profile";
import CreatePost from "./components/pages/CreatePost";
import Layout from "./components/pages/Layout";
import { useAuth, useUser } from "@clerk/clerk-react";
import { Toaster } from "react-hot-toast";

export const App = () => {
  const { user } = useUser();
  const { getToken } = useAuth();
  // const dispatch = useDispatch();

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        const token = await getToken();
        // dispatch(fetchUser(token));
      }
    };

    fetchData();
  }, [user, getToken]);

  return (
    <>
      <Toaster />
      <Routes>
        <Route path="/" element={!user ? <Login /> : <Layout />}>
          <Route index element={<Feed />} />
          <Route path="messages" element={<Messages />} />
          <Route path="messages/:userId" element={<ChatBox />} />
          <Route path="connections" element={<Connections />} />
          <Route path="discover" element={<Discover />} />
          <Route path="profile" element={<Profile />} />
          <Route path="profile/:profileId" element={<Profile />} />
          <Route path="create-post" element={<CreatePost />} />
        </Route>
      </Routes>
    </>
  );
};

export default App;
