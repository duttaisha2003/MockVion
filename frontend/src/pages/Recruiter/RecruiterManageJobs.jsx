import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Edit, Eye, XCircle } from "lucide-react";

const RecruiterManageJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchJobs = async () => {
    try {
      const res = await axios.get("/api/jobs/recruiter", {
        withCredentials: true,
      });
      setJobs(res.data.jobs);
    } catch (err) {
      setError("Failed to load job posts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const closeJob = async (jobId) => {
    if (!window.confirm("Are you sure you want to close this job?")) return;

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

  if (loading) return null;

  return (
    <div className="min-h-screen bg-black text-white px-6 py-12">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Manage Job Posts</h1>

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
                <th className="p-4">Job Title</th>
                <th className="p-4">Location</th>
                <th className="p-4">Applicants</th>
                <th className="p-4">Status</th>
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
                    <td className="p-4 font-medium">
                      {job.title}
                    </td>

                    <td className="p-4 text-gray-400">
                      {job.location}
                    </td>

                    <td className="p-4">
                      {job.applicantsCount || 0}
                    </td>

                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          job.status === "active"
                            ? "bg-green-600/20 text-green-400"
                            : "bg-red-600/20 text-red-400"
                        }`}
                      >
                        {job.status}
                      </span>
                    </td>

                    <td className="p-4 flex gap-3">
                      <Link
                        to={`/jobs/${job._id}`}
                        className="text-sky-400 hover:text-sky-300"
                        title="View"
                      >
                        <Eye size={18} />
                      </Link>

                      <Link
                        to={`/jobs/edit/${job._id}`}
                        className="text-yellow-400 hover:text-yellow-300"
                        title="Edit"
                      >
                        <Edit size={18} />
                      </Link>

                      {job.status === "active" && (
                        <button
                          onClick={() => closeJob(job._id)}
                          className="text-red-400 hover:text-red-300"
                          title="Close Job"
                        >
                          <XCircle size={18} />
                        </button>
                      )}
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