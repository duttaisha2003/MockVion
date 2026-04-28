import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { Menu, X, LogOut, ChevronDown } from "lucide-react";

const NAV_LINKS = [
  { to: "/homepage",       label: "Home" },
  { to: "/interviewstage", label: "Interview" },
  { to: "/score",          label: "Score Board" },
  { to: "/prep",           label: "Preparation" },
  { to: "/job-board",      label: "Job Board" },
];

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const isLoggedIn = isAuthenticated || user;
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  return (
    <header className="bg-[#080e1a] border-b border-slate-800/70 sticky top-0 z-50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

        {/* ── Logo ── */}
        <Link to="/" className="flex items-center shrink-0">
        
          <img
            src="/logo_final.png"
            alt="logo"
            className="h-9 w-auto object-contain"
          />
        </Link>

        {/* ── Desktop Nav ── */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150
                ${isActive(to)
                  ? "bg-sky-900/60 text-sky-400"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"}`}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* ── Auth ── */}
        <div className="hidden md:flex items-center gap-3">
          {!isLoggedIn ? (
            <>
              <Link
                to="/login"
                className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-300
                           hover:text-white hover:bg-slate-800 transition-all duration-150"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 rounded-xl text-sm font-bold text-white
                           bg-sky-600 hover:bg-sky-500 transition-all duration-150
                           shadow-lg shadow-sky-900/40"
              >
                Register
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-3">
              {/* user info */}
              <div className="text-right hidden lg:block">
                <p className="text-white text-sm font-semibold leading-none">{isLoggedIn.firstName}</p>
                <p className="text-slate-500 text-xs mt-0.5">{isLoggedIn.emailId}</p>
              </div>

              {/* avatar */}
              <Link to="/profile">
                <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-sky-700
                                hover:border-sky-500 transition-colors shadow-lg shadow-sky-950/50">
                  <img
                    src={user?.image || "https://cdn-icons-png.flaticon.com/512/847/847969.png"}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
              </Link>

              {/* logout */}
              <button
                onClick={logout}
                title="Logout"
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold
                           text-slate-400 hover:text-red-400 hover:bg-slate-800/70
                           transition-all duration-150"
              >
                <LogOut size={15} />
                <span className="hidden lg:inline">Logout</span>
              </button>
            </div>
          )}
        </div>

        {/* ── Mobile hamburger ── */}
        <button
          onClick={() => setMenuOpen(o => !o)}
          className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg
                     text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* ── Mobile Menu ── */}
      {menuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-[#080e1a] px-4 py-4 space-y-1">
          {NAV_LINKS.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setMenuOpen(false)}
              className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-all
                ${isActive(to)
                  ? "bg-sky-900/60 text-sky-400"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"}`}
            >
              {label}
            </Link>
          ))}

          <div className="pt-3 border-t border-slate-800 mt-3">
            {!isLoggedIn ? (
              <div className="flex gap-3">
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="flex-1 text-center px-4 py-2.5 rounded-lg text-sm font-semibold
                             text-slate-300 border border-slate-700 hover:bg-slate-800 transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMenuOpen(false)}
                  className="flex-1 text-center px-4 py-2.5 rounded-xl text-sm font-bold
                             bg-sky-600 hover:bg-sky-500 text-white transition shadow-lg"
                >
                  Register
                </Link>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <Link
                  to="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3"
                >
                  <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-sky-700">
                    <img
                      src={user?.image || "https://cdn-icons-png.flaticon.com/512/847/847969.png"}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">{isLoggedIn.firstName}</p>
                    <p className="text-slate-500 text-xs">{isLoggedIn.emailId}</p>
                  </div>
                </Link>
                <button
                  onClick={() => { logout(); setMenuOpen(false); }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold
                             text-slate-400 hover:text-red-400 hover:bg-slate-800 transition"
                >
                  <LogOut size={15} /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;