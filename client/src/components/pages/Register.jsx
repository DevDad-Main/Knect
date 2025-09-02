import { useState } from "react";
import { useNavigate } from "react-router";
import { updateWithFormData } from "../utils";
import toast from "react-hot-toast";

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    password: "",
    profile_picture: null,
    cover_photo: null,
  });

  const handleInput = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFormData((prev) => ({ ...prev, [name]: files[0] }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    const formDataToSend = new FormData();
    // Object.keys(formData).forEach((key) => {
    //   if (formData[key]) {
    //     formDataToSend.append(key, formData[key]);
    //   }
    // });
    formDataToSend.append("firstName", formData.firstName);
    formDataToSend.append("lastName", formData.lastName);
    formDataToSend.append("email", formData.email);
    formDataToSend.append("username", formData.username);
    formDataToSend.append("password", formData.password);

    if (formData.profile_picture) {
      formDataToSend.append("profile_picture", formData.profile_picture);
    }
    if (formData.cover_photo) {
      formDataToSend.append("cover_photo", formData.cover_photo);
    }

    try {
      const data = await updateWithFormData(
        "api/v1/user/register",
        formDataToSend,
      );

      if (data) {
        navigate("/login");
      }
    } catch (err) {
      console.log(err);
      if (err.errors) {
        err.errors.forEach((error) =>
          toast.error(error.msg, { position: "top-center" }),
        );
      } else {
        toast.error("Something went wrong, please try again", {
          position: "top-center",
        });
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-lg bg-white shadow-lg rounded-2xl p-8 space-y-6">
        <h2 className="text-2xl font-bold text-center text-gray-800">
          Create Account
        </h2>

        <form
          onSubmit={(e) => {
            toast.promise(onSubmit(e), {
              loading: "Registering...",
              error: "Failed to register",
            });
          }}
          className="space-y-4"
          encType="multipart/form-data"
          method="POST"
        >
          {/* Name fields side by side */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder="First name"
                value={formData.firstName}
                onChange={handleInput}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder="Last name"
                value={formData.lastName}
                onChange={handleInput}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleInput}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              type="text"
              name="username"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder="Choose a username"
              value={formData.username}
              onChange={handleInput}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <p className="block text-sm font-mono text-gray-400 mb-1">
              Password must be 6–12 characters and include at least 1 uppercase,
              3 numbers, and 1 symbol.
            </p>
            <input
              type="password"
              name="password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder="Enter password"
              value={formData.password}
              onChange={handleInput}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Profile Picture
            </label>
            <p className="flex justify-end text-sm font-mono text-gray-400 mb-1">
              * optional
            </p>
            <input
              type="file"
              name="profile_picture"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cover Photo
            </label>
            <p className="flex justify-end text-sm font-mono text-gray-400 mb-1">
              * optional
            </p>
            <input
              type="file"
              name="cover_photo"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Register
          </button>
        </form>

        <p className="text-center text-sm text-gray-600">
          Already have an account?{" "}
          <button
            onClick={() => navigate("/login")}
            className="text-indigo-600 hover:underline font-medium"
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
}

export default Register;
