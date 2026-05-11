// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";

// const JobBoard = () => {
//   const [jobs, setJobs] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [appliedJobs, setAppliedJobs] = useState(new Set());
//   const [selectedJob, setSelectedJob] = useState(null);
//   const navigate = useNavigate();

//   const [filters, setFilters] = useState({
//     minExperience: "",
//     maxExperience: "",
//     role: "",
//   });

//   const fetchAppliedJobs = async (jobsList) => {
//     try {
//       const appliedChecks = await Promise.all(
//         jobsList.map(async (job) => {
//           try {
//             const res = await axios.get(
//               `${import.meta.env.VITE_BACKEND_URL}api/interview/check-applied/${job.jobId}`,
//               { withCredentials: true }
//             );
//             return res.data.applied ? job.jobId : null;
//           } catch {
//             return null;
//           }
//         })
//       );
//       setAppliedJobs(new Set(appliedChecks.filter(Boolean)));
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   const fetchJobs = async () => {
//     try {
//       setLoading(true);
//       setAppliedJobs(new Set());
//       setSelectedJob(null);

//       const res = await axios.get(
//         `${import.meta.env.VITE_BACKEND_URL}api/auth/matched-jobs`,
//         { params: filters, withCredentials: true }
//       );

//       const fetchedJobs = res.data?.matches || [];

//       const today = new Date();
//       today.setHours(0, 0, 0, 0);
//       const filtered = fetchedJobs.filter((job) => {
//         const last = new Date(job.lastDate);
//         last.setHours(0, 0, 0, 0);
//         return last >= today;
//       });

//       setJobs(filtered);
//       if (filtered.length > 0) setSelectedJob(filtered[0]);
//       await fetchAppliedJobs(filtered);
//     } catch (error) {
//       console.log(error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleApplyClick = (jobId) => {
//     navigate(`/interviewstage/${jobId}`);
//   };

//   const handleChange = (e) => {
//     setFilters({ ...filters, [e.target.name]: e.target.value });
//   };

//   useEffect(() => {
//     fetchJobs();
//   }, []);

//   return (
//     <div className="min-h-screen bg-transparent text-white px-6 py-10">
//       <div className="max-w-6xl mx-auto">
//         <h1 className="text-3xl font-bold mb-6">AI Matched Jobs</h1>

//         {/* SEARCH BAR */}
//         {/* <div className="bg-gray-900 p-4 rounded-xl mb-6 flex flex-wrap gap-4">
//           <input
//             type="number"
//             name="minExperience"
//             placeholder="Min Exp"
//             value={filters.minExperience}
//             onChange={handleChange}
//             className="bg-gray-800 px-4 py-2 rounded w-32 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
//           />
//           <input
//             type="number"
//             name="maxExperience"
//             placeholder="Max Exp"
//             value={filters.maxExperience}
//             onChange={handleChange}
//             className="bg-gray-800 px-4 py-2 rounded w-32 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
//           />
//           <input
//             type="text"
//             name="role"
//             placeholder="Role"
//             value={filters.role}
//             onChange={handleChange}
//             className="bg-gray-800 px-4 py-2 rounded flex-1 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
//           />
//           <button
//             onClick={fetchJobs}
//             className="bg-sky-600 hover:bg-sky-700 px-6 py-2 rounded-lg transition font-medium"
//           >
//             Search
//           </button>
//         </div> */}

//         {/* LOADING */}
//         {loading && (
//           <p className="text-gray-400 text-sm">Loading jobs...</p>
//         )}

//         {/* NO JOBS */}
//         {!loading && jobs.length === 0 && (
//           <p className="text-gray-400 text-sm">No jobs found.</p>
//         )}

//         {/* SPLIT LAYOUT */}
//         {!loading && jobs.length > 0 && (
//           <div className="flex border border-gray-700 rounded-xl overflow-hidden h-[620px]">

//             {/* ── LEFT PANEL ── */}
//             <div className="w-[360px] min-w-[360px] border-r border-gray-700 bg-gray-900 flex-shrink-0 flex flex-col">

//               {/* sticky header */}
//               <p className="px-4 py-3 text-xs text-gray-400 border-b border-gray-700 uppercase tracking-widest flex-shrink-0">
//                 {jobs.length} matched jobs
//               </p>

//               {/* scrollable list */}
//               <div
//                 className="flex-1 overflow-y-auto"
//                 style={{
//                   scrollbarWidth: "thin",
//                   scrollbarColor: "#4b5563 #111827",
//                 }}
//               >
//                 {jobs.map((job) => {
//                   const isSelected = selectedJob?.jobId === job.jobId;
//                   const isApplied = appliedJobs.has(job.jobId);

//                   return (
//                     <div
//                       key={job.jobId}
//                       onClick={() => setSelectedJob(job)}
//                       className={`px-4 py-4 border-b border-gray-700 cursor-pointer transition-all
//                         ${isSelected
//                           ? "bg-gray-800 border-l-2 border-l-sky-500"
//                           : "hover:bg-gray-800 border-l-2 border-l-transparent"
//                         }`}
//                     >
//                       <div className="flex items-start justify-between mb-1">
//                         <p className="font-semibold text-sm text-white leading-snug">
//                           {job.title}
//                         </p>
//                         {isApplied && (
//                           <span className="text-[10px] bg-blue-700 text-white px-2 py-0.5 rounded-full ml-2 flex-shrink-0">
//                             Applied
//                           </span>
//                         )}
//                       </div>

//                       <p className="text-xs text-gray-500 mb-2">{job.jobId}</p>

//                       <span className="text-xs font-semibold text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">
//                         {job.matchScore}% match
//                       </span>

//                       <div className="flex gap-3 mt-2 text-xs text-gray-400 flex-wrap">
//                         <span>
//                           {job.experienceRequired
//                             ? `${job.experienceRequired.min}–${job.experienceRequired.max} yrs`
//                             : "Exp N/A"}
//                         </span>
//                         <span>
//                           {job.lastDate
//                             ? `Last: ${new Date(job.lastDate).toLocaleDateString("en-GB")}`
//                             : ""}
//                         </span>
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>
//             </div>

//             {/* ── RIGHT PANEL ── */}
//             {selectedJob ? (
//               <div
//                 className="flex-1 overflow-y-auto p-8 bg-transparent"
//                 style={{
//                   scrollbarWidth: "thin",
//                   scrollbarColor: "#4b5563 transparent",
//                 }}
//               >
//                 {/* Header */}
//                 <h2 className="text-2xl font-bold text-white mb-1">
//                   {selectedJob.title}
//                 </h2>
//                 <p className="text-gray-500 text-sm mb-4">{selectedJob.jobId}</p>

//                 <span className="text-sm font-semibold text-green-400 bg-green-400/10 px-3 py-1 rounded-full">
//                   {selectedJob.matchScore}% match
//                 </span>

//                 {/* Info cards */}
//                 <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
//                   <div className="bg-gray-900 rounded-lg p-4">
//                     <p className="text-xs text-gray-500 mb-1">Experience</p>
//                     <p className="text-blue-400 font-medium text-sm">
//                       {selectedJob.experienceRequired
//                         ? `${selectedJob.experienceRequired.min} – ${selectedJob.experienceRequired.max} Years`
//                         : "Not specified"}
//                     </p>
//                   </div>
//                   <div className="bg-gray-900 rounded-lg p-4">
//                     <p className="text-xs text-gray-500 mb-1">Salary</p>
//                     <p className="text-yellow-400 font-medium text-sm">
//                       {selectedJob.salary
//                         ? `₹${selectedJob.salary.min.toLocaleString()} – ₹${selectedJob.salary.max.toLocaleString()} ${selectedJob.salary.currency || ""}`
//                         : "Not specified"}
//                     </p>
//                   </div>
//                   <div className="bg-gray-900 rounded-lg p-4">
//                     <p className="text-xs text-gray-500 mb-1">Last Date</p>
//                     <p className="text-red-400 font-medium text-sm">
//                       {selectedJob.lastDate
//                         ? new Date(selectedJob.lastDate).toLocaleDateString("en-GB")
//                         : "Not specified"}
//                     </p>
//                   </div>
//                 </div>

//                 {/* Job Description */}
//                 {selectedJob.description && (
//                   <div className="mt-6">
//                     <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">
//                       Job Description
//                     </p>
//                     <div className="bg-gray-900 rounded-lg p-4">
//                       <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
//                         {selectedJob.description}
//                       </p>
//                     </div>
//                   </div>
//                 )}

//                 {/* Skills */}
//                 <div className="mt-6">
//                   <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">
//                     Skills Required
//                   </p>
//                   <div className="flex flex-wrap gap-2">
//                     {selectedJob.skillsRequired?.length > 0 ? (
//                       selectedJob.skillsRequired.map((skill, i) => (
//                         <span
//                           key={i}
//                           className="bg-gray-800 px-3 py-1 rounded-full text-sm text-gray-300 border border-gray-700"
//                         >
//                           {skill}
//                         </span>
//                       ))
//                     ) : (
//                       <span className="text-gray-500 text-sm">No skills listed</span>
//                     )}
//                   </div>
//                 </div>

//                 {/* Apply Button */}
//                 <button
//                   onClick={() => handleApplyClick(selectedJob.jobId)}
//                   disabled={appliedJobs.has(selectedJob.jobId) || !selectedJob.canApply}
//                   className={`mt-8 w-full py-3 rounded-lg font-semibold text-sm transition
//                     ${appliedJobs.has(selectedJob.jobId)
//                       ? "bg-blue-800 cursor-not-allowed text-white"
//                       : selectedJob.canApply
//                       ? "bg-green-600 hover:bg-green-700 text-white"
//                       : "bg-gray-700 cursor-not-allowed text-gray-400"
//                     }`}
//                 >
//                   {appliedJobs.has(selectedJob.jobId)
//                     ? "Applied"
//                     : selectedJob.canApply
//                     ? "Apply Now"
//                     : "Not Eligible"}
//                 </button>
//               </div>
//             ) : (
//               <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
//                 Select a job to view details
//               </div>
//             )}

//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default JobBoard;
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const JobBoard = () => {
  const [jobs, setJobs]               = useState([]);
  const [loading, setLoading]         = useState(false);
  const [appliedJobs, setAppliedJobs] = useState(new Set());
  const [selectedJob, setSelectedJob] = useState(null);
  const navigate = useNavigate();

  const fetchAppliedJobs = async (jobsList) => {
    try {
      const appliedChecks = await Promise.all(
        jobsList.map(async (job) => {
          try {
            const res = await axios.get(
              `${import.meta.env.VITE_BACKEND_URL}api/interview/check-applied/${job.jobId}`,
              { withCredentials: true }
            );
            return res.data.applied ? job.jobId : null;
          } catch {
            return null;
          }
        })
      );
      setAppliedJobs(new Set(appliedChecks.filter(Boolean)));
    } catch (error) {
      console.log(error);
    }
  };

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setAppliedJobs(new Set());
      setSelectedJob(null);

      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}api/auth/matched-jobs`,
        { withCredentials: true }
      );

      const fetchedJobs = res.data?.matches || [];

      // filter out expired jobs on frontend
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const active = fetchedJobs.filter((job) => {
        const last = new Date(job.lastDate);
        last.setHours(0, 0, 0, 0);
        return last >= today;
      });

      setJobs(active);
      if (active.length > 0) setSelectedJob(active[0]);
      await fetchAppliedJobs(active);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyClick = (jobId) => {
    navigate(`/interviewstage/${jobId}`);
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  return (
    <div className="min-h-screen bg-transparent text-white px-6 py-10">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">AI Matched Jobs</h1>

        {loading && (
          <p className="text-gray-400 text-sm">Loading jobs...</p>
        )}

        {!loading && jobs.length === 0 && (
          <p className="text-gray-400 text-sm">No matching jobs found for your profile.</p>
        )}

        {!loading && jobs.length > 0 && (
          <div className="flex border border-gray-700 rounded-xl overflow-hidden h-[620px]">

            {/* ── LEFT PANEL ── */}
            <div className="w-[360px] min-w-[360px] border-r border-gray-700 bg-gray-900 flex-shrink-0 flex flex-col">

              <p className="px-4 py-3 text-xs text-gray-400 border-b border-gray-700 uppercase tracking-widest flex-shrink-0">
                {jobs.length} matched jobs
              </p>

              <div
                className="flex-1 overflow-y-auto"
                style={{ scrollbarWidth: "thin", scrollbarColor: "#4b5563 #111827" }}
              >
                {jobs.map((job) => {
                  const isSelected = selectedJob?.jobId === job.jobId;
                  const isApplied  = appliedJobs.has(job.jobId);

                  return (
                    <div
                      key={job.jobId}
                      onClick={() => setSelectedJob(job)}
                      className={`px-4 py-4 border-b border-gray-700 cursor-pointer transition-all
                        ${isSelected
                          ? "bg-gray-800 border-l-2 border-l-sky-500"
                          : "hover:bg-gray-800 border-l-2 border-l-transparent"
                        }`}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <p className="font-semibold text-sm text-white leading-snug">
                          {job.title}
                        </p>
                        {isApplied && (
                          <span className="text-[10px] bg-blue-700 text-white px-2 py-0.5 rounded-full ml-2 flex-shrink-0">
                            Applied
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-gray-500 mb-2">{job.jobId}</p>

                      {/* match score badge */}
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full
                        ${job.matchScore >= 70
                          ? "text-green-400 bg-green-400/10"
                          : job.matchScore >= 40
                          ? "text-yellow-400 bg-yellow-400/10"
                          : "text-red-400 bg-red-400/10"
                        }`}>
                        {job.matchScore}% match
                      </span>

                      <div className="flex gap-3 mt-2 text-xs text-gray-400 flex-wrap">
                        <span>
                          {job.experienceRequired
                            ? `${job.experienceRequired.min}–${job.experienceRequired.max} yrs`
                            : "Exp N/A"}
                        </span>
                        <span>
                          {job.lastDate
                            ? `Last: ${new Date(job.lastDate).toLocaleDateString("en-GB")}`
                            : ""}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── RIGHT PANEL ── */}
            {selectedJob ? (
              <div
                className="flex-1 overflow-y-auto p-8 bg-transparent"
                style={{ scrollbarWidth: "thin", scrollbarColor: "#4b5563 transparent" }}
              >
                {/* Header */}
                <h2 className="text-2xl font-bold text-white mb-1">
                  {selectedJob.title}
                </h2>
                <p className="text-gray-500 text-sm mb-4">{selectedJob.jobId}</p>

                <span className={`text-sm font-semibold px-3 py-1 rounded-full
                  ${selectedJob.matchScore >= 70
                    ? "text-green-400 bg-green-400/10"
                    : selectedJob.matchScore >= 40
                    ? "text-yellow-400 bg-yellow-400/10"
                    : "text-red-400 bg-red-400/10"
                  }`}>
                  {selectedJob.matchScore}% match
                </span>

                {/* Info cards — 4 cards */}
                <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-gray-900 rounded-lg p-4">
                    <p className="text-xs text-gray-500 mb-1">Job Experience</p>
                    <p className="text-blue-400 font-medium text-sm">
                      {selectedJob.experienceRequired
                        ? `${selectedJob.experienceRequired.min} – ${selectedJob.experienceRequired.max} yrs`
                        : "Not specified"}
                    </p>
                  </div>

                  <div className="bg-gray-900 rounded-lg p-4">
                    <p className="text-xs text-gray-500 mb-1">Your Experience</p>
                    <p className="text-purple-400 font-medium text-sm">
                      {selectedJob.candidateExperience || "Fresher"}
                    </p>
                  </div>

                  <div className="bg-gray-900 rounded-lg p-4">
                    <p className="text-xs text-gray-500 mb-1">Salary</p>
                    <p className="text-yellow-400 font-medium text-sm">
                      {selectedJob.salary
                        ? `₹${selectedJob.salary.min.toLocaleString()} – ₹${selectedJob.salary.max.toLocaleString()}`
                        : "Not specified"}
                    </p>
                  </div>

                  <div className="bg-gray-900 rounded-lg p-4">
                    <p className="text-xs text-gray-500 mb-1">Last Date</p>
                    <p className="text-red-400 font-medium text-sm">
                      {selectedJob.lastDate
                        ? new Date(selectedJob.lastDate).toLocaleDateString("en-GB")
                        : "Not specified"}
                    </p>
                  </div>
                </div>

                {/* Job Description */}
                {selectedJob.description && (
                  <div className="mt-6">
                    <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">
                      Job Description
                    </p>
                    <div className="bg-gray-900 rounded-lg p-4">
                      <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                        {selectedJob.description}
                      </p>
                    </div>
                  </div>
                )}

                {/* Skills Required */}
                <div className="mt-6">
                  <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">
                    Skills Required
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedJob.skillsRequired?.length > 0 ? (
                      selectedJob.skillsRequired.map((skill, i) => (
                        <span
                          key={i}
                          className="bg-gray-800 px-3 py-1 rounded-full text-sm text-gray-300 border border-gray-700"
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-500 text-sm">No skills listed</span>
                    )}
                  </div>
                </div>

                {/* Apply Button */}
                <button
                  onClick={() => handleApplyClick(selectedJob.jobId)}
                  disabled={appliedJobs.has(selectedJob.jobId) || !selectedJob.canApply}
                  className={`mt-8 w-full py-3 rounded-lg font-semibold text-sm transition
                    ${appliedJobs.has(selectedJob.jobId)
                      ? "bg-blue-800 cursor-not-allowed text-white"
                      : selectedJob.canApply
                      ? "bg-green-600 hover:bg-green-700 text-white"
                      : "bg-gray-700 cursor-not-allowed text-gray-400"
                    }`}
                >
                  {appliedJobs.has(selectedJob.jobId)
                    ? "✓ Applied"
                    : selectedJob.canApply
                    ? "Apply Now"
                    : "Not Eligible"}
                </button>

                {/* not eligible reason */}
                {!selectedJob.canApply && !appliedJobs.has(selectedJob.jobId) && (
                  <p className="text-xs text-gray-500 text-center mt-2">
                    Your skill match score is below the required threshold for this role.
                  </p>
                )}

              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
                Select a job to view details
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
};

export default JobBoard;