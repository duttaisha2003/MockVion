import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, AlertCircle } from "lucide-react";

const RecruiterShortlistedCandidates = () => {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { jobId } = useParams();

  useEffect(() => {
    const fetchShortlisted = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}api/recruiter/job/${jobId}/shortlisted`,
          { withCredentials: true }
        );
        if (res.data.success) setApplicants(res.data.applicants);
      } catch (err) {
        setError("Failed to load shortlisted candidates");
      } finally {
        setLoading(false);
      }
    };
    fetchShortlisted();
  }, [jobId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Loading shortlisted candidates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent text-white px-6 py-12">
      <div className="max-w-5xl mx-auto">

        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition mb-8 text-sm"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <h1 className="text-2xl font-bold mb-1">Shortlisted Candidates</h1>
        <p className="text-sm text-gray-400 mb-8">
          Job ID: <span className="text-sky-400 font-mono">{jobId}</span>
        </p>

        {error && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-4 py-3 mb-6 text-sm">
            <AlertCircle size={15} />
            {error}
          </div>
        )}

        {applicants.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64">
            <p className="text-gray-500">No shortlisted candidates yet.</p>
          </div>
        ) : (
          <div className="rounded-xl overflow-hidden border border-gray-800">
            <div className="overflow-x-auto">
              <table className="w-full" style={{ borderCollapse: "collapse" }}>
                <thead>
                  <tr className="bg-gray-900 border-b border-gray-800">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-400">#</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-400">Candidate</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-400">Email</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-400">Status</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-400">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {applicants.map((candidate, idx) => (
                    <tr
                      key={candidate.applicationId}
                      className="border-b border-gray-800"
                      style={{ background: idx % 2 === 0 ? "#0f1117" : "#111827" }}
                    >
                      <td className="px-4 py-3 text-sm text-gray-500">{idx + 1}</td>
                      <td className="px-4 py-3 text-sm font-medium text-white">
                        {candidate.candidateName}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-400">{candidate.email}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded text-xs font-semibold bg-green-500/10 text-green-400 border border-green-500/25">
                          shortlisted
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          {candidate.resultId && (
                            <button
                              onClick={() => navigate(`/performance/${candidate.resultId}`)}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-green-700 hover:bg-green-600 transition"
                            >
                              Performance
                            </button>
                          )}
                          {candidate.resumeId && (
                            <button
                              onClick={() => navigate(`/resume/${candidate.resumeId}`)}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-sky-700 hover:bg-sky-600 transition"
                            >
                              Resume
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecruiterShortlistedCandidates;