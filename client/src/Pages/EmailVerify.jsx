import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { assets } from '../assets/assets';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AppContext } from '../context/AppContext';

const EmailVerify = () => {
  const navigate = useNavigate();
  const { backendUrl, isLoggedin, userData } = useContext(AppContext); // ✅ FIXED
  const [otp, setOtp] = useState(Array(6).fill(""));

  // ✅ Submit OTP to backend
  const submitOtp = async (otpValue) => {
    if (otpValue.length !== 6) {
      toast.error("Please enter all 6 digits of the OTP");
      return;
    }

    try {
      axios.defaults.withCredentials = true;
      const { data } = await axios.post(`${backendUrl}/api/auth/verify-account`, { otp: otpValue });

      if (data.success) {
        toast.success("✅ Email verified successfully!");
        navigate('/');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Verification failed!");
    }
  };

  // ✅ Handle input change
  const handleChange = (e, index) => {
    const value = e.target.value.replace(/\D/g, "");
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) document.getElementById(`otp-${index + 1}`).focus();

    if (newOtp.join("").length === 6) submitOtp(newOtp.join(""));
  };

  // ✅ Handle backspace
  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`).focus();
    }
  };

  // ✅ Handle paste
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("Text").replace(/\D/g, "");
    if (!pastedData) return;

    const otpArray = pastedData.slice(0, 6).split("");
    setOtp(otpArray);

    if (otpArray.length === 6) submitOtp(otpArray.join(""));
    else document.getElementById(`otp-${otpArray.length - 1}`).focus();
  };

  // ✅ Manual submit
  const handleSubmit = (e) => {
    e.preventDefault();
    submitOtp(otp.join(""));
  };

  // ✅ Redirect if already logged in and verified
  useEffect(() => {
    if (isLoggedin && userData?.isAccountVerified) navigate('/');
  }, [isLoggedin, userData, navigate]); // ✅ FIXED dependency array

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-300 to-purple-500">
      <img
        onClick={() => navigate('/')}
        src={assets.logo}
        alt="logo"
        className="absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer"
      />

      <form onSubmit={handleSubmit} className="bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm">
        <h1 className="text-white text-2xl font-semibold text-center mb-4">Email Verification OTP</h1>
        <p className="text-center mb-7 text-indigo-400">Enter the 6-digit code sent to your email.</p>

        <div className="flex justify-between mb-8">
          {otp.map((digit, index) => (
            <input
              key={index}
              id={`otp-${index}`}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(e, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onPaste={handlePaste}
              className="w-12 h-12 bg-[#333A5C] text-white text-center text-xl rounded-md outline-none"
              required
            />
          ))}
        </div>

        <button type="submit" className="w-full py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition">
          Verify Email
        </button>
      </form>
    </div>
  );
};

export default EmailVerify;


