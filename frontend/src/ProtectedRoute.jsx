import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated,user, loading } = useAuth();
  const location = useLocation(); 
  if (loading) return null; 

   if (isAuthenticated || user) {
    return children;
  }
  
  return <Navigate to="/login" state={{ from: location }} replace />;
};

export default ProtectedRoute;
