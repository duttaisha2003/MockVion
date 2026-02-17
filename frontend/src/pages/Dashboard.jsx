import React from 'react';
import { Link } from "react-router-dom";

const Dashboard = () => {

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
     
      
      {/* ================= HERO ================= */}
      <section className="bg-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 items-center gap-12">
          
          {/* Text */}
          <div className="space-y-5">
            <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-800">
              Prepare Smarter.{" "}
              <span className="text-sky-700">Interview Better.</span>
            </h1>
            <p className="text-gray-600 text-lg">
              AI-driven mock interviews designed to boost your confidence and
              real interview performance.
            </p>

            <Link
              to="/upload"
              className="inline-block bg-sky-600 text-white px-7 py-3 rounded-full font-semibold hover:bg-sky-700 transition"
            >
              Start Interview
            </Link>
          </div>

          {/* Image */}
          <div className="flex justify-center">
            <img
              src="https://www.shutterstock.com/image-vector/artificial-intelligence-robot-modern-technology-600nw-2613162515.jpg"
              alt="AI Interview"
              className="rounded-xl shadow-lg max-w-lg"
            />
          </div>
        </div>
      </section>

      {/* ================= INTERVIEW CTA SECTION ================= */}
      <section className="bg-white py-14">
        <div className="max-w-4xl mx-auto text-center px-6 space-y-4">
          <h2 className="text-3xl font-bold text-gray-800">
            Ready for Your Mock Interview?
          </h2>
          <p className="text-gray-600 text-lg">
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