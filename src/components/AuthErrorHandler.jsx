import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AuthErrorHandler = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthError = () => {
      
      navigate("/login");
    };

    window.addEventListener("auth-error", handleAuthError);

    return () => {
      window.removeEventListener("auth-error", handleAuthError);
    };
  }, [navigate]);

  return null; // This component doesn't render anything
};

export default AuthErrorHandler;