import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { updateData } from "../utils";
import toast from "react-hot-toast";

function OTPVerification({ registrationToken, onBack }) {
  const navigate = useNavigate();
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [isExpired, setIsExpired] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (timeLeft > 0 && !isExpired) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setIsExpired(true);
    }
  }, [timeLeft, isExpired]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return; // Only allow single digit

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 3) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 4);
    const newOtp = pastedData.split("").map((char, index) =>
      /^\d$/.test(char) ? char : otp[index]
    );
    setOtp(newOtp);

    // Focus the last filled input
    const lastFilledIndex = newOtp.findIndex((val, idx) => idx >= newOtp.length - 1 || !val);
    const targetInput = document.getElementById(`otp-${Math.max(0, lastFilledIndex - 1)}`);
    if (targetInput) targetInput.focus();
  };

  const onVerify = async (e) => {
    e.preventDefault();
    const otpCode = otp.join("");

    if (otpCode.length !== 4) {
      toast.error("Please enter all 4 digits");
      return;
    }

    setIsVerifying(true);

    try {
      const userData = await updateData(
        "v1/users/verify-registration",
        {
          registrationToken,
          otp: otpCode,
        },
        "POST",
      );

      if (userData) {
        toast.success("Registration successful!");
        navigate("/login");
      }
    } catch (err) {
      console.log(err);
      if (err.errors) {
        err.errors.forEach((error) =>
          toast.error(error.msg, { position: "top-center" }),
        );
      } else {
        toast.error(err.message || "Verification failed, please try again", {
          position: "top-center",
        });
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    // Reset timer
    setTimeLeft(300);
    setIsExpired(false);
    setOtp(["", "", "", ""]);

    // Note: Resend functionality would need a new endpoint
    // For now, we'll just show a message
    toast.error("Please go back to registration to request a new OTP");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8 space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Verify Your Email
          </h2>
          <p className="text-gray-600">
            We've sent a 4-digit code to your email
          </p>
        </div>

        {!isExpired ? (
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-4">
              Code expires in: <span className="font-mono font-bold text-indigo-600">{formatTime(timeLeft)}</span>
            </p>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-sm text-red-500 mb-4">
              Code has expired. Please request a new one.
            </p>
          </div>
        )}

        <form onSubmit={onVerify} className="space-y-6">
          <div className="flex justify-center space-x-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none focus:border-indigo-500"
                disabled={isExpired || isVerifying}
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={isExpired || isVerifying || otp.join("").length !== 4}
            className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isVerifying ? "Verifying..." : "Verify Email"}
          </button>
        </form>

        <div className="space-y-3 text-center">
          {isExpired && (
            <button
              onClick={handleResend}
              className="text-indigo-600 hover:underline font-medium text-sm"
            >
              Request New Code
            </button>
          )}

          {!isExpired && timeLeft < 240 && ( // Show resend after 1 minute
            <button
              onClick={handleResend}
              className="text-indigo-600 hover:underline font-medium text-sm"
            >
              Resend Code
            </button>
          )}

          <button
            onClick={onBack}
            className="text-gray-600 hover:underline font-medium text-sm block w-full"
          >
            Back to Registration
          </button>
        </div>
      </div>
    </div>
  );
}

export default OTPVerification;
