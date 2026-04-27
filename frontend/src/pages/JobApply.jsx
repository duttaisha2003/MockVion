import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const JobApply = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const data = location.state?.matchData;

  if (!data) {
    return (
      <div className="text-white p-10">
        No data found
      </div>
    );
  }

  const {
    matchPercentage,
    matchedSkills,
    totalSkills,
    canApply,
  } = data;

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      
      <div className="bg-gray-900 p-8 rounded-2xl w-full max-w-lg border border-gray-800">

        {/* 🔥 Title */}
        <h1 className="text-2xl font-bold mb-6 text-center">
          Job Eligibility Check
        </h1>

        {/* 📊 Match Percentage */}
        <div className="text-center mb-6">
          <p className="text-gray-400 mb-2">Skill Match</p>

          <h2 className="text-5xl font-bold text-sky-400">
            {matchPercentage}%
          </h2>

          <p className="text-sm text-gray-500 mt-2">
            {matchedSkills} / {totalSkills} skills matched
          </p>
        </div>

        {/* ✅ Eligibility */}
        <div className="text-center mb-6">
          {canApply ? (
            <p className="text-green-400 font-semibold text-lg">
              ✅ Eligible to Apply
            </p>
          ) : (
            <p className="text-red-400 font-semibold text-lg">
              ❌ Not Eligible (Min 70% required)
            </p>
          )}
        </div>

        {/* 🚀 Buttons */}
        <div className="flex gap-4">

          {/* Back */}
          <button
            onClick={() => navigate(-1)}
            className="w-1/2 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg"
          >
            Go Back
          </button>

          {/* Apply */}
          <button
            disabled={!canApply}
            className={`w-1/2 px-4 py-2 rounded-lg ${
              canApply
                ? "bg-green-600 hover:bg-green-700"
                : "bg-gray-600 cursor-not-allowed"
            }`}
            onClick={() =>
              alert("Final Apply API call here 🚀")
            }
          >
            Apply Now
          </button>

        </div>
      </div>
    </div>
  );
};

export default JobApply;