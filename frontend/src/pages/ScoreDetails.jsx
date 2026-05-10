

// import { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import axios from "axios";

// const ScoreDetails = () => {
//   const { sessionId } = useParams();
//   const navigate = useNavigate();

//   const [data, setData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     const fetchResults = async () => {
//       try {
//         const res = await axios.get(
//           `${import.meta.env.VITE_BACKEND_URL}api/interview/${sessionId}/results`,
//           { withCredentials: true }
//         );

//         setData(res.data.data);
//       } catch (err) {
//         console.error("Fetch Results Error:", err);
//         setError("Failed to load interview results.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (sessionId) fetchResults();
//   }, [sessionId]);

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <p className="text-gray-500 text-lg">Loading results...</p>
//       </div>
//     );
//   }

//   if (error || !data) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <p className="text-red-500 text-lg">
//           {error || "No results found."}
//         </p>
//       </div>
//     );
//   }

//   const { session, scores, answers, resume, proctoring } = data;

//   return (
//     <div className="min-h-screen bg-black p-8">
//       <div className="max-w-6xl mx-auto bg-gray-900 shadow-lg rounded-xl p-8">

//         <h1 className="text-3xl font-bold mb-8 text-center text-white">
//           Interview Result Summary
//         </h1>

//         {/* ================= SUMMARY ================= */}
//         <div className="grid md:grid-cols-2 gap-8 mb-10  text-white">

//           <div className="space-y-2">
//             <p><strong>Status:</strong> {session.status}</p>
//             <p><strong>Start:</strong> {new Date(session.startTime).toLocaleString()}</p>
//             <p><strong>End:</strong> {new Date(session.endTime).toLocaleString()}</p>
//             <p><strong>Duration:</strong> {session.duration} Seconds</p>
//             <p>
//               <strong>Questions Answered:</strong>{" "}
//               {session.questionsAnswered}/{session.totalQuestions}
//             </p>
//           </div>

//           <div className="space-y-2">
//             <p><strong>Total Score:</strong> {scores.totalScore}</p>
//             <p><strong>Average Score:</strong> {scores.averageScore}</p>

//             {/* Performance Breakdown */}
//             {scores.performance && (
//               <div className="mt-2">
//                 <strong>Performance Breakdown:</strong>
//                 <ul className="list-disc ml-5 mt-1">
//                   <li>Technical: {scores.performance.technicalScore}</li>
//                   <li>Behavioral: {scores.performance.behavioralScore}</li>
//                   <li>Communication: {scores.performance.communicationScore}</li>
//                   <li>Time Management: {scores.performance.timeManagementScore}</li>
//                 </ul>
//               </div>
//             )}
//           </div>
//         </div>


//         {/* ================= PROCTORING ================= */}
//         {proctoring && (
//           <div className="mb-10 border p-4 rounded-lg bg-gray-900 text-gray-400">
//             <h2 className="text-xl font-semibold mb-3">Proctoring Summary</h2>
//             <p>Background Changes: {proctoring.backgroundChanges}</p>
//             <p>Multiple Faces: {proctoring.multipleFacesDetected}</p>
//             <p>Noise Levels: {proctoring.highNoiseLevels}</p>
//             <p>Tab Switches: {proctoring.tabSwitches}</p>
//             <p>
//               <strong>Overall Risk:</strong> {proctoring.overallRisk}
//             </p>
//           </div>
//         )}

//         {/* ================= ANSWERS ================= */}
//         <div >
//           <h2 className="text-2xl font-semibold mb-6 text-white">
//             Question-wise Breakdown
//           </h2>

//           <div className="space-y-6">
//             {answers.map((ans, index) => (
//               <div
//                 key={index}
//                 className="border rounded-lg p-6 bg-gray-900 text-white"
//               >
//                 <p className="font-semibold text-lg mb-2 text-white">
//                   Q{index + 1}: {ans.question}
//                 </p>

//                 <p className="mb-2 text-white">
//                   <strong>Your Answer:</strong> {ans.answer || "No answer provided"}
//                 </p>

//                 <p className="mb-2 text-white">
//                   <strong>Score:</strong> {ans.score}
//                 </p>

//                 <p className="mb-3 text-white">
//                   <strong>Feedback:</strong> {ans.feedback}
//                 </p>

//                 {/* Strengths */}
//                 {ans.strengths?.length > 0 && (
//                   <div className="mb-3 text-green-700">
//                     <strong>Strengths:</strong>
//                     <ul className="list-disc ml-5 mt-1">
//                       {ans.strengths.map((item, i) => (
//                         <li key={i}>{item}</li>
//                       ))}
//                     </ul>
//                   </div>
//                 )}

//                 {/* Improvements */}
//                 {ans.improvements?.length > 0 && (
//                   <div className="mb-3 text-red-600">
//                     <strong>Areas for Improvement:</strong>
//                     <ul className="list-disc ml-5 mt-1">
//                       {ans.improvements.map((item, i) => (
//                         <li key={i}>{item}</li>
//                       ))}
//                     </ul>
//                   </div>
//                 )}

//                 {/* Evaluation Metrics */}
//                 <div className="grid grid-cols-3 gap-3 text-xs text-gray-400 mt-4">
//                   <p>Timeliness: {ans.timeliness}</p>
//                   <p>Confidence: {ans.confidence}</p>
//                   <p>Noise Level: {ans.noiseLevel}</p>
//                   <p>Plagiarism: {ans.plagiarismDetected ? "Yes" : "No"}</p>
//                   <p>AI Help: {ans.helpDetected ? "Yes" : "No"}</p>
//                 </div>

//               </div>
//             ))}
//           </div>
//         </div>

