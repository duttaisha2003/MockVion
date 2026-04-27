import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";

const NAV_LINKS = [
  { to: "/privacy", label: "Privacy Policy" },
  { to: "/terms",   label: "Terms of Service" },
  { to: "/contact", label: "Contact" },
];

function Footer() {
  return (
    <footer className="bg-[#080e1a] border-t border-slate-800/70 text-white relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        <div className="flex flex-col md:flex-row justify-between items-center gap-6">

          {/* Brand */}
          <div className="text-center md:text-left space-y-1">
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <Sparkles size={16} className="text-sky-500" />
              <span className="text-xl font-extrabold tracking-tight
                               bg-gradient-to-r from-sky-400 to-blue-400
                               bg-clip-text text-transparent">
                mockVion
              </span>
            </div>
            <p className="text-slate-500 text-sm">AI Interview Bot Platform</p>
          </div>

          {/* Links */}
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            {NAV_LINKS.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className="text-slate-400 hover:text-sky-400 text-sm
                           font-medium transition-colors duration-150"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        {/* Divider + copyright */}
        <div className="border-t border-slate-800 mt-8 pt-6 text-center text-slate-600 text-xs">
          © {new Date().getFullYear()} mockVion. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

export default Footer;