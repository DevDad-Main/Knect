// components/UserProvider.jsx
import { createContext, useContext, useState, useEffect } from "react";
import { fetchData } from "./utils"; // adjust path if needed

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper: fetch current user if token exists
  const checkUser = async () => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const data = await fetchData("api/v1/user/user"); // backend should read cookie/header
      if (data) {
        setUser(data);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // run once on mount
    checkUser();

    // listen for manual token updates
    const handleStorageUpdate = () => checkUser();
    window.addEventListener("storage-update", handleStorageUpdate);

    return () => {
      window.removeEventListener("storage-update", handleStorageUpdate);
    };
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, loading, checkUser }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContext; // optional
