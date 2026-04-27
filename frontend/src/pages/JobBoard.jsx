

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const JobBoard = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [appliedJobs, setAppliedJobs] = useState(new Set()); // ✅ track applied jobs
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    minExperience: "",
    maxExperience: "",
    role: "",
  });
const fetchJobs = async () => {
  try {
    setLoading(true);
    setAppliedJobs(new Set()); // reset old applied state

    const res = await axios.get(
      `${import.meta.env.VITE_BACKEND_URL}api/auth/matched-jobs`,
      {
        params: filters,
        withCredentials: true
      }
    );

    const fetchedJobs = res.data?.matches || [];
    setJobs(fetchedJobs);

    await fetchAppliedJobs(fetchedJobs);

  } catch (error) {
    console.log(error);
  } finally {
    setLoading(false);
  }
};
const fetchAppliedJobs = async (jobsList) => {
  try {
    const appliedChecks = await Promise.all(
      jobsList.map(async (job) => {
        try {
          const res = await axios.get(
            `${import.meta.env.VITE_BACKEND_URL}api/interview/check-applied/${job.jobId}`,
            {
              withCredentials: true
            }
          );
          return res.data.applied ? job.jobId : null;

        } catch (error) {
          console.log(error);
          return null;
        }
      })
    );
    const appliedSet = new Set(appliedChecks.filter(Boolean));
    setAppliedJobs(appliedSet);

  } catch (error) {
    console.log(error);
  }
};
  // const fetchJobs = async () => {
  //   try {
  //     setLoading(true);
  //     const res = await axios.get(
  //       `${import.meta.env.VITE_BACKEND_URL}api/auth/matched-jobs`,
  //       { params: filters, withCredentials: true }
  //     );
  //     const fetchedJobs = res.data?.matches || [];
  //     setJobs(fetchedJobs);
  //     console.log(fetchedJobs);
  //     // ✅ Check which jobs user has already applied to
  //     const appliedChecks = await Promise.all(
  //       fetchedJobs.map((job) =>
  //         axios.get(
  //           `${import.meta.env.VITE_BACKEND_URL}api/interview/check-applied/${job.jobId}`,
  //           { withCredentials: true }
  //         ).then(r => r.data.applied ? job.jobId : null)
  //          .catch(() => null)
  //       )
  //     );
  //     setAppliedJobs(new Set(appliedChecks.filter(Boolean)));

  //   } catch (err) {
  //     console.error("Fetch Jobs Error:", err);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // ✅ Just navigate to interview stage, nothing else
  const handleApplyClick = (jobId) => {
    navigate(`/interviewstage/${jobId}`);
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-transparent text-white px-6 py-10">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">AI Matched Jobs</h1>

        {/* FILTERS */}
        <div className="bg-gray-900 p-4 rounded-xl mb-8 flex flex-wrap gap-4">
          <input type="number" name="minExperience" placeholder="Min Exp"
            value={filters.minExperience} onChange={handleChange}
            className="bg-gray-800 px-4 py-2 rounded w-32" />
          <input type="number" name="maxExperience" placeholder="Max Exp"
            value={filters.maxExperience} onChange={handleChange}
            className="bg-gray-800 px-4 py-2 rounded w-32" />
          <input type="text" name="role" placeholder="Role"
            value={filters.role} onChange={handleChange}
            className="bg-gray-800 px-4 py-2 rounded flex-1" />
          <button onClick={fetchJobs} className="bg-sky-600 hover:bg-sky-700 px-6 py-2 rounded-lg">
            Search
          </button>
        </div>

        {loading && <p>Loading jobs...</p>}
        {!loading && jobs.length === 0 && <p className="text-gray-400">No jobs found</p>}

        {/* JOB LIST */}
          <div className="grid md:grid-cols-2 gap-6">
            {jobs
              .filter((job) => {
                // ✅ show only jobs whose last date is not expired
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                const jobLastDate = new Date(job.lastDate);
                jobLastDate.setHours(0, 0, 0, 0);

                return jobLastDate >= today;
              })
              .map((job) => {
                const isApplied = appliedJobs.has(job.jobId);

                return (
                  <div
                    key={job.jobId}
                    className="bg-transparent p-6 rounded-xl border border-gray-600 hover:border-sky-500 transition"
                  >
                    {/* Job Title */}
                    <h2 className="text-xl font-semibold mb-2">
                      {job.title}
                    </h2>

                    {/* Job ID */}
                    <p className="text-gray-400 text-sm mb-2">
                      {job.jobId}
                    </p>

                    {/* Match Score */}
                    <p className="text-green-400 font-semibold mb-3">
                      Match: {job.matchScore}%
                    </p>

                    {/* Experience */}
                    <p className="text-blue-400 text-sm mb-2">
                       Experience:{" "}
                      {job.experienceRequired
                        ? `${job.experienceRequired.min} - ${job.experienceRequired.max} Years`
                        : "Not specified"}
                    </p>

                    {/* Salary */}
                    <p className="text-yellow-400 text-sm mb-2">
                       Salary:{" "}
                      {job.salary
                        ? `₹${job.salary.min} - ₹${job.salary.max} ${job.salary.currency || ""}`
                        : "Not specified"}
                    </p>

                    {/* Last Date */}
                    <p className="text-red-400 text-sm mb-3">
                       Last Date:{" "}
                      {job.lastDate
                        ? new Date(job.lastDate).toLocaleDateString("en-GB")
                        : "Not specified"}
                    </p>

                    {/* Skills */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {job.skillsRequired?.length > 0 ? (
                        job.skillsRequired.map((skill, index) => (
                          <span
                            key={index}
                            className="bg-gray-800 px-2 py-1 rounded text-sm"
                          >
                            {skill}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-500 text-sm">
                          No skills listed
                        </span>
                      )}
                    </div>

                    {/* Apply Button */}
                    <button
                      onClick={() => handleApplyClick(job.jobId)}
                      disabled={isApplied || !job.canApply}
                      className={`px-4 py-2 rounded-lg w-full ${
                        isApplied
                          ? "bg-blue-700 cursor-not-allowed"
                          : job.canApply
                          ? "bg-green-600 hover:bg-green-700"
                          : "bg-gray-700 cursor-not-allowed"
                      }`}
                    >
                      {isApplied
                        ? "Applied"
                        : job.canApply
                        ? "Apply Now"
                        : "Not Eligible"}
                    </button>
                  </div>
                );
              })}
          </div>
      </div>
    </div>
  );
};

export default JobBoard;