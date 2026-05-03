// ViewCandidates.jsx

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Users, Briefcase } from "lucide-react";
import { useNavigate } from "react-router-dom";

const RecruiterViewCandidates = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const fetchJobsWithApplicants = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}api/recruiter/jobs-with-applicants`,
        {
          withCredentials: true, 
        }
      );

      if (res.data.success) {
        setJobs(res.data.jobs);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobsWithApplicants();
  }, []);

  const handleOpenApplicants = (jobId) => {console.log("bye",jobId)
    navigate(`/recruiter-performance/${jobId}`);
  };

  return (
    <div className="min-h-screen max-w-6xl bg-transparent mx-auto text-white p-8">
      <h1 className="text-3xl font-bold mb-2">View Candidates</h1>

      <p className="text-gray-400 mb-8">
        See all jobs and how many candidates applied
      </p>

      {loading ? (
        <p>Loading jobs...</p>
      ) : jobs.length === 0 ? (
        <p>No jobs found.</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <div
              key={job.jobId}
              className="bg-[#0B1220] border border-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition"
            >
              <div className="flex items-center justify-between mb-5">
                <div className="p-3 rounded-xl bg-blue-500/10">
                  <Briefcase
                    className="text-blue-400"
                    size={22}
                  />
                </div>

                <span className="text-sm px-3 py-1 rounded-full bg-blue-500/10 text-blue-300">
                  {job.totalApplicants} Applied
                </span>
              </div>

              <h2 className="text-xl font-semibold mb-2">
                {job.jobTitle}
              </h2>

              <p className="text-gray-400 text-sm mb-6">
                Job ID: {job.jobId}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-300">
                  <Users size={18} />
                  <span>
                    {job.totalApplicants} Candidates
                  </span>
                </div>

                <button
                  onClick={() =>
                    handleOpenApplicants(job.jobId)
                  }
                  className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-600 transition font-medium"
                >
                  View Applicants
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecruiterViewCandidates;