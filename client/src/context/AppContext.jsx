import axios from "axios";
import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";

export const AppContext = createContext();

export const AppContextProvider = (props) => {
  axios.defaults.withCredentials = true;
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [isLoggedin, setIsLoggedin] = useState(false);
  const [userData, setUserData] = useState(null);

  // ✅ Fetch User Data
  const getUserData = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/user/data`);
      if (data.success) {
        setUserData(data.userData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch user data");
    }
  };

  // ✅ Check if user is authenticated
  const getAuthState = async () => {
    // ✅ Check for token in cookies (prevents unnecessary API call)
    if (!document.cookie.includes("token=")) {
      setIsLoggedin(false);
      return;
    }

    try {
      const { data } = await axios.get(`${backendUrl}/api/auth/is-auth`);
      if (data.success) {
        setIsLoggedin(true);
        getUserData();
      }
    } catch (error) {
      setIsLoggedin(false);
      if (error.response?.status !== 401) {
        toast.error(error.response?.data?.message || "Authentication failed");
      }
    }
  };

  // ✅ Call getAuthState on mount
  useEffect(() => {
    getAuthState();
  }, []);

  const value = {
    backendUrl,
    isLoggedin, setIsLoggedin,
    userData, setUserData,
    getUserData
  };

  return (
    <AppContext.Provider value={value}>
      {props.children}
    </AppContext.Provider>
  );
};
