import React, { useState, useEffect, useRef } from "react";
import { UploadCloud, CheckCircle, AlertCircle, ChevronLeft, ChevronRight, Sparkles, Trophy, Brain } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../AuthContext";

/* ─── Slider data ─── */
const SUBJECTS = [
  {
    key: "react",
    label: "React",
    tag: "Frontend",
    color: "#38bdf8",
    bg: "from-sky-950 to-sky-900",
    border: "border-sky-600",
    accent: "text-sky-400",
    badge: "bg-sky-900 text-sky-300",
    icon: "⚛️",
    img: "https://img.icons8.com/ios-glyphs/30/react.png",
    description:
      "Components, hooks, reconciliation, performance optimization, state management patterns and advanced lifecycle control.",
    topics: ["Hooks", "Context API", "Virtual DOM", "Suspense"],
    route: "/subject-interview?subject=react",
  },
  {
    key: "java",
    label: "Java",
    tag: "Backend",
    color: "#f97316",
    bg: "from-orange-950 to-slate-900",
    border: "border-orange-600",
    accent: "text-orange-400",
    badge: "bg-orange-900 text-orange-300",
    icon: "☕",
    img: "https://cdn.iconscout.com/icon/free/png-512/free-java-logo-icon-download-in-svg-png-gif-file-formats--wordmark-programming-language-pack-logos-icons-1174953.png",
    description:
      "OOP, collections framework, multithreading, JVM internals, Spring Boot fundamentals and backend architecture.",
    topics: ["OOP", "Multithreading", "JVM", "Spring Boot"],
    route: "/subject-interview?subject=java",
  },
  {
    key: "mern",
    label: "MERN Stack",
    tag: "Full Stack",
    color: "#4ade80",
    bg: "from-emerald-950 to-slate-900",
    border: "border-emerald-600",
    accent: "text-emerald-400",
    badge: "bg-emerald-900 text-emerald-300",
    icon: "🌐",
    img: "https://i.imgur.com/YABbHHH.png",
    description:
      "Full-stack interview covering MongoDB, Express.js, React and Node.js — architecture, APIs, auth, and deployment.",
    topics: ["MongoDB", "Express", "Node.js", "REST APIs"],
    route: "/subject-interview?subject=mern",
  },
  {
    key: "python",
    label: "Python",
    tag: "Data / Backend",
    color: "#facc15",
    bg: "from-yellow-950 to-slate-900",
    border: "border-yellow-600",
    accent: "text-yellow-400",
    badge: "bg-yellow-900 text-yellow-300",
    icon: "🐍",
    img: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Python-logo-notext.svg/1869px-Python-logo-notext.svg.png",
    description:
      "Data structures, OOP, decorators, async I/O, and Python ecosystem for data science and backend engineering.",
    topics: ["Decorators", "Async", "OOP", "Pandas"],
    route: "/subject-interview?subject=python",
  },
];

/* ─── Hero carousel images ─── */
const HERO_SLIDES = [
  {
    img: "jobInterview.jfif",
    caption: "Crack your next interview",
  },
  {
    img: "mockInterview.jpg",
    caption: "AI-powered mock sessions",
  },
  {
    img: "resumeInterview.jfif",
    caption: "Resume-based questions",
  },
];

/* ─── Stats ─── */
const STATS = [
  { label: "Mock Interviews", value: "50K+", icon: <Brain size={20} /> },
  { label: "Success Rate", value: "87%", icon: <Trophy size={20} /> },
  { label: "AI Questions", value: "1M+", icon: <Sparkles size={20} /> },
];