//         {/* ================= BACK BUTTON ================= */}
//         <div className="mt-10 text-center">
//           <button
//             onClick={() => navigate("/score")}
//             className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
//           >
//             Back to History
//           </button>
//         </div>

//       </div>
//     </div>
//   );
// };

// export default ScoreDetails;
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const ScoreDetails = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}api/interview/${sessionId}/results`,
          { withCredentials: true }
        );
        setData(res.data.data);
      } catch (err) {
        console.error("Fetch Results Error:", err);
        setError("Failed to load interview results.");
      } finally {
        setLoading(false);
      }
    };
    if (sessionId) fetchResults();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-lg">Loading results...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500 text-lg">{error || "No results found."}</p>
      </div>
    );
  }

  const { session, scores, answers, resume, proctoring } = data;

  return (
    <div className="min-h-screen bg-transparent p-8">
      <div className="max-w-6xl mx-auto bg-transparent shadow-lg rounded-xl p-8">

        <h1 className="text-3xl font-bold mb-8 text-center text-white">
          Interview Result Summary
        </h1>

        {/* ================= SUMMARY ================= */}
        <div className="grid md:grid-cols-2 gap-8 mb-10 text-white">
          <div className="space-y-2">
            <p><strong>Status:</strong> {session.status}</p>
            <p><strong>Start:</strong> {new Date(session.startTime).toLocaleString()}</p>
            <p><strong>End:</strong> {new Date(session.endTime).toLocaleString()}</p>
            <p><strong>Duration:</strong> {session.duration} Seconds</p>
            <p>
              <strong>Questions Answered:</strong>{" "}
              {session.questionsAnswered}/{session.totalQuestions}
            </p>
          </div>

          <div className="space-y-2">
            <p><strong>Total Score:</strong> {scores.totalScore}</p>
            <p><strong>Average Score:</strong> {scores.averageScore}</p>
            {scores.performance && (
              <div className="mt-2">
                <strong>Performance Breakdown:</strong>
                <ul className="list-disc ml-5 mt-1">
                  <li>Technical: {scores.performance.technicalScore}</li>
                  <li>Behavioral: {scores.performance.behavioralScore}</li>
                  <li>Communication: {scores.performance.communicationScore}</li>
                  <li>Time Management: {scores.performance.timeManagementScore}</li>
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* ================= PROCTORING ================= */}
        {proctoring && (
          <div className="mb-10 border p-4 rounded-lg bg-gray-900 text-gray-400">
            <h2 className="text-xl font-semibold mb-4 text-white">Proctoring Summary</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              {[
                { label: "Face Absences",       value: proctoring.faceAbsences          ?? 0, high: true  },
                { label: "Multiple Faces",       value: proctoring.multipleFacesDetected ?? 0, high: true  },
                { label: "Face Mismatches",      value: proctoring.faceSwaps             ?? 0, high: true  },
                { label: "Objects Detected",     value: proctoring.objectsDetected       ?? 0, high: true  },
                { label: "Look Aways",           value: proctoring.lookAways             ?? 0, high: false },
                { label: "Tab Switches",         value: proctoring.tabSwitches           ?? 0, high: false },
                { label: "Background Changes",   value: proctoring.backgroundChanges     ?? 0, high: false },
                { label: "Noise Events",         value: proctoring.highNoiseLevels       ?? 0, high: false },
              ].map(({ label, value, high }) => (
                <div key={label} className="bg-gray-800 rounded-lg p-3 text-center border border-gray-700">
                  <p className="text-2xl font-bold"
                    style={{ color: value === 0 ? "#86efac" : high ? "#f87171" : "#fbbf24" }}>
                    {value}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{label}</p>
                </div>
              ))}
            </div>
            <p>
              <strong className="text-white">Overall Risk: </strong>
              <span style={{
                color: proctoring.overallRisk === "high"   ? "#f87171"
                     : proctoring.overallRisk === "medium" ? "#fbbf24"
                     : "#86efac"
              }}>
                {proctoring.overallRisk?.toUpperCase()}
              </span>
            </p>
          </div>
        )}

        {/* ================= ANSWERS ================= */}
        <div>
          <h2 className="text-2xl font-semibold mb-6 text-white">
            Question-wise Breakdown
          </h2>

          <div className="space-y-6">
            {answers.map((ans, index) => (
              <div key={index} className="border rounded-lg p-6 bg-gray-900 text-white">
                <p className="font-semibold text-lg mb-2 text-white">
                  Q{index + 1}: {ans.question}
                </p>

                <p className="mb-2 text-white">
                  <strong>Your Answer:</strong> {ans.answer || "No answer provided"}
                </p>

                <p className="mb-2 text-white">
                  <strong>Score:</strong> {ans.score}
                </p>

                <p className="mb-3 text-white">
                  <strong>Feedback:</strong> {ans.feedback}
                </p>

                {ans.strengths?.length > 0 && (
                  <div className="mb-3 text-green-700">
                    <strong>Strengths:</strong>
                    <ul className="list-disc ml-5 mt-1">
                      {ans.strengths.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {ans.improvements?.length > 0 && (
                  <div className="mb-3 text-red-600">
                    <strong>Areas for Improvement:</strong>
                    <ul className="list-disc ml-5 mt-1">
                      {ans.improvements.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Evaluation Metrics — REMOVED */}

              </div>
            ))}
          </div>
        </div>

        {/* ================= BACK BUTTON ================= */}
        <div className="mt-10 text-center">
          <button
            onClick={() => navigate("/score")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
          >
            Back to History
          </button>
        </div>

      </div>
    </div>
  );
};

export default ScoreDetails;