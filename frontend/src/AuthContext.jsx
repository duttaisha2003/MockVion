import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  // Check login on app load
  const fetchProfile = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}api/auth/getProfile`,
        { withCredentials: true }
      );
      setUser(res.data.user);// set the all details of user
      
    } catch {
      setUser(null);
      
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // 🔑 This is the key addition
  const ensureProfileLoaded = async () => {
    if (user) return user;
    return await fetchProfile();
  };

  const updateProfile = async (formData) => {
    try {
      const res = await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}api/auth/updateProfile`,
        formData,
        { withCredentials: true }
      );

      // Immediately update global state
      setUser(res.data.user);

      return { success: true };
    } catch (error) {
      console.error("Update failed:", error);
      return { success: false };
    }
  };

  const logout = async () => {
    await axios.post(`${import.meta.env.VITE_BACKEND_URL}api/auth/logout`, {}, { withCredentials: true });
    console.log("log out")
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, logout,isAuthenticated,ensureProfileLoaded,updateProfile,
        setIsAuthenticated, }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