/* ════════════════════════════════ COMPONENT ════════════════════════════════ */
const HomePage = () => {
  const { user, loading, ensureProfileLoaded } = useAuth();

  useEffect(() => { ensureProfileLoaded(); }, []);

  const [resumeFile, setResumeFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [resumeExists, setResumeExists] = useState(false);

  /* hero slider */
  const [heroIdx, setHeroIdx] = useState(0);
  /* subject slider */
  const [subIdx, setSubIdx] = useState(0);
  const subTimer = useRef(null);

  if (loading) return null;

  /* ── resume check ── */
  useEffect(() => {
    const checkResume = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}resume/getResume`, { credentials: "include" });
        const data = await res.json();
        if (res.ok && data.exists) setResumeExists(true);
      } catch (err) { console.error(err); }
    };
    if (user) checkResume();
  }, [user]);

  /* ── hero auto-advance ── */
  useEffect(() => {
    const t = setInterval(() => setHeroIdx(i => (i + 1) % HERO_SLIDES.length), 4000);
    return () => clearInterval(t);
  }, []);

  /* ── subject auto-advance ── */
  const resetSubTimer = () => {
    clearInterval(subTimer.current);
    subTimer.current = setInterval(() => setSubIdx(i => (i + 1) % SUBJECTS.length), 4500);
  };
  useEffect(() => { resetSubTimer(); return () => clearInterval(subTimer.current); }, []);

  const prevSub = () => { setSubIdx(i => (i - 1 + SUBJECTS.length) % SUBJECTS.length); resetSubTimer(); };
  const nextSub = () => { setSubIdx(i => (i + 1) % SUBJECTS.length); resetSubTimer(); };

  /* ── upload ── */
  const handleResumeUpload = async () => {
    if (!resumeFile) { setUploadError("Please select a resume file (PDF/DOCX)"); return; }
    try {
      setUploading(true); setUploadError(""); setUploadSuccess(false);
      const formData = new FormData();
      formData.append("resume", resumeFile);
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}resume/upload`, { method: "POST", body: formData, credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Resume upload failed");
      setUploadSuccess(true); setResumeExists(true); setResumeFile(null);
    } catch (err) { setUploadError(err.message); }
    finally { setUploading(false); }
  };

  const cur = SUBJECTS[subIdx];

  /* ════════ RENDER ════════ */
  return (
    <div className="min-h-screen flex flex-col bg-transparent text-white font-sans">

      {/* ══════════ HERO ══════════ */}
      <section className="relative overflow-hidden">

        {/* background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-sky-900/20 blur-3xl" />
          <div className="absolute top-20 right-0 w-[400px] h-[400px] rounded-full bg-blue-800/15 blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20
                        grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

          {/* ── left copy ── */}
          <div className="space-y-7 order-2 md:order-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full
                            bg-sky-900/60 border border-sky-700 text-sky-300 text-xs font-medium tracking-wide">
              <Sparkles size={12} /> AI-POWERED INTERVIEW PREP
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight">
              Crack Interviews
              <br />
              <span className="text-white">with </span>
              <span
                className="bg-gradient-to-r from-sky-400 to-blue-500
                          bg-clip-text text-transparent"
              >
                AI-Precision
              </span>
            </h1>

            <p className="text-slate-400 text-base sm:text-lg leading-relaxed max-w-lg">
              Personalized mock interviews built from your resume. Real questions.
              Instant feedback. Smarter improvement. 
            </p>

            {user && (
              <p className="text-slate-400 text-sm">
                Welcome back,{" "}
                <span className="text-sky-400 font-semibold">{user.firstName}</span>
                . Ready to level up today?
              </p>
            )}

            {/* CTA buttons */}
            <div className="flex flex-wrap gap-4 ">
              <Link
                to="/interviewstage"
                className={`inline-flex items-center gap-2 px-7 py-3 rounded-xl font-semibold text-sm
                            transition-all duration-200 shadow-lg
                            ${resumeExists
                              ? "bg-sky-500 hover:bg-sky-400 text-white shadow-sky-900/50"
                              : "bg-slate-700 text-slate-400 cursor-not-allowed"}`}
              >
                Start Interview
              </Link>
              <Link
                to="/score"
                className="inline-flex items-center gap-2 px-7 py-3 rounded-xl font-semibold text-sm
                           border border-sky-700 text-sky-400 hover:bg-sky-900/40 transition-all duration-200"
              >
                <Trophy size={16} /> Scoreboard
              </Link>
            </div>

            {/* stats row */}
            <div className="flex flex-wrap gap-6 ">
              {STATS.map(s => (
                <div key={s.label} className="flex items-center gap-2">
                  <span className="text-sky-500">{s.icon}</span>
                  <div>
                    <p className="text-white font-bold text-lg leading-none">{s.value}</p>
                    <p className="text-slate-500 text-xs">{s.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── right: hero image carousel ── */}
          <div className="order-1 md:order-2 flex justify-center">
            <div className="relative w-full max-w-sm sm:max-w-md">
              {/* card frame */}
              <div className="relative rounded-2xl overflow-hidden border border-sky-800/60
                              shadow-2xl shadow-sky-950/60 bg-slate-900 aspect-[4/3]">
                {HERO_SLIDES.map((slide, i) => (
                  <img
                    key={i}
                    src={slide.img}
                    alt={slide.caption}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700
                                ${i === heroIdx ? "opacity-100" : "opacity-0"}`}
                  />
                ))}
                {/* overlay caption */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t
                                from-black/80 to-transparent px-5 py-4">
                  <p className="text-white font-semibold text-sm">
                    {HERO_SLIDES[heroIdx].caption}
                  </p>
                </div>
              </div>

              {/* dots */}
              <div className="flex justify-center gap-2 mt-3">
                {HERO_SLIDES.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setHeroIdx(i)}
                    className={`rounded-full transition-all duration-300
                                ${i === heroIdx ? "w-6 h-2 bg-sky-500" : "w-2 h-2 bg-slate-600"}`}
                  />
                ))}
              </div>

              {/* floating badge */}
              <div className="absolute -top-4 -right-4 bg-sky-600 text-white text-xs
                              font-bold px-3 py-1.5 rounded-full shadow-lg shadow-sky-900/60
                              hidden sm:block">
                LIVE AI
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* ══════════ UPLOAD RESUME ══════════ */}
      <section className="py-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-8 sm:p-12
                          shadow-2xl relative overflow-hidden">
            {/* corner glow */}
            <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full
                            bg-sky-800/20 blur-3xl pointer-events-none" />

            <div className="relative space-y-6 text-center">
              <div className="inline-flex items-center justify-center w-14 h-14
                              rounded-2xl bg-sky-900/60 border border-sky-700 mx-auto">
                <UploadCloud size={24} className="text-sky-400" />
              </div>

              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white">
                  {resumeExists ? "Update Your Resume" : "Upload Your Resume"}
                </h2>
                <p className="text-slate-400 mt-2 text-sm sm:text-base">
                  Our AI analyzes your resume and crafts personalized interview questions just for you.
                </p>
              </div>

              {/* file input styled */}
              <label className="block">
                <div className="border-2 border-dashed border-slate-700 hover:border-sky-600
                                rounded-2xl p-6 cursor-pointer transition-colors group">
                  <p className="text-slate-400 group-hover:text-sky-400 text-sm transition-colors">
                    {resumeFile
                      ? <span className="text-sky-400 font-medium">📄 {resumeFile.name}</span>
                      : "Click to browse or drag & drop your PDF "}
                  </p>
                </div>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={e => setResumeFile(e.target.files[0])}
                  className="hidden"
                />
              </label>

              <button
                onClick={handleResumeUpload}
                disabled={uploading}
                className="w-full py-3.5 rounded-xl font-bold text-sm transition-all duration-200
                           bg-sky-600 hover:bg-sky-500 text-white flex justify-center items-center
                           gap-2 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg
                           shadow-sky-900/50"
              >
                {uploading ? (
                  <><span className="animate-spin inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full" /> Processing…</>
                ) : (
                  <><UploadCloud size={18} /> {resumeExists ? "Update Resume" : "Upload Resume"}</>
                )}
              </button>

              {uploadSuccess && (
                <div className="flex items-center justify-center gap-2 text-emerald-400 text-sm font-medium">
                  <CheckCircle size={16} />
                  {resumeExists ? "Resume updated successfully!" : "Resume uploaded successfully!"}
                </div>
              )}
              {uploadError && (
                <div className="flex items-center justify-center gap-2 text-red-400 text-sm font-medium">
                  <AlertCircle size={16} /> {uploadError}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
      {/* ══════════ SUBJECT INTERVIEW SLIDER ══════════ */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px]
                          rounded-full bg-sky-900/10 blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-sky-500 text-xs font-semibold tracking-widest uppercase mb-2">
              Practice by Topic
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Choose Your Mock Subject
            </h2>
            <p className="text-slate-500 mt-3 text-base max-w-lg mx-auto">
              Targeted interview practice designed for your tech stack.
            </p>
          </div>

          {/* ── SLIDER ── */}
          <div className="relative">
            {/* main card */}
            <div className={`bg-gradient-to-br ${cur.bg} border ${cur.border}/40
                             rounded-3xl overflow-hidden shadow-2xl`}
                 style={{ minHeight: 360 }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-0">

                {/* left: info */}
                <div className="p-8 sm:p-12 flex flex-col justify-center space-y-6">
                  <span className={`inline-flex items-center gap-2 text-xs font-semibold
                                   px-3 py-1 rounded-full w-fit ${cur.badge}`}>
                    {cur.tag}
                  </span>

                  <h3 className={`text-4xl sm:text-5xl font-extrabold ${cur.accent}`}>
                    {cur.icon} {cur.label}
                  </h3>

                  <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-sm">
                    {cur.description}
                  </p>

                  {/* topic pills */}
                  <div className="flex flex-wrap gap-2">
                    {cur.topics.map(t => (
                      <span key={t} className="px-3 py-1 rounded-full text-xs font-medium
                                              bg-white/10 text-white border border-white/10">
                        {t}
                      </span>
                    ))}
                  </div>

                  <Link
                    to={cur.route}
                    style={{ background: cur.color }}
                    className="inline-flex items-center gap-2 px-7 py-3 rounded-xl font-bold
                               text-sm text-black w-fit transition-opacity hover:opacity-90 shadow-lg"
                  >
                    Start {cur.label} Interview →
                  </Link>
                </div>

                {/* right: image */}
                <div className="flex items-center justify-center p-8 md:p-12">
                  <div className="relative">
                    {/* glow ring */}
                    <div className="absolute inset-0 rounded-full blur-2xl opacity-30"
                         style={{ background: cur.color }} />
                    <img
                      src={cur.img}
                      alt={cur.label}
                      className="relative w-40 h-40 sm:w-52 sm:h-52 object-contain drop-shadow-2xl
                                 transition-all duration-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* nav arrows */}
            <button
              onClick={prevSub}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 sm:-translate-x-6
                         w-11 h-11 rounded-full bg-slate-800 border border-slate-700
                         flex items-center justify-center text-white
                         hover:bg-slate-700 transition-colors shadow-xl z-10"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={nextSub}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 sm:translate-x-6
                         w-11 h-11 rounded-full bg-slate-800 border border-slate-700
                         flex items-center justify-center text-white
                         hover:bg-slate-700 transition-colors shadow-xl z-10"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* dot indicators + thumb nav */}
          <div className="flex justify-center gap-3 mt-8">
            {SUBJECTS.map((s, i) => (
              <button
                key={s.key}
                onClick={() => { setSubIdx(i); resetSubTimer(); }}
                className={`transition-all duration-300 rounded-full
                            ${i === subIdx ? "w-8 h-3" : "w-3 h-3 bg-slate-700"}`}
                style={i === subIdx ? { background: s.color } : {}}
              />
            ))}
          </div>

          {/* thumbnail cards for desktop */}
          <div className="hidden md:grid grid-cols-4 gap-4 mt-10">
            {SUBJECTS.map((s, i) => (
              <button
                key={s.key}
                onClick={() => { setSubIdx(i); resetSubTimer(); }}
                className={`rounded-2xl p-4 border text-left transition-all duration-200
                            ${i === subIdx
                              ? `border-opacity-70 bg-slate-800/80`
                              : "border-slate-800 bg-slate-900/60 hover:bg-slate-800/60"}`}
                style={i === subIdx ? { borderColor: s.color } : {}}
              >
                <p className={`font-bold text-sm ${i === subIdx ? "" : "text-slate-400"}`}
                   style={i === subIdx ? { color: s.color } : {}}>
                  {s.icon} {s.label}
                </p>
                <p className="text-slate-500 text-xs mt-1">{s.tag}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      

      {/* ══════════ READY CTA ══════════ */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="relative rounded-3xl overflow-hidden border border-sky-800/50
                          bg-gradient-to-br from-sky-950 via-slate-900 to-blue-950 p-12 sm:p-16">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80
                              rounded-full bg-sky-700/20 blur-3xl" />
            </div>
            <div className="relative space-y-6">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
                Ready for Your
                <span className="bg-gradient-to-r from-sky-400 to-blue-400
                                 bg-clip-text text-transparent"> AI Mock Interview?</span>
              </h2>
              <p className="text-slate-400 text-base max-w-xl mx-auto">
                Upload your resume and let our AI generate questions tailored to your experience and skill set.
              </p>
              <Link
                to="/interviewstage"
                className={`inline-flex items-center gap-2 px-10 py-4 rounded-xl font-bold
                            text-base transition-all duration-200 shadow-xl
                            ${resumeExists
                              ? "bg-sky-500 hover:bg-sky-400 text-white shadow-sky-900/60"
                              : "bg-slate-700 text-slate-400 cursor-not-allowed"}`}
              >
                <Brain size={18} /> Start Interview Now
              </Link>
              {!resumeExists && (
                <p className="text-slate-600 text-xs">Upload your resume above to unlock</p>
              )}
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default HomePage;