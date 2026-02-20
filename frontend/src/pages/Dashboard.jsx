import React from 'react';
import { Link } from "react-router-dom";

const Dashboard = () => {

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
     
      
      {/* ================= HERO ================= */}
      <section className="bg-black py-16">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 items-center gap-12">
          
          {/* Text */}
          <div className="space-y-5">
            <h1 className="text-4xl lg:text-5xl font-extrabold text-white leading-tight">
              Your  interview partner 
              <span className="block text-sky-600">
                 powered by AI
              </span>
            </h1>
            <p className="text-gray-300 text-lg max-w-xl">
              Personalized mock interviews built from your resume.
              Real questions. Instant feedback. Smarter improvement.</p>
             <p className="text-gray-300 text-lg max-w-xl">
             Think sharper. Answer stronger. Stand out instantly.
              Simulate the pressure. Sharpen your edge. Secure the role.</p>
         
             <p className="text-gray-300 text-lg max-w-xl">
            Upgrade your preparation. Upgrade your outcomes.
            A smarter way to prepare for high-stakes opportunities.</p>
            <Link
              to="/login"
              className="inline-block bg-sky-600 text-white px-7 py-3 rounded-full font-semibold hover:bg-sky-700 transition"
            >
              Start Interview
            </Link>
          </div>

          {/* Image */}
          <div className="flex justify-center">
            <img
              src="https://cdn.vectorstock.com/i/500p/61/20/ai-agent-bot-flying-out-of-digital-laptop-robot-vector-57836120.jpg"
              alt="AI Interview"
              className="rounded-xl shadow-lg max-w-lg "
            />
          </div>
        </div>
      </section>

      {/* ================= INTERVIEW CTA SECTION ================= */}
      <section className="bg-black py-14">
        <div className="max-w-4xl mx-auto text-center px-6 space-y-4">
          <h2 className="text-3xl font-bold text-white">
            Ready for Your Mock Interview?
          </h2>
          <p className="text-gray-400 text-lg">
            Practice real interview questions, get instant AI feedback, and
            track your improvement after every session.
          </p>

          <Link
            to="/interviewstage"
            className="inline-block mt-4 bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Start Interview
          </Link>
        </div>
      </section>

      
    </div>
  );
 
};

export default Dashboard;