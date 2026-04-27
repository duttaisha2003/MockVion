import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const RecruiterAuthContext = createContext();

export const RecruiterAuthProvider = ({ children }) => {
  const [recruiter, setRecruiter] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchRecruiterProfile = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}api/recruiter/getProfile`,
        { withCredentials: true }
      );

      setRecruiter(res.data.recruiter);
    } catch {
      setRecruiter(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecruiterProfile();
  }, []);

  const ensureRecruiterLoaded = async () => {
    if (recruiter) return recruiter;
    return await fetchRecruiterProfile();
  };

  const logoutRecruiter = async () => {
    await axios.post(
      `${import.meta.env.VITE_BACKEND_URL}api/recruiter/logout`,
      {},
      { withCredentials: true }
    );
    setRecruiter(null);
  };

  return (
    <RecruiterAuthContext.Provider
      value={{
        recruiter,
        loading,
        isRecruiterAuthenticated: !!recruiter,
        logoutRecruiter,
        ensureRecruiterLoaded,
      }}
    >
      {children}
    </RecruiterAuthContext.Provider>
  );
};

export const useRecruiterAuth = () => useContext(RecruiterAuthContext);