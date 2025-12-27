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
        await fetchData("v1/auth/get-user");
        setAuthenticated(true);
      } catch (error) {
        setAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return <div>Loading...</div>; // or your loading component
  }

  return authenticated ? children : <Navigate to={"/login"} />;
}

export default Protected;
