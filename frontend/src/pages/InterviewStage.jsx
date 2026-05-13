import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { useParams } from "react-router-dom";

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const InterviewStage = () => {
  const navigate = useNavigate(); 
  const { jobId } = useParams(); 
console.log(jobId)
const startInterview = async () => {
  try {

    let res;

    if ( jobId) {
      console.log("hi- job interview");
      res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}api/interview/start-job`,
        { jobId },
        { withCredentials: true }
      );
    } else {
      console.log("hi- resume interview");
      res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}api/interview/start`,
        {},
        { withCredentials: true }
      );
    }

    const sessionId = res.data.data.sessionId;
    console.log('hi',jobId)
    navigate(`/interview/${sessionId}`,{
      state: {
    jobId: jobId
  }
    });

  } catch (err) {
    console.error(err);
    toast.error(err.response?.data?.message || "Failed to start interview");
  }
};
  return (
   <>
    <ToastContainer position="top-right" autoClose={2000}  hideProgressBar={false}  newestOnTop
      closeOnClick  pauseOnHover  theme="colored"  toastStyle={{ borderRadius: '10px', fontSize: '14px' }}
    />
    <div className="min-h-[80vh] flex items-center justify-center bg-transparent">
      <div className="bg-gray-900 p-10 rounded-xl shadow-md max-w-xl text-center space-y-5">
        <h1 className="text-3xl font-bold text-white">
          AI Mock Interview
        </h1>

        <p className="text-gray-400">
          You will be asked one question at a time.
          Your answers will be evaluated by AI in real-time.
        </p>

        <p className="text-gray-400">
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
   </>
  );
};

export default InterviewStage;
  // const startInterview = async () => {
  //   try {
  //     const res = await axios.post(
  //       `${import.meta.env.VITE_BACKEND_URL}api/interview/start`,
  //       {},
  //       { withCredentials: true }
  //     );

  //     const sessionId = res.data.data.sessionId;

  //     navigate(`/interview/${sessionId}`);
  //   } catch (err) {
  //     console.error(err);
  //     alert("Failed to start interview");
  //   }
  // };