import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated,user, loading } = useAuth();
  
  if (loading) return null; 

   if (isAuthenticated || user) {
    return children;
  }

  return <Navigate to="/login" replace />;
};

export default ProtectedRoute;
