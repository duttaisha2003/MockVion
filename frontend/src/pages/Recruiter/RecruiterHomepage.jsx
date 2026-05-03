
import React, { useEffect, useState } from "react";
import {
  Briefcase, Users, ClipboardList, BarChart3,
  Plus, ChevronRight, Zap, Target, TrendingUp,
} from "lucide-react";
import { Link } from "react-router-dom";

/* ─── stagger hook ─── */
const useStagger = (count, delay = 80) => {
  const [visible, setVisible] = useState([]);
  useEffect(() => {
    const timers = [];
    for (let i = 0; i < count; i++) {
      timers.push(
        setTimeout(() => setVisible((v) => [...v, i]), 120 + i * delay)
      );
    }
    return () => timers.forEach(clearTimeout);
  }, []);
  return (i) => visible.includes(i);
};

const CARDS = [
  {
    to: "/create-job",
    icon: Plus,
    tag: "CREATE",
    title: "Post a Job",
    desc: "Launch new openings and start receiving AI-screened candidates instantly.",
    stat: "New",
    iconBg: "bg-sky-400/10",
    iconBorder: "border-sky-400/20",
    iconColor: "text-sky-400",
    tagColor: "text-sky-400 bg-sky-400/10 border-sky-400/20",
    statColor: "text-sky-400 bg-sky-400/10",
    hoverBorder: "hover:border-sky-400/40",
  },
  {
    to: "/recruiter-getAllJob",
    icon: ClipboardList,
    tag: "BROWSE",
    title: "All Job Posts",
    desc: "See every listing you've created with status, applicant counts and metrics.",
    stat: "All",
    iconBg: "bg-emerald-400/10",
    iconBorder: "border-emerald-400/20",
    iconColor: "text-emerald-400",
    tagColor: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    statColor: "text-emerald-400 bg-emerald-400/10",
    hoverBorder: "hover:border-emerald-400/40",
  },
  {
    to: "/recruiter-manage-jobs",
    icon: Target,
    tag: "MANAGE",
    title: "Manage Posts",
    desc: "Edit, pause or close listings. Fine-tune JD, skills and question sets.",
    stat: "Edit",
    iconBg: "bg-orange-400/10",
    iconBorder: "border-orange-400/20",
    iconColor: "text-orange-400",
    tagColor: "text-orange-400 bg-orange-400/10 border-orange-400/20",
    statColor: "text-orange-400 bg-orange-400/10",
    hoverBorder: "hover:border-orange-400/40",
  },
  {
    to: "/recruiter-viewcandidates",
    icon: Users,
    tag: "REVIEW",
    title: "View Candidates",
    desc: "Browse applicants, review AI interview scores and proctoring reports.",
    stat: "Live",
    iconBg: "bg-indigo-400/10",
    iconBorder: "border-indigo-400/20",
    iconColor: "text-indigo-400",
    tagColor: "text-indigo-400 bg-indigo-400/10 border-indigo-400/20",
    statColor: "text-indigo-400 bg-indigo-400/10",
    hoverBorder: "hover:border-indigo-400/40",
  },
  {
    to: "/recruiter/job/shortlisted",
    icon: Zap,
    tag: "SHORTLIST",
    title: "Shortlisted",
    desc: "Candidates you've starred. Move them to final rounds with one click.",
    stat: "Final",
    iconBg: "bg-pink-400/10",
    iconBorder: "border-pink-400/20",
    iconColor: "text-pink-400",
    tagColor: "text-pink-400 bg-pink-400/10 border-pink-400/20",
    statColor: "text-pink-400 bg-pink-400/10",
    hoverBorder: "hover:border-pink-400/40",
  },
  {
    to: "/analytics",
    icon: TrendingUp,
    tag: "INSIGHTS",
    title: "Analytics",
    desc: "Funnel metrics, score distributions and engagement data at a glance.",
    stat: "Show",
    iconBg: "bg-violet-400/10",
    iconBorder: "border-violet-400/20",
    iconColor: "text-violet-400",
    tagColor: "text-violet-400 bg-violet-400/10 border-violet-400/20",
    statColor: "text-violet-400 bg-violet-400/10",
    hoverBorder: "hover:border-violet-400/40",
  },
];

const STATS = [
  { label: "Active Jobs",      icon: Briefcase,  iconBg: "bg-sky-400/10",     iconColor: "text-sky-400"     },
  { label: "Total Applicants", icon: Users,       iconBg: "bg-indigo-400/10",  iconColor: "text-indigo-400"  },
  { label: "Shortlisted",      icon: Zap,         iconBg: "bg-pink-400/10",    iconColor: "text-pink-400"    },
  { label: "Hired Applicants", icon: BarChart3,   iconBg: "bg-emerald-400/10", iconColor: "text-emerald-400" },
];

