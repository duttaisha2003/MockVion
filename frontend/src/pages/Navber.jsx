
import { Link } from "react-router-dom";
import { User } from "lucide-react";
import { useAuth } from "../AuthContext";

const Navbar = () => {
  const { isAuthenticated, user,logout } = useAuth();
  const isLoggedIn = isAuthenticated || user;
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

        <Link to="/" className="text-2xl font-bold text-sky-800">
        <img src="public/r.png" alt="logo" height="20px" width="200px"/>
         
        </Link>

        <nav className="hidden md:flex gap-8 text-sky-800 font-semibold">
          <Link to="/homepage">Home</Link>
          <Link to="/interviewstage">Interview</Link>
          <Link to="/score">Score Board</Link>
        </nav>

        {/* Auth Section */}
        {!isLoggedIn ? (
          <div className="flex gap-4">
            <Link to="/login" className="font-semibold">Login</Link>
            <Link to="/register" className="font-semibold">Register</Link>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="font-medium text-sky-800">{isLoggedIn.firstName}</p>
              <p className="text-sm text-sky-800">{isLoggedIn.emailId}</p>
            </div>

            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
               <Link to="/profile" ><User className="text-sky-800" /></Link>
            </div>

            <button
              onClick={logout}
              className="text-sky-800 font-semibold"
            >
              Logout
            </button>
          </div>
        )}

      </div>
    </header>
  );
};

export default Navbar;
