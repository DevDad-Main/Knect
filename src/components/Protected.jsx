import React, { useEffect, useState } from "react";
import { Navigate } from "react-router";
import { fetchData } from "./utils";

function Protected({ children }) {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Try to fetch user data - if it works, we're authenticated
        const userData = await fetchData("v1/auth/get-user");
        if (userData) {
          setAuthenticated(true);
        } else {
          setAuthenticated(false);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        setAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Listen for auth errors globally
    const handleAuthError = () => {
      setAuthenticated(false);
      setLoading(false);
    };

    window.addEventListener("auth-error", handleAuthError);

    return () => {
      window.removeEventListener("auth-error", handleAuthError);
    };
  }, []);

  if (loading) {
    return <div>Loading...</div>; // or your loading component
  }

  return authenticated ? children : <Navigate to={"/login"} />;
}

export default Protected;
