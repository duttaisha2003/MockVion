import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

const RecruiterApplicants = () => {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [shortlisting, setShortlisting] = useState({});
  const [rejecting, setRejecting] = useState({});

  const navigate = useNavigate();
  const { jobId } = useParams();

  useEffect(() => {
    fetchApplicants();
  }, []);

  const fetchApplicants = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}api/recruiter/job/${jobId}/applicants`,
        { withCredentials: true }
      );
      if (res.data.success) setApplicants(res.data.applicants);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleShowPerformance = (resultId) => {
    navigate(`/performance/${resultId}`);
  };

  const handleShortlist = async (applicationId) => {
  try {
    setShortlisting((prev) => ({ ...prev, [applicationId]: true }));
    const res = await axios.patch(
      `${import.meta.env.VITE_BACKEND_URL}api/recruiter/application/${applicationId}/status`,
      { status: "shortlisted" },  // ✅ send status in body
      { withCredentials: true }
    );
    if (res.data.application) {
      setApplicants((prev) =>
        prev.map((a) =>
          a.applicationId === applicationId ? { ...a, status: "shortlisted" } : a
        )
      );
    }
  } catch (error) {
    console.log(error);
    alert("Failed to shortlist candidate");
  } finally {
    setShortlisting((prev) => ({ ...prev, [applicationId]: false }));
  }
};

const handleReject = async (applicationId) => {
  try {
    setRejecting((prev) => ({ ...prev, [applicationId]: true }));
    const res = await axios.patch(
      `${import.meta.env.VITE_BACKEND_URL}api/recruiter/application/${applicationId}/status`,
      { status: "rejected" },  // ✅ send status in body
      { withCredentials: true }
    );
    if (res.data.application) {
      setApplicants((prev) =>
        prev.map((a) =>
          a.applicationId === applicationId ? { ...a, status: "rejected" } : a
        )
      );
    }
  } catch (error) {
    console.log(error);
    alert("Failed to reject candidate");
  } finally {
    setRejecting((prev) => ({ ...prev, [applicationId]: false }));
  }
};

  const statusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case "shortlisted": return { background: "#052e16", color: "#86efac", border: "1px solid #166534" };
      case "applied":     return { background: "#1e3a5f", color: "#93c5fd", border: "1px solid #1d4ed8" };
      case "rejected":    return { background: "#1f0a0a", color: "#fca5a5", border: "1px solid #7f1d1d" };
      default:            return { background: "#1f2937", color: "#9ca3af", border: "1px solid #374151" };
    }
  };

  const isLocked = (status) =>
    status?.toLowerCase() === "shortlisted" || status?.toLowerCase() === "rejected";

  return (
    <div className="min-h-[calc(100vh-80px)] p-4 m-9 sm:p-6 bg-transparent text-white">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold mb-1" style={{ color: "#f9fafb" }}>
          Applicants
        </h1>
        <p className="text-sm" style={{ color: "#6b7280" }}>
          Job ID: <span style={{ color: "#93c5fd" }}>{jobId}</span>
        </p>
      </div>

      {/* States */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <p style={{ color: "#6b7280" }}>Loading applicants…</p>
        </div>
      ) : applicants.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <p style={{ color: "#6b7280" }}>No applicants found.</p>
        </div>
      ) : (
        <div
          className="rounded-xl overflow-hidden "
          style={{ border: "1px solid #1f2937" }}
        >
          <div className="overflow-x-auto">
            <table
              className="w-full"
              style={{ tableLayout: "auto", borderCollapse: "collapse" }}
            >
              <thead>
                <tr style={{ background: "#111827", borderBottom: "1px solid #1f2937" }}>
                  <th className="px-3 py-3 text-left text-lg font-semibold whitespace-nowrap" style={{ color: "#6b7280" }}>Candidate</th>
                  <th className="px-3 py-3 text-left text-lg font-semibold whitespace-nowrap" style={{ color: "#6b7280" }}>Email</th>
                  <th className="px-3 py-3 text-left text-lg font-semibold whitespace-nowrap" style={{ color: "#6b7280" }}>Score</th>
                  <th className="px-7 py-3 text-left text-lg font-semibold whitespace-nowrap" style={{ color: "#6b7280" }}>Status</th>
                  <th className="px-3 py-3 text-center text-lg font-semibold whitespace-nowrap" style={{ color: "#6b7280" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {applicants.map((candidate, idx) => (
                  <tr
                    key={candidate.applicationId}
                    style={{
                      background: idx % 2 === 0 ? "#0f1117" : "#111827",
                      borderBottom: "1px solid #1f2937",
                    }}
                  >
                    <td className="px-3 py-3 text-lg font-medium whitespace-nowrap" style={{ color: "#f9fafb" }}>
                      {candidate.candidateName}
                    </td>
                    <td className="px-3 py-3 text-lg whitespace-nowrap" style={{ color: "#9ca3af" }}>
                      {candidate.email}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <span className="text-lg font-bold" style={{ color: "#f9fafb" }}>
                        {candidate.interviewScore ?? "—"}
                      </span>
                    </td>
                    <td className="px-7 py-3 whitespace-nowrap">
                      <span
                        className="px-2 py-0.5 rounded text-lg font-semibold"
                        style={statusStyle(candidate.status)}
                      >
                        {candidate.status}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center justify-center gap-2 flex-nowrap text-xl">

                        {/* Show Performance */}
                        <button
                          onClick={() => handleShowPerformance(candidate.resultId)}
                          className="px-2.5 py-1.5 rounded-lg text-lg font-semibold text-white whitespace-nowrap"
                          style={{ background: "#16a34a" }}
                        >
                          Performance
                        </button>

                        {/* Shortlist */}
                        <button
                          onClick={() => handleShortlist(candidate.applicationId)}
                          disabled={shortlisting[candidate.applicationId] || isLocked(candidate.status)}
                          className="px-2.5 py-1.5 rounded-lg text-lg font-semibold whitespace-nowrap"
                          style={{
                            background:
                              candidate.status?.toLowerCase() === "shortlisted"
                                ? "#052e16"
                                : shortlisting[candidate.applicationId] || isLocked(candidate.status)
                                ? "#1f2937"
                                : "#1d4ed8",
                            color:
                              candidate.status?.toLowerCase() === "shortlisted"
                                ? "#86efac"
                                : shortlisting[candidate.applicationId] || isLocked(candidate.status)
                                ? "#4b5563"
                                : "#fff",
                            cursor: isLocked(candidate.status) ? "not-allowed" : "pointer",
                            border:
                              candidate.status?.toLowerCase() === "shortlisted"
                                ? "1px solid #166534" : "none",
                          }}
                        >
                          {shortlisting[candidate.applicationId]
                            ? "Saving…"
                            : candidate.status?.toLowerCase() === "shortlisted"
                            ? "✓ Shortlisted"
                            : "Shortlist"}
                        </button>

                        {/* Reject */}
                        <button
                          onClick={() => handleReject(candidate.applicationId)}
                          disabled={rejecting[candidate.applicationId] || isLocked(candidate.status)}
                          className="px-2.5 py-1.5 rounded-lg text-lg font-semibold whitespace-nowrap"
                          style={{
                            background:
                              candidate.status?.toLowerCase() === "rejected"
                                ? "#1f0a0a"
                                : rejecting[candidate.applicationId] || isLocked(candidate.status)
                                ? "#1f2937"
                                : "#7f1d1d",
                            color:
                              candidate.status?.toLowerCase() === "rejected"
                                ? "#fca5a5"
                                : rejecting[candidate.applicationId] || isLocked(candidate.status)
                                ? "#4b5563"
                                : "#fff",
                            cursor: isLocked(candidate.status) ? "not-allowed" : "pointer",
                            border:
                              candidate.status?.toLowerCase() === "rejected"
                                ? "1px solid #7f1d1d" : "none",
                          }}
                        >
                          {rejecting[candidate.applicationId]
                            ? "Saving…"
                            : candidate.status?.toLowerCase() === "rejected"
                            ? "✗ Rejected"
                            : "Reject"}
                        </button>

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
  );
};

export default RecruiterApplicants;