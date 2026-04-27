import React from 'react';
import { Link } from "react-router-dom";

const Dashboard = () => {

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
     
      
      {/* ================= HERO ================= */}
      <section className="bg-black py-20">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">

          {/* Left Content */}
          <div className="space-y-6">
            <h2 className="text-4xl font-bold text-white">
              Hiring the Right Candidate
              <span className="block text-sky-500">
                Starts with Better Interviews
              </span>
            </h2>

            <p className="text-gray-400 text-lg">
              Use MockVion's AI-powered interview system to evaluate
              candidates based on real interview performance.
              Recruiters can analyze responses, view AI scoring,
              and identify top talent faster.
            </p>

            <ul className="space-y-2 text-gray-300">
              <li>✔ AI scored interview performance</li>
              <li>✔ Resume-based candidate evaluation</li>
              <li>✔ Detailed skill breakdown</li>
            </ul>

            <Link
              to="/recruiter-login"
              className="inline-block mt-4 px-8 py-3 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg transition"
            >
              Recruiter Login
            </Link>
          </div>

          {/* Right Illustration */}
          <div className="flex justify-center">
            <img
              src="https://glider.ai/wp-content/uploads/Screen-Shot-2023-09-07-at-4.05.50-AM.png"
              alt="Recruiter Dashboard"
              className="w-106 h-86 rounded-lg "
            />
          </div>

        </div>
      </section>
    </div>
  );
 
};

export default Dashboard;