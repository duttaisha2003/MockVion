import React from 'react';
import { Link } from "react-router-dom";
import { Sparkles, Trophy } from "lucide-react";

const Dashboard = () => {
  return (
    <div className="min-h-screen flex flex-col bg-transparent text-white font-sans">

      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden py-20">

        {/* background glows */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-sky-900/20 blur-3xl" />
          <div className="absolute top-20 right-0 w-[350px] h-[350px] rounded-full bg-blue-800/15 blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 items-center gap-14">

          {/* Text */}
          <div className="space-y-5 order-2 md:order-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full
                            bg-sky-900/60 border border-sky-700 text-sky-300 text-xs font-semibold tracking-widest">
              <Sparkles size={12} /> AI-POWERED INTERVIEW PREP
            </div>

            <h1 className="text-4xl lg:text-6xl font-extrabold leading-tight tracking-tight">
              Your interview partner
              <span className="block bg-gradient-to-r from-sky-400 to-blue-500
                               bg-clip-text text-transparent mt-1">
                powered by AI.
              </span>
            </h1>

            <p className="text-slate-400 text-base sm:text-lg leading-relaxed max-w-lg">
              Personalized mock interviews built from your resume.
              Real questions. Instant feedback. Smarter improvement.
            </p>
            <p className="text-slate-400 text-base sm:text-lg leading-relaxed max-w-lg">
              Think sharper. Answer stronger. Stand out instantly.
              Simulate the pressure. Sharpen your edge. Secure the role.
            </p>
            <p className="text-slate-400 text-base sm:text-lg leading-relaxed max-w-lg">
              Upgrade your preparation. Upgrade your outcomes.
              A smarter way to prepare for high-stakes opportunities.
            </p>

            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-sm
                         bg-sky-500 hover:bg-sky-400 text-white transition-all duration-200
                         shadow-lg shadow-sky-900/50 mt-2"
            >
              Start Interview
            </Link>
          </div>

          {/* Image */}
          <div className="flex justify-center order-1 md:order-2">
            <div className="relative w-full max-w-sm sm:max-w-md">
              <div className="rounded-2xl overflow-hidden border border-sky-800/50
                              shadow-2xl shadow-sky-950/60 bg-slate-900">
                <img
                  src="https://cdn.vectorstock.com/i/500p/61/20/ai-agent-bot-flying-out-of-digital-laptop-robot-vector-57836120.jpg"
                  alt="AI Interview"
                  className="w-full object-cover"
                />
              </div>
              <div className="absolute -top-4 -right-4 bg-sky-600 text-white text-xs
                              font-bold px-3 py-1.5 rounded-full shadow-lg shadow-sky-900/60
                              hidden sm:block">
                LIVE AI
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= INTERVIEW CTA SECTION ================= */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden border border-sky-800/40
                          bg-gradient-to-br from-sky-950 via-slate-900 to-blue-950 p-12 sm:p-16 text-center">

            {/* glow */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-72
                              rounded-full bg-sky-700/20 blur-3xl" />
            </div>

            <div className="relative space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full
                              bg-sky-900/60 border border-sky-700 text-sky-300 text-xs font-semibold tracking-widest">
                <Trophy size={12} /> MOCK INTERVIEW
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
                Ready for Your
                <span className="bg-gradient-to-r from-sky-400 to-blue-400
                                 bg-clip-text text-transparent"> AI Mock Interview?</span>
              </h2>
              <p className="text-slate-400 text-base max-w-xl mx-auto">
                Practice real interview questions, get instant AI feedback, and
                track your improvement after every session.
              </p>
              <Link
                to="/interviewstage"
                className="inline-flex items-center gap-2 px-10 py-4 rounded-xl font-bold
                           text-base bg-sky-500 hover:bg-sky-400 text-white transition-all
                           duration-200 shadow-xl shadow-sky-900/60"
              >
                Start Interview
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ================= RECRUITER SECTION ================= */}
      <section className="py-20 relative overflow-hidden">

        {/* glow */}
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full
                        bg-sky-900/10 blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-14 items-center">

          {/* Left Content */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full
                            bg-sky-900/60 border border-sky-700 text-sky-300 text-xs font-semibold tracking-widest">
              <Sparkles size={12} /> FOR RECRUITERS
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight">
              Hiring the Right Candidate
              <span className="block text-sky-400 mt-1">
                Starts with Better Interviews
              </span>
            </h2>

            <p className="text-slate-400 text-base leading-relaxed max-w-lg">
              Use MockVion's AI-powered interview system to evaluate candidates
              based on real interview performance. Analyze responses, view AI
              scoring, and identify top talent faster.
            </p>

            <ul className="space-y-3">
              {[
                "AI scored interview performance",
                "Resume-based candidate evaluation",
                "Detailed skill breakdown",
              ].map(item => (
                <li key={item} className="flex items-center gap-3 text-slate-300 text-sm">
                  <span className="w-5 h-5 rounded-full bg-sky-900/60 border border-sky-600
                                   flex items-center justify-center text-sky-400 text-xs flex-shrink-0">
                    ✔
                  </span>
                  {item}
                </li>
              ))}
            </ul>

            <Link
              to="/recruiter-login"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-sm
                         bg-sky-500 hover:bg-sky-400 text-white transition-all duration-200
                         shadow-lg shadow-sky-900/50"
            >
              Recruiter Login
            </Link>
          </div>

          {/* Right Illustration */}
          <div className="flex justify-center">
            <div className="rounded-2xl overflow-hidden border border-sky-800/30
                            shadow-2xl shadow-sky-950/40 w-full max-w-md">
              <img
                src="https://glider.ai/wp-content/uploads/Screen-Shot-2023-09-07-at-4.05.50-AM.png"
                alt="Recruiter Dashboard"
                className="w-full h-72 object-cover"
              />
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Dashboard;