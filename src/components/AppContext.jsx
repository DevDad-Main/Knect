import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { fetchData, updateData, updateWithFormData } from "./utils";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkUser = useCallback(async () => {
    // No token check needed - cookies are sent automatically
    // The backend will handle authentication and return user data or 401
    try {
      const data = await fetchData("v1/auth/get-user");
      if (data) {
        setUser(data);
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateUser = useCallback(async (path, userData, method = "POST") => {
    try {
      const data = await updateData(path, userData, method);
      if (data) {
        if (path.includes("auth")) {
          setUser(data);
        }
        return data;
      }
      return null;
    } catch (error) {
      console.error(`Failed to update ${path}:`, error);
      return null;
    }
  }, []);

  const updateUserWithFormData = useCallback(
    async (path, formData, method = "POST") => {
      try {
        const data = await updateWithFormData(path, formData, {}, method);
        if (data) {
          if (path.includes("auth")) {
            setUser(data);
          }
          return data;
        }
        return null;
      } catch (error) {
        console.error(`Failed to update ${path}:`, error);
        return null;
      }
    },
    [],
  );

  const getPosts = useCallback(async () => {
    return await fetchData("v1/posts/get-posts");
  }, []);

  const getPost = useCallback(async (postId) => {
    return await fetchData(`v1/posts/get-post/${postId}`);
  }, []);

  const getConnections = useCallback(async () => {
    return await fetchData("v1/auth/connections");
  }, []);

  const getNotifications = useCallback(async () => {
    return await fetchData("v1/notifications/get-all");
  }, []);

  const getStories = useCallback(async () => {
    return await fetchData("v1/story/get-stories");
  }, []);

  const getProfile = useCallback(async (id) => {
    return await fetchData(`v1/auth/profile/${id}`);
  }, []);

  const getMessages = useCallback(async (userId) => {
    return await fetchData(`api/v1/message/get/${userId}`);
  }, []);

  const getRecentMessages = useCallback(async () => {
    return await fetchData("api/v1/message/recent-messages");
  }, []);

  useEffect(() => {
    checkUser();

    const handleStorageUpdate = () => {
      checkUser();
    };

    window.addEventListener("storage-update", handleStorageUpdate);

    return () => {
      window.removeEventListener("storage-update", handleStorageUpdate);
    };
  }, [checkUser]);

  const value = {
    user,
    setUser,
    loading,
    checkUser,
    fetchData,
    updateUser,
    updateUserWithFormData,
    getPosts,
    getPost,
    getConnections,
    getNotifications,
    getStories,
    getProfile,
    getMessages,
    getRecentMessages,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};

export default AppContext;
