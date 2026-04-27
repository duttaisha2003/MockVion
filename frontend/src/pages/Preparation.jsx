import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Copy, CheckCheck, Mic, Zap, Target, Star } from 'lucide-react';

/* ─── data (unchanged) ─── */
const tellMeAboutYourself = {
  formula: {
    title: "Present-Past-Future Formula",
    icon: "📝",
    steps: [
      "Present: Briefly state your current role and key responsibilities",
      "Past: Highlight 2-3 relevant past achievements that align with the job",
      "Future: Explain why you're excited about this role and how it fits your career goals",
    ],
  },
  sample: {
    title: "Sample Script",
    icon: "🎯",
    text: "I'm currently a [Your Role] at [Company], where I lead [key initiative]. Previously, I [achievement] which resulted in [measurable outcome]. I'm excited to bring my expertise in [key skill] to [Target Company] because I'm passionate about [company mission/industry trend].",
  },
  dos: [
    "Keep it under 90 seconds",
    "Focus on achievements, not just duties",
    "Tailor your story to the company's needs",
    "End with enthusiasm about the role",
  ],
  donts: [
    "Don't recite your resume word-for-word",
    "Avoid personal life details or controversial topics",
    "Don't use clichés like 'I'm a perfectionist'",
    "Never sound robotic — keep it natural",
  ],
};

const confidenceTips = [
  { id: 1, title: "Power Posing",           description: "Stand tall with hands on hips for 2 minutes before interview — boosts testosterone and confidence", icon: "🧘" },
  { id: 2, title: "Slow & Deliberate Speech",description: "Speak 20% slower than usual — conveys authority and gives you thinking time",                     icon: "🐢" },
  { id: 3, title: "STAR Method",            description: "Situation → Task → Action → Result: Structure behavioral answers for maximum impact",               icon: "⭐" },
  { id: 4, title: "Strategic Pauses",       description: "Pause 3-5 seconds after questions — shows thoughtfulness, not nervousness",                        icon: "⏸️" },
  { id: 5, title: "Anchor Statements",      description: "Start with 'Absolutely,' 'Great question,' or 'Certainly' to project confidence",                  icon: "⚓" },
  { id: 6, title: "Camera Eye Contact",     description: "Look at camera lens, not yourself — creates genuine connection with interviewer",                   icon: "👁️" },
];

const toughQuestions = [
  { id: 1, question: "What's your biggest weakness?",          answer: "Choose a real but non-critical weakness and show improvement. Example: 'I used to struggle with public speaking, so I joined Toastmasters. Now I confidently lead team presentations and client meetings.'" },
  { id: 2, question: "Why should we hire you?",                answer: "Summarize your unique value proposition. 'With my [X years] experience in [skill] and proven track record of [achievement], I can immediately help your team achieve [specific goal] while bringing fresh perspectives.'" },
  { id: 3, question: "Where do you see yourself in 5 years?", answer: "Show ambition tied to company growth. 'I aim to grow into a leadership role while mastering skills that align with the company's roadmap. I see myself contributing to [company's future initiative] and mentoring others.'" },
  { id: 4, question: "Tell me about a time you failed.",       answer: "Use STAR method. Describe a real failure, what you learned, and how you applied that lesson. End with a success story showing growth from that experience." },
  { id: 5, question: "Why do you want to leave your current job?", answer: "Stay positive. 'I've learned a lot and value my time there, but I'm looking for new challenges where I can leverage my [specific skill] and grow further, which aligns perfectly with what [Target Company] offers.'" },
];

const STAR_STEPS = [
  { letter: "S", label: "Situation", sub: "Set the context" },
  { letter: "T", label: "Task",      sub: "Your responsibility" },
  { letter: "A", label: "Action",    sub: "Explain your steps" },
  { letter: "R", label: "Result",    sub: "Share outcomes" },
];

/* ─── small reusable accordion ─── */
const Accordion = ({ icon, title, children, id, active, onToggle }) => (
  <div className="border border-slate-700/60 rounded-xl overflow-hidden">
    <button
      onClick={() => onToggle(id)}
      className="w-full flex items-center justify-between p-4
                 bg-slate-800/60 hover:bg-slate-700/50 transition-colors"
    >
      <div className="flex items-center gap-3">
        <span className="text-xl">{icon}</span>
        <span className="font-semibold text-slate-200 text-sm">{title}</span>
      </div>
      {active ? <ChevronUp size={16} className="text-sky-400" /> : <ChevronDown size={16} className="text-slate-500" />}
    </button>
    {active && <div className="bg-slate-900/60 border-t border-slate-700/50">{children}</div>}
  </div>
);

