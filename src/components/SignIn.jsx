import { useState } from "react";
import { useNavigate } from "react-router";
import { updateData } from "./utils";
import toast from "react-hot-toast";
import { useApp } from "../components/AppContext";
import { Eye, EyeOff, LogIn, User, Lock } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";

function SignIn() {
  const navigate = useNavigate();
  const { user, setUser, checkUser } = useApp();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleInput = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const data = await updateData("v1/users/login", { ...formData }, "POST");

      if (data) {
        navigate("/feed");
        await checkUser();
      }
    } catch (err) {
      if (err.errors) {
        err.errors.forEach((error) => {
          toast.error(error.msg, {
            position: "top-center",
            autoClose: 3000,
            theme: "dark",
          });
        });
      } else {
        toast.error("Something went wrong, please try again", {
          position: "top-center",
          autoClose: 3000,
          theme: "dark",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const responseMessage = async (response) => {
    try {
      // response.credential is a JWT from Google
      const data = await updateData("v1/users/google-login", {
        credential: response.credential,
      }, "POST");

      if (data) {
        await checkUser();
        toast.success("Logged in with Google");
        navigate("/feed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Google login failed", {
        position: "top-center",
        autoClose: 3000,
        theme: "dark",
      });
    }
  };

  const errorMessage = (error) => {
    console.log(error);
    toast.error("Google login failed", {
      position: "top-center",
      autoClose: 3000,
      theme: "dark",
    });
  };

  return (
    <div className="w-full max-w-md">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-4">
          <LogIn className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-primary mb-2">Welcome Back</h2>
        <p className="text-secondary">Sign in to continue to Knect</p>
      </div>

      {/* Form */}
      <form onSubmit={onSubmit} className="space-y-5">
        <div className="space-y-4">
          {/* Username Field */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-tertiary" />
            </div>
            <input
              type="text"
              className="w-full pl-10 pr-3 py-3 border border-primary rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-tertiary focus:bg-secondary text-primary placeholder-text-tertiary"
              placeholder="Username"
              name="username"
              onChange={handleInput}
              value={formData.username}
              required
            />
          </div>

          {/* Password Field */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-tertiary" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              className="w-full pl-10 pr-10 py-3 border border-primary rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-tertiary focus:bg-secondary text-primary placeholder-text-tertiary"
              placeholder="Password"
              name="password"
              onChange={handleInput}
              value={formData.password}
              required
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-tertiary hover:text-secondary transition-colors" />
              ) : (
                <Eye className="h-5 w-5 text-tertiary hover:text-secondary transition-colors" />
              )}
            </button>
          </div>
        </div>

        {/* Forgot Password Link */}
        <div className="text-right">
          <button
            type="button"
            className="text-sm text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            Forgot password?
          </button>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Signing in...
            </>
          ) : (
            <>
              Sign In
              <LogIn className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-primary"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-primary text-tertiary">Or continue with</span>
        </div>
      </div>

      {/* Google Login */}
      <div className="flex justify-center">
        <GoogleLogin
          onSuccess={responseMessage}
          onError={errorMessage}
          text="signin_with"
          shape="rectangular"
          logo_alignment="left"
          size="large"
          width="100%"
          theme="outline"
        />
      </div>

      {/* Sign Up Link */}
      <div className="text-center mt-6">
        <span className="text-secondary text-sm">Don't have an account? </span>
        <button
          onClick={() => navigate("/register")}
          className="text-indigo-600 hover:text-indigo-700 text-sm font-semibold transition-colors"
        >
          Sign up for free
        </button>
      </div>
    </div>
  );
}

export default SignIn;
