import { useNavigate } from "react-router-dom";
import axios from "axios";

const InterviewStage = () => {
  const navigate = useNavigate();

  const startInterview = async () => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}api/interview/start`,
        {},
        { withCredentials: true }
      );

      const sessionId = res.data.data.sessionId;

      navigate(`/interview/${sessionId}`);
    } catch (err) {
      console.error(err);
      alert("Failed to start interview");
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50">
      <div className="bg-white p-10 rounded-xl shadow-md max-w-xl text-center space-y-5">
        <h1 className="text-3xl font-bold text-gray-800">
          AI Mock Interview
        </h1>

        <p className="text-gray-600">
          You will be asked one question at a time.
          Your answers will be evaluated by AI in real-time.
        </p>

        <p className="text-gray-600">
          Make sure your camera & mic are ready before starting.
        </p>

        <button
          onClick={startInterview}
          className="mt-6 bg-sky-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-sky-700"
        >
          Start Interview
        </button>
      </div>
    </div>
  );
};

export default InterviewStage;
