
import { Link } from "react-router-dom";
import { User } from "lucide-react";
import { useAuth } from "../AuthContext";

const Navbar = () => {
  const { isAuthenticated, user,logout } = useAuth();
  const isLoggedIn = isAuthenticated || user;
  return (
    <header className="bg-black shadow-sm">
      <div className="max-w-7xl mx-auto px-6  flex justify-between items-center">

        <Link to="/" className="text-2xl font-bold text-sky-800">
        <img src="public/logo_final.png" alt="logo" height="10px" width="200px"/>
         
        </Link>

        <nav className="hidden md:flex gap-8 text-white font-semibold">
          <Link to="/homepage">Home</Link>
          <Link to="/interviewstage">Interview</Link>
          <Link to="/score">Score Board</Link>
        </nav>

        {/* Auth Section */}
        {!isLoggedIn ? (
          <div className="flex gap-4 text-white">
            <Link to="/login" className="font-semibold">Login</Link>
            <Link to="/register" className="font-semibold">Register</Link>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="font-medium text-white">{isLoggedIn.firstName}</p>
              <p className="text-sm text-white">{isLoggedIn.emailId}</p>
            </div>

          <Link to="/profile">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-300">
              <img
                src={
                  user?.image ||
                  "https://cdn-icons-png.flaticon.com/512/847/847969.png"
                }
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
          </Link>


            <button
              onClick={logout}
              className="text-white font-semibold"
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
