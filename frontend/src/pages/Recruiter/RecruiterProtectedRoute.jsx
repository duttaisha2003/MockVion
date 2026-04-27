import { Navigate } from "react-router-dom";
import { useRecruiterAuth } from "./RecruiterAuthContext";

const RecruiterProtectedRoute = ({ children }) => {
  const { recruiter, loading } = useRecruiterAuth();

  if (loading) return null;

  if (recruiter) {
    return children;
  }

  return <Navigate to="/recruiter-login" replace />;
};

export default RecruiterProtectedRoute;