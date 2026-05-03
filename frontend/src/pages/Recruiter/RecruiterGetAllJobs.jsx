import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Edit, Eye, XCircle } from "lucide-react";

const RecruiterManageJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}api/recruiter/get-all-job`,{
          withCredentials: true, 
        });
       
        setJobs(res.data.jobs);
      } catch (err) {
        setError("Failed to load job posts");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const closeJob = async (jobId) => {
    if (!window.confirm("Close this job?")) return;

    try {
      await axios.patch(
        `/api/jobs/${jobId}/close`,
        {},
        { withCredentials: true }
      );

      setJobs((prev) =>
        prev.map((job) =>
          job._id === jobId ? { ...job, status: "closed" } : job
        )
      );
    } catch (err) {
      alert("Failed to close job");
    }
  };

  if (loading) {
    return (
      <div className="text-white text-center mt-20">Loading jobs...</div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent text-white px-6 py-12">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Get All Job Posts</h1>

          <Link
            to="/create-job"
            className="bg-sky-600 hover:bg-sky-700 px-6 py-2 rounded-lg font-semibold"
          >
            + Add Job
          </Link>
        </div>

        {/* Error */}
        {error && (
          <p className="text-red-500 mb-4">{error}</p>
        )}

        {/* Table */}
        <div className="overflow-x-auto bg-gray-900 rounded-xl border border-gray-800">
          <table className="w-full text-left">
            <thead className="bg-gray-800 text-gray-300">
              <tr>
                <th className="p-4">Title</th>
                <th className="p-4">Experience</th>
                <th className="p-4">Skills</th>
                <th className="p-4">Created</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>

            <tbody>
              {jobs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-6 text-center text-gray-400">
                    No job posts created yet
                  </td>
                </tr>
              ) : (
                jobs.map((job) => (
                  <tr
                    key={job._id}
                    className="border-t border-gray-800 hover:bg-gray-800 transition"
                  >
                    {/* Title */}
                    <td className="p-4 font-medium">{job.title}</td>

                    {/* Experience */}
                    <td className="p-4 text-gray-400">
                      {job.experienceRequired?.min || 0} -{" "}
                      {job.experienceRequired?.max || "∞"} yrs
                    </td>

                    {/* Skills */}
                    <td className="p-4">
                      <div className="flex flex-wrap gap-2">
                        {job.skillsRequired.map((skill, i) => (
                          <span
                            key={i}
                            className="bg-gray-800 px-2 py-1 rounded text-sm"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Created */}
                    <td className="p-4 text-gray-400">
                      {new Date(job.createdAt).toLocaleDateString()}
                    </td>

                    {/* Actions */}
                    <td className="p-4 flex gap-3">
                      <Link
                        to={`/recruiter/jobs/${job.jobId}`}
                        className="text-sky-400 hover:text-sky-300"
                      >
                        <Eye size={18} />
                      </Link>

                      <Link
                        to={`/recruiter/jobs/edit/${job.jobId}`}
                        className="text-yellow-400 hover:text-yellow-300"
                      >
                        <Edit size={18} />
                      </Link>

                      
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RecruiterManageJobs;