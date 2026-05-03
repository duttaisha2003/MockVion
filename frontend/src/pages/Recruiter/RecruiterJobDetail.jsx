import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Briefcase,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle2,
  Building2,
  Globe,
  AlertCircle,
} from "lucide-react";

const RecruiterJobDetail = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}api/recruiter/job/${jobId}`,
          { withCredentials: true }
        );
        setJob(res.data.job);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load job details");
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [jobId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-center">
          <AlertCircle size={36} className="text-red-400" />
          <p className="text-white font-semibold text-lg">Job not found</p>
          <p className="text-gray-400 text-sm">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 text-sky-400 hover:text-sky-300 text-sm flex items-center gap-1"
          >
            <ArrowLeft size={15} /> Go back
          </button>
        </div>
      </div>
    );
  }

  const isExpired = new Date(job.lastDate) < new Date();

  return (
    <div className="min-h-screen bg-transparent text-white px-6 py-12">
      <div className="max-w-3xl mx-auto">

        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition mb-8 text-sm"
        >
          <ArrowLeft size={16} />
          Back to Manage Jobs
        </button>

        {/* Header */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 mb-6">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white leading-tight mb-1">
                {job.title}
              </h1>
              <p className="text-gray-500 text-xs font-mono">{job.jobId}</p>
            </div>
            <span
              className={`shrink-0 px-3 py-1 rounded-full text-xs font-semibold ${
                isExpired
                  ? "bg-red-500/15 text-red-400 border border-red-500/25"
                  : "bg-green-500/15 text-green-400 border border-green-500/25"
              }`}
            >
              {isExpired ? "Expired" : "Active"}
            </span>
          </div>

          {/* Company info */}
          {job.postedBy && (
            <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-6 pb-6 border-b border-gray-800">
              {job.postedBy.companyName && (
                <span className="flex items-center gap-1.5">
                  <Building2 size={14} className="text-gray-500" />
                  {job.postedBy.companyName}
                </span>
              )}
              {job.postedBy.companyWebsite && (
                
                  <a href={job.postedBy.companyWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sky-400 hover:text-sky-300 transition"
                >
                  <Globe size={14} />
                  {job.postedBy.companyWebsite}
                </a>
              )}
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-gray-800/60 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                <Briefcase size={11} /> Experience
              </p>
              <p className="text-white font-semibold text-sm">
                {job.experienceRequired?.min ?? 0}–
                {job.experienceRequired?.max ?? "∞"} yrs
              </p>
            </div>

            <div className="bg-gray-800/60 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                <DollarSign size={11} /> Salary
              </p>
              <p className="text-white font-semibold text-sm">
                {job.salary?.min && job.salary?.max
                  ? `${job.salary.currency || "INR"} ${(job.salary.min / 100000).toFixed(1)}L – ${(job.salary.max / 100000).toFixed(1)}L`
                  : "Not disclosed"}
              </p>
            </div>

            <div className="bg-gray-800/60 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                <Calendar size={11} /> Last Date
              </p>
              <p className={`font-semibold text-sm ${isExpired ? "text-red-400" : "text-white"}`}>
                {new Date(job.lastDate).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>

            <div className="bg-gray-800/60 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                <Clock size={11} /> Posted
              </p>
              <p className="text-white font-semibold text-sm">
                {new Date(job.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 mb-6">
          <h2 className="text-lg font-semibold mb-4">Job Description</h2>
          <p className="text-gray-300 leading-relaxed whitespace-pre-line text-sm">
            {job.description}
          </p>
        </div>

        {/* Skills */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 mb-8">
          <h2 className="text-lg font-semibold mb-4">Skills Required</h2>
          <div className="flex flex-wrap gap-2">
            {(job.skillsRequired || []).map((skill, i) => (
              <span
                key={i}
                className="flex items-center gap-1.5 bg-sky-500/10 border border-sky-500/25 text-sky-400 px-3 py-1.5 rounded-full text-sm capitalize"
              >
                <CheckCircle2 size={12} />
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Edit button for recruiter */}
        <button
          onClick={() => navigate(`/recruiter/jobs/edit/${jobId}`)}
          className="w-full bg-sky-600 hover:bg-sky-500 transition py-4 rounded-xl font-semibold text-white text-base"
        >
          Edit Job
        </button>

      </div>
    </div>
  );
};

export default RecruiterJobDetail;