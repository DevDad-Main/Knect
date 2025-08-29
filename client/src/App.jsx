import React, { useEffect, useState } from "react";
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
import { Toaster } from "react-hot-toast";
import Loading from "./components/Loading";
import Register from "./components/pages/Register";
import { fetchData } from "./components/utils";
import Protected from "./components/Protected";

export const App = () => {
  const user = sessionStorage.getItem("token");
  // const isLoggedIn = !!user;
  const [currentUser, setCurrentUser] = useState(null);

  // if (!isLoggedIn) {
  //   return <Loading />;
  // }

  return (
    <>
      <Toaster />
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes */}
        <Route path="/" element={user ? <Layout /> : <Login />}>
          <Route
            index
            element={
              <Protected>
                <Feed />{" "}
              </Protected>
            }
          />
          <Route path="messages" element={<Messages />} />
          <Route path="messages/:userId" element={<ChatBox />} />
          <Route path="connections" element={<Connections />} />
          <Route path="discover" element={<Discover />} />
          {/* <Route path="profile" element={<Profile />} /> */}
          <Route path="profile/:profileId" element={<Profile />} />
          <Route path="create-post" element={<CreatePost />} />
        </Route>
      </Routes>
    </>
  );
};

export default App;
