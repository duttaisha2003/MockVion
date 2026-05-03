// pages/RecruiterPerformance.jsx
import { useParams ,useNavigate} from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { ArrowLeft} from "lucide-react";
const RecruiterPerformance = () => {
  const { resultId } = useParams();
  const [data, setData] = useState(null);
   const { jobId } = useParams(); 

  const navigate = useNavigate();

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}api/recruiter/jobs/${resultId}`,
          { withCredentials: true }
        );
        setData(res.data.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchResult();
  }, [resultId]);

  if (!data) return <p className="text-white p-6">Loading...</p>;

  return (
    <div className=" min-h-screen bg-transparent p-8 text-white">
    <div className="max-w-5xl mx-auto bg-transparent  shadow-lg rounded-xl p-8">
      <h1 className="text-3xl font-bold mb-6 text-center text-white">
        Interview Result Summary
      </h1>

      {/* ✅ SUMMARY */}
      <div className="bg-gray-900 p-6 rounded-xl mb-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
            
            {/* Left side — session info */}
            <div className="space-y-1.5">
            <p className="text-sm" style={{ color: "#d1d5db" }}>
                <span style={{ color: "#6b7280" }}>Status:</span>{" "}
                <span className="font-semibold">{data.status}</span>
            </p>
            <p className="text-sm" style={{ color: "#d1d5db" }}>
                <span style={{ color: "#6b7280" }}>Start:</span>{" "}
                {new Date(data.startTime).toLocaleString()}
            </p>
            <p className="text-sm" style={{ color: "#d1d5db" }}>
                <span style={{ color: "#6b7280" }}>End:</span>{" "}
                {new Date(data.endTime).toLocaleString()}
            </p>
            <p className="text-sm" style={{ color: "#d1d5db" }}>
                <span style={{ color: "#6b7280" }}>Duration:</span>{" "}
                {data.duration} Seconds
            </p>
            <p className="text-sm" style={{ color: "#d1d5db" }}>
                <span style={{ color: "#6b7280" }}>Questions Answered:</span>{" "}
                {data.answers?.length}/{data.totalQuestions}
            </p>
            </div>

            {/* Right side — scores */}
            <div
            className="flex flex-col items-start sm:items-end gap-3 sm:text-right px-7"
            >
            <div>
                <p className="text-xs font-semibold mb-0.5" style={{ color: "#6b7280" }}>
                Total Score
                </p>
                <p className="text-3xl font-bold" style={{ color: "#f9fafb" }}>
                {data.totalScore}
                </p>
            </div>
            <div>
                <p className="text-xs font-semibold mb-0.5" style={{ color: "#6b7280" }}>
                Average Score
                </p>
                <p className="text-3xl font-bold" style={{ color: "#93c5fd" }}>
                {data.averageScore}
                </p>
            </div>
            </div>

        </div>
      </div>

      {/* ✅ PROCTORING */}
      <div className="bg-gray-900 p-6 rounded-xl mb-6">
        <h2 className="text-xl font-semibold mb-4">Proctoring Summary</h2>

        <p>Background Changes: {data.proctoringSummary?.backgroundChanges}</p>
        <p>Multiple Faces: {data.proctoringSummary?.multipleFacesDetected}</p>
        <p>Noise Levels: {data.proctoringSummary?.highNoiseLevels}</p>
        <p>Tab Switches: {data.proctoringSummary?.tabSwitches}</p>
        <p>Overall Risk: {data.proctoringSummary?.overallRisk}</p>
      </div>

      {/* ✅ QUESTION-WISE BREAKDOWN */}
      <div className="bg-gray-900 p-6 rounded-xl">
        <h2 className="text-xl font-semibold mb-4">
          Question-wise Breakdown
        </h2>

        {data.answers?.map((ans, index) => (
          <div key={ans._id} className="mb-6 border-b border-gray-700 pb-4">
            <p className="font-semibold">
              Q{index + 1}: {ans.question}
            </p>

            <p className="mt-2">
              <strong>Your Answer:</strong> {ans.answer}
            </p>

            <p><strong>Score:</strong> {ans.score}</p>

            <p><strong>Feedback:</strong> {ans.feedback}</p>

            {/* <p><strong>Timeliness:</strong> {ans.timeliness ?? "N/A"}</p>
            <p><strong>Confidence:</strong> {ans.confidence ?? "N/A"}</p>
            <p><strong>Noise Level:</strong> {ans.noiseLevel ?? "N/A"}</p>

            <p>
              <strong>Plagiarism:</strong>{" "}
              {ans.plagiarismDetected ? "Yes" : "No"}
            </p>

            <p>
              <strong>AI Help:</strong>{" "}
              {ans.helpDetected ? "Yes" : "No"}
            </p> */}
          </div>
        ))}
      </div>
      {/* BACK BUTTON */}
      <button
          onClick={() => navigate(-1)}
          className="w-full m-4 flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 py-3 rounded-xl font-semibold text-sm transition"
        >
          <ArrowLeft size={16} />
          Back to Applicants
        </button>
    </div>
    </div>
  );
};

export default RecruiterPerformance;