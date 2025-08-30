import { useState } from "react";
import { useNavigate } from "react-router";
import { updateData } from "./utils";
import toast from "react-hot-toast";

function SignIn() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  sessionStorage.clear();

  const handleInput = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // console.log({...formData});
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = await updateData("api/v1/user/login", { ...formData });

      if (data) {
        sessionStorage.setItem("token", data?.accessToken);

        navigate("/");
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
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8 space-y-6">
        <h2 className="text-2xl font-bold text-center text-gray-800">Login</h2>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder="Enter your username"
              name="username"
              onChange={handleInput}
              value={formData.username}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder="Enter your password"
              name="password"
              onChange={handleInput}
              value={formData.password}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Login
          </button>
        </form>

        <div className="flex items-center justify-center space-x-2">
          <span className="text-gray-600 text-sm">Don’t have an account?</span>
          <button
            onClick={() => navigate("/register")}
            className="text-indigo-600 hover:underline text-sm font-medium"
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
}

export default SignIn;