/* ─── copy button ─── */
const CopyBtn = ({ text }) => {
  const [copied, setCopied] = useState(false);
  const handle = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handle}
      className="mt-3 flex items-center gap-1.5 text-xs font-medium
                 text-sky-400 hover:text-sky-300 transition-colors">
      {copied ? <><CheckCheck size={13} /> Copied!</> : <><Copy size={13} /> Copy answer</>}
    </button>
  );
};

/* ════════════════════ COMPONENT ════════════════════ */
const Preparation = () => {
  const [activeSection, setActiveSection]   = useState(null);
  const [selectedQuestion, setSelectedQuestion] = useState(null);

  const toggleSection  = (s) => setActiveSection(p => p === s ? null : s);
  const toggleQuestion = (id) => setSelectedQuestion(p => p === id ? null : id);

  return (
    <div className="min-h-screen bg-transparent text-white">

      {/* bg glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-sky-900/15 blur-3xl" />
        <div className="absolute top-1/2 right-0 w-[400px] h-[400px] rounded-full bg-blue-900/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-[500px] h-[300px] rounded-full bg-sky-900/10 blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">

        {/* ══ HEADER ══ */}
        <div className="text-center mb-14 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full
                          bg-sky-900/60 border border-sky-700 text-sky-300 text-xs font-semibold tracking-widest uppercase">
            <Mic size={12} /> Interview Mastery
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            MockVion
            <span className="bg-gradient-to-r from-sky-400 to-blue-400
                             bg-clip-text text-transparent"> Interview Mastery</span>
          </h1>

          <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto">
            Preparation tips to answer with structure, clarity, and unstoppable confidence.
          </p>

          <div className="flex flex-wrap justify-center gap-2 pt-1">
            {["✨ Confidence Builder", "🎯 STAR Method", "💪 Power Posing"].map(tag => (
              <span key={tag} className="px-3 py-1 rounded-full text-xs font-medium
                                        bg-sky-900/50 border border-sky-700/60 text-sky-300">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* ══ GRID ══ */}
        <div className="grid lg:grid-cols-2 gap-8">

          {/* ── LEFT ── */}
          <div className="space-y-6">

            {/* Tell me about yourself */}
            <div className="rounded-2xl border border-slate-700/60 bg-slate-900/60 overflow-hidden
                            shadow-xl shadow-black/30">
              <div className="bg-gradient-to-r from-sky-900 to-blue-900 px-6 py-5
                              border-b border-sky-800/50">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🗣️</span>
                  <div>
                    <h2 className="text-lg font-bold text-white">"Tell me about yourself"</h2>
                    <p className="text-sky-300 text-xs mt-0.5">Your 90-second elevator pitch to make a lasting impression</p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-3">
                {/* Formula accordion */}
                <Accordion id="formula" icon={tellMeAboutYourself.formula.icon}
                  title={tellMeAboutYourself.formula.title}
                  active={activeSection === 'formula'} onToggle={toggleSection}>
                  <div className="p-4 space-y-3">
                    {tellMeAboutYourself.formula.steps.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <span className="text-sky-500 font-bold text-sm mt-0.5 shrink-0">{idx + 1}.</span>
                        <p className="text-slate-300 text-sm leading-relaxed">{step}</p>
                      </div>
                    ))}
                  </div>
                </Accordion>

                {/* Sample script accordion */}
                <Accordion id="sample" icon={tellMeAboutYourself.sample.icon}
                  title={tellMeAboutYourself.sample.title}
                  active={activeSection === 'sample'} onToggle={toggleSection}>
                  <div className="p-4">
                    <p className="text-slate-300 text-sm italic leading-relaxed">
                      {tellMeAboutYourself.sample.text}
                    </p>
                    <CopyBtn text={tellMeAboutYourself.sample.text} />
                  </div>
                </Accordion>

                {/* Do's & Don'ts */}
                <div className="grid sm:grid-cols-2 gap-3 pt-1">
                  <div className="rounded-xl p-4 bg-emerald-950/40 border border-emerald-800/50">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-base">✅</span>
                      <h3 className="font-semibold text-emerald-400 text-sm">Do's</h3>
                    </div>
                    <ul className="space-y-2">
                      {tellMeAboutYourself.dos.map((item, idx) => (
                        <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                          <span className="text-emerald-500 mt-0.5 shrink-0">•</span>{item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-xl p-4 bg-red-950/40 border border-red-800/50">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-base">❌</span>
                      <h3 className="font-semibold text-red-400 text-sm">Don'ts</h3>
                    </div>
                    <ul className="space-y-2">
                      {tellMeAboutYourself.donts.map((item, idx) => (
                        <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                          <span className="text-red-500 mt-0.5 shrink-0">•</span>{item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Confidence Boosters */}
            <div className="rounded-2xl border border-slate-700/60 bg-slate-900/60 overflow-hidden
                            shadow-xl shadow-black/30">
              <div className="bg-gradient-to-r from-sky-900 to-blue-900 px-6 py-5
                              border-b border-sky-800/50">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">💪</span>
                  <div>
                    <h2 className="text-lg font-bold text-white">Answer with Confidence</h2>
                    <p className="text-sky-300 text-xs mt-0.5">Proven techniques to project authority and calm</p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="grid sm:grid-cols-2 gap-3">
                  {confidenceTips.map(tip => (
                    <div key={tip.id}
                      className="rounded-xl p-4 bg-slate-800/60 border border-slate-700/50
                                 hover:border-sky-700/50 hover:bg-slate-800/80 transition-all duration-200">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">{tip.icon}</span>
                        <h3 className="font-semibold text-sky-300 text-sm">{tip.title}</h3>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">{tip.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── RIGHT ── */}
          <div className="space-y-6">

            {/* Tough Questions */}
            <div className="rounded-2xl border border-slate-700/60 bg-slate-900/60 overflow-hidden
                            shadow-xl shadow-black/30">
              <div className="bg-gradient-to-r from-sky-900 to-blue-900 px-6 py-5
                              border-b border-sky-800/50">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🎯</span>
                  <div>
                    <h2 className="text-lg font-bold text-white">Tough Questions — Confident Answers</h2>
                    <p className="text-sky-300 text-xs mt-0.5">Master the STAR method and handle any curveball</p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-3">
                {toughQuestions.map(item => (
                  <div key={item.id} className="border border-slate-700/60 rounded-xl overflow-hidden">
                    <button
                      onClick={() => toggleQuestion(item.id)}
                      className="w-full flex items-center justify-between p-4
                                 bg-slate-800/40 hover:bg-slate-700/50 transition-colors"
                    >
                      <div className="flex items-center gap-3 text-left">
                        <span className="text-sky-500 font-bold text-sm shrink-0">Q{item.id}</span>
                        <h3 className="font-medium text-slate-200 text-sm">{item.question}</h3>
                      </div>
                      {selectedQuestion === item.id
                        ? <ChevronUp size={15} className="text-sky-400 shrink-0" />
                        : <ChevronDown size={15} className="text-slate-500 shrink-0" />}
                    </button>

                    {selectedQuestion === item.id && (
                      <div className="p-4 bg-sky-950/40 border-t border-sky-900/40">
                        <div className="flex items-start gap-2">
                          <span className="text-sky-500 font-bold text-sm shrink-0 mt-0.5">A:</span>
                          <p className="text-slate-300 text-sm leading-relaxed">{item.answer}</p>
                        </div>
                        <CopyBtn text={item.answer} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* STAR Method */}
            <div className="rounded-2xl border border-slate-700/60 bg-slate-900/60 p-6
                            shadow-xl shadow-black/30">
              <div className="flex items-center gap-3 mb-5">
                <span className="text-3xl">⭐</span>
                <div>
                  <h3 className="text-lg font-bold text-white">STAR Method</h3>
                  <p className="text-slate-400 text-xs">Your secret weapon for behavioral questions</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {STAR_STEPS.map(({ letter, label, sub }) => (
                  <div key={letter}
                    className="text-center p-4 rounded-xl bg-sky-950/60 border border-sky-800/50
                               hover:border-sky-600/50 transition-colors">
                    <div className="text-3xl font-extrabold text-sky-400 mb-1">{letter}</div>
                    <div className="text-xs font-semibold text-slate-200 mb-1">{label}</div>
                    <p className="text-xs text-slate-500">{sub}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-3 rounded-xl bg-sky-900/30 border border-sky-800/40">
                <p className="text-xs text-slate-300 leading-relaxed">
                  💡 <span className="font-semibold text-sky-300">Pro tip:</span>{" "}
                  Always quantify your results.{" "}
                  <span className="text-emerald-400">"Increased sales by 40%"</span>{" "}
                  beats <span className="text-slate-500">"did really well"</span>.
                </p>
              </div>
            </div>

            {/* Confidence Mantra */}
            <div className="rounded-2xl border border-sky-800/50
                            bg-gradient-to-br from-sky-950 via-slate-900 to-blue-950
                            p-8 text-center shadow-2xl shadow-sky-950/50 relative overflow-hidden">
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-60 h-60
                                rounded-full bg-sky-700/15 blur-3xl" />
              </div>
              <div className="relative space-y-3">
                <div className="text-4xl">🎤✨</div>
                <h3 className="text-lg font-bold text-white">Your Confidence Mantra</h3>
                <p className="text-sky-200 text-sm italic">
                  "I am prepared. I am capable. I belong here."
                </p>
                <div className="flex flex-wrap justify-center gap-3 text-xs text-sky-400 pt-1">
                  <span>💪 Power pose before entering</span>
                  <span className="text-slate-600">•</span>
                  <span>🐢 Speak slowly</span>
                  <span className="text-slate-600">•</span>
                  <span>⭐ Use STAR</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Preparation;