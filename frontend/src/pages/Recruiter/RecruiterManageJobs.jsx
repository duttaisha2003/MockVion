import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Edit, Eye, Trash2, Briefcase, Plus, AlertCircle } from "lucide-react";

const RecruiterManageJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const fetchJobs = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}api/recruiter/get-all-job`,
        { withCredentials: true }
      );
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

  const deleteJob = async (jobId) => {
    if (!window.confirm("Are you sure you want to permanently delete this job?")) return;

    setDeletingId(jobId);
    try {
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}api/recruiter/job/${jobId}`,
        { withCredentials: true }
      );
      setJobs((prev) => prev.filter((job) => job.jobId !== jobId));
    } catch (err) {
      alert("Failed to delete job. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Loading jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent text-white px-6 py-12">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Manage Job Posts</h1>
            <p className="text-gray-400 mt-1 text-sm">
              {jobs.length} {jobs.length === 1 ? "job" : "jobs"} posted
            </p>
          </div>

          <Link
            to="/create-job"
            className="flex items-center gap-2 bg-sky-600 hover:bg-sky-500 transition px-5 py-2.5 rounded-lg font-semibold text-sm"
          >
            <Plus size={16} />
            Add Job
          </Link>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3 mb-6">
            <AlertCircle size={16} />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Empty state */}
        {jobs.length === 0 && !error ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Briefcase size={40} className="text-gray-700 mb-4" />
            <p className="text-gray-400 text-lg font-medium">No job posts yet</p>
            <p className="text-gray-600 text-sm mt-1 mb-6">Create your first job to start receiving applications</p>
            <Link
              to="/create-job"
              className="flex items-center gap-2 bg-sky-600 hover:bg-sky-500 transition px-5 py-2.5 rounded-lg font-semibold text-sm"
            >
              <Plus size={16} />
              Add Job
            </Link>
          </div>
        ) : (
          /* Table */
          <div className="overflow-x-auto bg-gray-900 rounded-xl border border-gray-800">
            <table className="w-full text-left">
              <thead className="bg-gray-800/80 text-gray-400 text-sm uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-4 font-medium">Title</th>
                  <th className="px-5 py-4 font-medium">Experience</th>
                  <th className="px-5 py-4 font-medium">Skills</th>
                  <th className="px-5 py-4 font-medium">Last Date</th>
                  <th className="px-5 py-4 font-medium">Posted</th>
                  <th className="px-5 py-4 font-medium">Actions</th>
                </tr>
              </thead>

              <tbody>
                {jobs.map((job) => (
                  <tr
                    key={job._id}
                    className="border-t border-gray-800 hover:bg-gray-800/50 transition-colors"
                  >
                    {/* Title */}
                    <td className="px-5 py-4">
                      <p className="font-semibold text-white">{job.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{job.jobId}</p>
                    </td>

                    {/* Experience */}
                    <td className="px-5 py-4 text-gray-400 text-sm">
                      {job.experienceRequired?.min ?? 0}–
                      {job.experienceRequired?.max ?? "∞"} yrs
                    </td>

                    {/* Skills */}
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1.5 max-w-xs">
                        {(job.skillsRequired || []).slice(0, 3).map((skill, i) => (
                          <span
                            key={i}
                            className="bg-gray-800 border border-gray-700 px-2 py-0.5 rounded text-xs text-gray-300 capitalize"
                          >
                            {skill}
                          </span>
                        ))}
                        {job.skillsRequired?.length > 3 && (
                          <span className="text-xs text-gray-500 py-0.5">
                            +{job.skillsRequired.length - 3} more
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Last Date */}
                    <td className="px-5 py-4 text-sm text-gray-400">
                      {job.lastDate
                        ? new Date(job.lastDate).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "—"}
                    </td>

                    {/* Posted */}
                    <td className="px-5 py-4 text-sm text-gray-400">
                      {new Date(job.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <Link
                          to={`/recruiter/jobs/${job.jobId}`}
                          className="text-sky-400 hover:text-sky-300 transition-colors"
                          title="View"
                        >
                          <Eye size={17} />
                        </Link>

                        <Link
                          to={`/recruiter/jobs/edit/${job.jobId}`}
                          className="text-yellow-400 hover:text-yellow-300 transition-colors"
                          title="Edit"
                        >
                          <Edit size={17} />
                        </Link>

                        <button
                          onClick={() => deleteJob(job.jobId)}
                          disabled={deletingId === job.jobId}
                          className="text-red-400 hover:text-red-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                          title="Delete"
                        >
                          {deletingId === job.jobId ? (
                            <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Trash2 size={17} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecruiterManageJobs;