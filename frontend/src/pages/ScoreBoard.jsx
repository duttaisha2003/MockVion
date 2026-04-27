

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const ScoreBoard = () => {
  const navigate = useNavigate();

  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}api/interview/my-interviews`,
          { withCredentials: true }
        );

        setInterviews(res.data.data || []);
      } catch (err) {
        console.error("Fetch Interviews Error:", err);
        setError("Failed to load interview history.");
      } finally {
        setLoading(false);
      }
    };

    fetchInterviews();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-lg">Loading interview history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );
  }

  if (interviews.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-lg">
          No completed interviews found.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent p-8">
      <div className="max-w-5xl mx-auto bg-transparent  shadow-lg rounded-xl p-8">
        <h1 className="text-3xl font-bold mb-6 text-center text-white">
          Interview History
        </h1>

        <div className="space-y-4">
          {interviews.map((interview) => (
            <div
              key={interview._id}
              className="border rounded-lg p-5 flex justify-between items-center hover:shadow-md transition text-white"
            >
              <div>
                <p className="text-lg font-semibold">
                  Interview ID: {interview._id.slice(-6)}
                </p>
                <p className="text-sm text-gray-400">
                  Date: {new Date(interview.startTime).toLocaleString()}
                </p>
                <p className="text-sm">
                  Duration: {interview.duration} Seconds
                </p>
              </div>

              <div className="text-right">
                <p className="text-xl font-bold text-sky-600">
                  {interview.totalScore}
                </p>
                <p className="text-sm text-gray-400">
                  Avg: {interview.averageScore}
                </p>

                <button
                  onClick={() =>
                    navigate(`/score/${interview._id}`)
                  }
                  className="mt-2 bg-sky-500 hover:bg-sky-600 text-white px-4 py-1 rounded"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ScoreBoard;
