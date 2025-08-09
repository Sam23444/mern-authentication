import React, { useContext, useState } from 'react';
import { assets } from '../assets/assets';
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AppContext } from "../context/AppContext";

const Login = () => {
  const navigate = useNavigate();
  const { backendUrl, setIsLoggedin, getUserData } = useContext(AppContext);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [state, setState] = useState("Sign Up");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      axios.defaults.withCredentials = true;

      if (state === 'Sign Up') {
        const { data } = await axios.post(`${backendUrl}/api/auth/register`, { name, email, password });

        if (data.success) {
          setIsLoggedin(true);
          await getUserData(); // ✅ Wait until user data loads
          toast.success("Account created successfully!");
          navigate('/');
        } else {
          toast.error(data.message);
        }
      } else {
        const { data } = await axios.post(`${backendUrl}/api/auth/login`, { email, password });

        if (data.success) {
          setIsLoggedin(true);
          await getUserData(); // ✅ Wait until user data loads
          toast.success("Login successful!");
          navigate('/');
        } else {
          toast.error(data.message);
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong!");
    }
  };

  return (
    <div className='flex items-center justify-center min-h-screen px-6 sm:px-0 bg-gradient-to-br from-blue-200 to-purple-400'>
      
      {/* Logo */}
      <img 
        onClick={() => navigate('/')}
        src={assets.logo} 
        alt='Company logo' 
        className='absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer' 
      />

      {/* Auth Card */}
      <div className='bg-slate-900 p-10 rounded-lg shadow-lg w-full sm:w-96 text-indigo-300 text-sm' role="form">
        
        <h2 className='text-3xl font-semibold text-white text-center mb-3'>
          {state === 'Sign Up' ? 'Create Account' : 'Login'}
        </h2>
        <p className='text-center text-sm mb-6'>
          {state === 'Sign Up' ? 'Create your account' : 'Login to your account!'}
        </p>

        <form onSubmit={handleSubmit}>
          {state === 'Sign Up' && (
            <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]'>
              <img src={assets.person_icon} alt='person icon' />
              <input 
                id="name"
                aria-label="Full Name"
                type="text" 
                placeholder='Full Name'
                className='bg-transparent outline-none w-full text-white'
                value={name}
                onChange={(e) => setName(e.target.value)}
                required 
              />
            </div>
          )}

          {/* Email */}
          <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]'>
            <img src={assets.mail_icon} alt='mail icon' />
            <input 
              id="email"
              aria-label="Email Address"
              type="email" 
              placeholder='Email'
              className='bg-transparent outline-none w-full text-white'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>

          {/* Password with Toggle */}
          <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C] relative'>
            <img src={assets.lock_icon} alt='lock icon' />
            <input 
              id="password"
              aria-label="Password"
              type={showPassword ? "text" : "password"} 
              placeholder='Password'
              className='bg-transparent outline-none w-full text-white'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
            <button 
              type="button"
              aria-label={showPassword ? "Hide Password" : "Show Password"}
              onClick={() => setShowPassword(!showPassword)}
              className='absolute right-4 text-xs text-blue-300 hover:underline focus:outline-none'
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          {/* Forgot Password */}
          <p
            onClick={() => navigate('/reset-password')}
            className='mb-4 cursor-pointer text-indigo-400 hover:underline'>
            Forget password?
          </p>

          {/* Submit */}
          <button 
            type="submit"
            className='w-full py-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-900 text-white cursor-pointer hover:opacity-90 transition-all'>
            {state}
          </button>
        </form>

        {/* Toggle between Login/Signup */}
        {state === 'Sign Up' ? (
          <p className='text-gray-400 text-center text-xs mt-4'>
            Already have an account?{" "}
            <span 
              onClick={() => setState('Login')} 
              className='text-blue-400 cursor-pointer underline'>
              Login here
            </span>
          </p>
        ) : (
          <p className='text-gray-400 text-center text-xs mt-4'>
            Don't have an account?{" "}
            <span 
              onClick={() => setState('Sign Up')}  
              className='text-blue-400 cursor-pointer underline'>
              Sign up
            </span>
          </p>
        )}
      </div>

      {/* Toast Notification */}
      <ToastContainer position="top-center" autoClose={3000} hideProgressBar />
    </div>
  );
};

export default Login;

;