/* ══MAIN COMPONENT══ */
const RecruiterHomepage = () => {
  const isVisible = useStagger(CARDS.length + 2, 70);

  return (
    <div className="relative min-h-screen">

      {/* ── HERO ── */}
      <section className="max-w-6xl mx-auto px-6 pt-8 pb-8">
        <div
          className="transition-all duration-700"
          style={{
            opacity: isVisible(0) ? 1 : 0,
            transform: isVisible(0) ? "translateY(0)" : "translateY(24px)",
          }}
        >
          {/* eyebrow */}
          <div className="flex items-center gap-2 mb-5">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase text-sky-400 bg-sky-400/10 border border-sky-400/30">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 shadow-[0_0_8px_#38bdf8]" />
              Recruiter Portal
            </span>
          </div>

          {/* headline */}
          <h1 className="text-5xl font-extrabold tracking-tight leading-tight mb-3 text-slate-50">
            Recruiter{" "}
            <span className="bg-gradient-to-r from-sky-400 via-indigo-400 to-pink-400 bg-clip-text text-transparent">
              HomePage
            </span>
          </h1>

          <p className="text-lg text-slate-400 max-w-lg">
            Manage your hiring pipeline — post jobs, review AI-screened candidates, and close roles faster.
          </p>
        </div>

        {/* ── STAT STRIP ── */}
        <div
          className="grid grid-cols-4 gap-3 mt-9 transition-all duration-700"
          style={{
            opacity: isVisible(1) ? 1 : 0,
            transform: isVisible(1) ? "translateY(0)" : "translateY(16px)",
          }}
        >
          {STATS.map((s) => (
            <div
              key={s.label}
              className="flex items-center gap-3 rounded-xl px-4 py-3 bg-white/[0.03] border border-white/[0.07] backdrop-blur-md"
            >
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${s.iconBg}`}>
                <s.icon size={15} className={s.iconColor} />
              </div>
              <div>
                <div className="text-xl font-extrabold leading-none text-slate-50">—</div>
                <div className="text-xs mt-0.5 text-slate-500">{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── DIVIDER LABEL ── */}
      <section className="max-w-6xl mx-auto px-6 py-3">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold tracking-widest uppercase text-slate-600">
            Quick Actions
          </span>
          <div className="flex-1 h-px bg-white/[0.05]" />
        </div>
      </section>

      {/* ── CARDS GRID ── */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-3 gap-4">
          {CARDS.map((card, i) => (
            <CardItem
              key={card.to}
              card={card}
              visible={isVisible(i + 2)}
              delay={i * 70}
            />
          ))}
        </div>
      </section>

    </div>
  );
};

/* ── CARD ITEM ── */
const CardItem = ({ card, visible, delay }) => {
  const [hovered, setHovered] = useState(false);
  const Icon = card.icon;

  return (
    <Link
      to={card.to}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="block no-underline group"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(28px)",
        transition: `opacity 0.55s ease ${delay}ms, transform 0.55s ease ${delay}ms`,
      }}
    >
      <div
        className={`
          relative overflow-hidden rounded-2xl p-6 h-full
          backdrop-blur-xl transition-all duration-300
          bg-white/[0.03] border border-white/[0.07]
          ${card.hoverBorder}
          hover:bg-white/[0.06]
          hover:shadow-2xl
        `}
      >
        {/* top row */}
        <div className="flex items-start justify-between mb-5">
          <div
            className={`
              w-11 h-11 rounded-xl flex items-center justify-center
              border transition-transform duration-300
              ${card.iconBg} ${card.iconBorder}
              ${hovered ? "scale-110" : "scale-100"}
            `}
          >
            <Icon size={19} className={card.iconColor} />
          </div>

          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold tracking-wider px-2 py-0.5 rounded-md border ${card.tagColor}`}>
              {card.tag}
            </span>
            <ChevronRight
              size={13}
              className={`text-slate-600 transition-transform duration-300 ${hovered ? "translate-x-1" : ""}`}
            />
          </div>
        </div>

        {/* title */}
        <h3 className={`text-base font-bold mb-2 leading-snug transition-colors duration-300 ${hovered ? "text-white" : "text-slate-100"}`}>
          {card.title}
        </h3>

        {/* description */}
        <p className={`text-sm leading-relaxed transition-colors duration-300 ${hovered ? "text-slate-400" : "text-slate-500"}`}>
          {card.desc}
        </p>

        {/* bottom row */}
        <div className="flex items-center justify-between mt-5 pt-4 border-t border-white/[0.05]">
          <span className="text-xs text-slate-700">mockvion.ai</span>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${card.statColor}`}>
            {card.stat}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default RecruiterHomepage;
