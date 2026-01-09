import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import {
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
  Route,
} from "react-router-dom";
import Login from "./components/pages/Login";
import Feed from "./components/pages/Feed";

import StreamMessages from "./components/pages/StreamMessages";
import StreamChatBox from "./components/pages/StreamChatBox";

import Connections from "./components/pages/Connections";
import Discover from "./components/pages/Discover";
import Profile from "./components/pages/Profile";
import CreatePost from "./components/pages/CreatePost";
import Register from "./components/pages/Register";
import Protected from "./components/Protected";
import Layout from "./components/pages/Layout.jsx";
import PostDetails from "./components/pages/PostDetails.jsx";
import NotificationsPage from "./components/pages/NotificationsPage";
import { Navigate } from "react-router-dom";
import { AppProvider } from "./components/AppContext";
import { ThemeProvider } from "./components/ThemeContext";
import { StreamChatProvider } from "./components/StreamChatContext";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      {/* Redirect root */}
      <Route index element={<Navigate to="/login" replace />} />
      {/* Public routes */}
      <Route path="login" element={<Login />} />
      <Route path="register" element={<Register />} />

      {/* Protected Layout wrapper */}
      <Route
        element={
          <Protected>
            <Layout />
          </Protected>
        }
      >
        <Route path="feed" element={<Feed />} />
        <Route path="messages" element={<StreamMessages />} />
        <Route path="messages/:userId" element={<StreamChatBox />} />
        <Route path="post/:postId" element={<PostDetails />} />
        <Route path="discover" element={<Discover />} />
        <Route path="profile/:profileId" element={<Profile />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="create-post" element={<CreatePost />} />
      </Route>
    </Route>,
  ),
);
createRoot(document.getElementById("root")).render(
  <AppProvider>
    <ThemeProvider>
      <StreamChatProvider>
        <RouterProvider router={router} />
      </StreamChatProvider>
    </ThemeProvider>
  </AppProvider>,
);
