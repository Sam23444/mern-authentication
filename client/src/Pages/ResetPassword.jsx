import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import axios from "axios";
import { toast } from "react-toastify";

const ResetPassword = () => {
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // ✅ Step 1: Request OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(`${backendUrl}/api/auth/send-reset-otp`, { email });
      if (data.success) {
        toast.success(data.message);
        setStep(2);
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send OTP");
    }
  };

  // ✅ Step 2: Handle OTP Change (Auto-submit when 6 digits entered)
  const handleOtpChange = (e, index) => {
    const value = e.target.value.replace(/\D/g, "");
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) document.getElementById(`otp-${index + 1}`).focus();

    if (newOtp.join("").length === 6) {
      handleOtpSubmit(newOtp.join(""));
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`).focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("Text").replace(/\D/g, "").slice(0, 6).split("");
    setOtp(pasted);
    if (pasted.length === 6) handleOtpSubmit(pasted.join(""));
  };

  // ✅ Step 2: Verify OTP with backend
  const handleOtpSubmit = async (otpValue = otp.join("")) => {
    if (otpValue.length !== 6) return toast.error("Enter all 6 digits of the OTP");

    try {
      const { data } = await axios.post(`${backendUrl}/api/auth/verify-reset-otp`, { email, otp: otpValue });
      if (data.success) {
        toast.success("OTP verified successfully");
        setStep(3);
      } else {
        toast.error(data.message || "Invalid OTP");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "OTP verification failed");
    }
  };

  // ✅ Step 3: Reset Password
  const handlePasswordReset = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(`${backendUrl}/api/auth/reset-password`, {
        email,
        otp: otp.join(""),
        newPassword,
      });

      if (data.success) {
        toast.success(data.message);
        navigate("/login");
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Password reset failed");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-300 to-purple-500">
      <img
        onClick={() => navigate("/")}
        src={assets.logo}
        alt="logo"
        className="absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer"
      />

      {/* ✅ STEP 1: Enter Email */}
      {step === 1 && (
        <form onSubmit={handleSendOtp} className="bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm">
          <h1 className="text-white text-2xl font-semibold text-center mb-4">Reset Password</h1>
          <p className="text-center mb-7 text-indigo-400">Enter your registered email.</p>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 rounded-md bg-[#333A5C] text-white mb-4"
            required
          />
          <button className="w-full py-2 bg-indigo-600 text-white rounded-md">Send OTP</button>
        </form>
      )}

      {/* ✅ STEP 2: Enter OTP */}
      {step === 2 && (
        <form onSubmit={(e) => e.preventDefault()} className="bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm">
          <h1 className="text-white text-2xl font-semibold text-center mb-4">Verify OTP</h1>
          <p className="text-center mb-7 text-indigo-400">Enter the 6-digit OTP sent to your email.</p>

          <div className="flex justify-between mb-6">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onPaste={handlePaste}
                className="w-12 h-12 bg-[#333A5C] text-white text-center text-xl rounded-md outline-none"
                required
              />
            ))}
          </div>

          <button type="button" onClick={() => handleOtpSubmit()} className="w-full py-2 bg-indigo-600 text-white rounded-md">
            Verify OTP
          </button>
        </form>
      )}

      {/* ✅ STEP 3: Enter New Password with Toggle */}
      {step === 3 && (
        <form onSubmit={handlePasswordReset} className="bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm">
          <h1 className="text-white text-2xl font-semibold text-center mb-4">Set New Password</h1>

          <div className="mb-4 flex items-center w-full px-4 py-2 rounded-md bg-[#333A5C]">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="bg-transparent outline-none text-white w-full"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-white text-lg ml-2"
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>

          <button className="w-full py-2 bg-green-600 text-white rounded-md">Reset Password</button>
        </form>
      )}
    </div>
  );
};

export default ResetPassword;


