import { useState } from "react";
import { useNavigate } from "react-router";
import { updateWithFormData, updateData } from "../utils";
import toast from "react-hot-toast";
import OTPVerification from "./OTPVerification";
import ThemeToggle from "../ThemeToggle";

function Register() {
  const navigate = useNavigate();
  const [showOTP, setShowOTP] = useState(false);
  const [registrationToken, setRegistrationToken] = useState("");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    password: "",
    profile_photo: null,
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

    // Create FormData object with all fields including files
    const formDataToSend = new FormData();

    // Add all text fields
    formDataToSend.append("firstName", formData.firstName);
    formDataToSend.append("lastName", formData.lastName);
    formDataToSend.append("email", formData.email);
    formDataToSend.append("username", formData.username);
    formDataToSend.append("password", formData.password);

    // Add files if they exist
    if (formData.profile_photo) {
      formDataToSend.append("profile_photo", formData.profile_photo);
    }
    if (formData.cover_photo) {
      formDataToSend.append("cover_photo", formData.cover_photo);
    }

    

    try {
      // Send all data to register and trigger OTP sending
      const response = await updateWithFormData(
        "v1/users/register",
        formDataToSend,
      );

      if (response && response.registrationToken) {
        toast.success("OTP sent to your email!");
        setRegistrationToken(response.registrationToken);
        setShowOTP(true); // Show OTP verification component
      }
    } catch (err) {
      
      if (err.errors) {
        err.errors.forEach((error) =>
          toast.error(error.msg, { position: "top-center" }),
        );
      } else {
        toast.error(err.message || "Something went wrong, please try again", {
          position: "top-center",
        });
      }
    }
  };

  const handleBackToRegister = () => {
    setShowOTP(false);
  };

  // Show OTP verification component if needed
  if (showOTP) {
    return (
      <OTPVerification
        registrationToken={registrationToken}
        onBack={handleBackToRegister}
      />
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary px-4">
      <div className="w-full max-w-lg bg-primary shadow-lg rounded-2xl p-8 space-y-6 border border-secondary relative">
        {/* Theme Toggle Button */}
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        
        <h2 className="text-2xl font-bold text-center text-primary">
          Create Account
        </h2>

        <form
          onSubmit={(e) => {
            toast.promise(onSubmit(e), {
              loading: "Sending OTP...",
              error: "Failed to send OTP",
            });
          }}
          className="space-y-4"
          encType="multipart/form-data"
          method="POST"
        >
          {/* Name fields side by side */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary mb-1">
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                className="w-full px-4 py-2 border border-secondary rounded-lg focus:ring-2 focus:ring-accent-primary focus:outline-none bg-primary text-primary"
                placeholder="First name"
                value={formData.firstName}
                onChange={handleInput}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary mb-1">
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                className="w-full px-4 py-2 border border-secondary rounded-lg focus:ring-2 focus:ring-accent-primary focus:outline-none bg-primary text-primary"
                placeholder="Last name"
                value={formData.lastName}
                onChange={handleInput}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              className="w-full px-4 py-2 border border-secondary rounded-lg focus:ring-2 focus:ring-accent-primary focus:outline-none bg-primary text-primary"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleInput}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary mb-1">
              Username
            </label>
            <input
              type="text"
              name="username"
              className="w-full px-4 py-2 border border-secondary rounded-lg focus:ring-2 focus:ring-accent-primary focus:outline-none bg-primary text-primary"
              placeholder="Choose a username"
              value={formData.username}
              onChange={handleInput}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary mb-1">
              Password
            </label>
            <p className="block text-sm font-mono text-tertiary mb-1">
              Password must be 6–12 characters and include at least 1 uppercase,
              3 numbers, and 1 symbol.
            </p>
            <input
              type="password"
              name="password"
              className="w-full px-4 py-2 border border-secondary rounded-lg focus:ring-2 focus:ring-accent-primary focus:outline-none bg-primary text-primary"
              placeholder="Enter password"
              value={formData.password}
              onChange={handleInput}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary mb-1">
              Profile Picture
            </label>
            <p className="flex justify-end text-sm font-mono text-tertiary mb-1">
              * optional
            </p>
            <input
              type="file"
              name="profile_photo"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full text-sm text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-accent-primary/10 file:text-accent-primary hover:file:bg-accent-primary/20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary mb-1">
              Cover Photo
            </label>
            <p className="flex justify-end text-sm font-mono text-tertiary mb-1">
              * optional
            </p>
            <input
              type="file"
              name="cover_photo"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full text-sm text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-accent-primary/10 file:text-accent-primary hover:file:bg-accent-primary/20"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-accent-primary text-white py-2 rounded-lg hover:bg-opacity-90 transition-colors accent-gradient"
          >
            Register
          </button>
        </form>

        <p className="text-center text-sm text-secondary">
          Already have an account?{" "}
          <button
            onClick={() => navigate("/login")}
            className="text-accent-primary hover:underline font-medium"
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
}

export default Register;
