// import { useEffect, useRef, useState } from "react";
// import axios from "axios";
// import { useParams, useNavigate } from "react-router-dom";

// const InterviewRoom = () => {
//   const { sessionId } = useParams();
//   const navigate = useNavigate();

//   const videoRef = useRef(null);
//   const recognitionRef = useRef(null);

//   const [question, setQuestion] = useState("");
//   const [answerText, setAnswerText] = useState("");
//   const [listening, setListening] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [interviewStarted, setInterviewStarted] = useState(false);

//   /* ================= CAMERA + MIC ================= */
//   useEffect(() => {
//     const startMedia = async () => {
//       try {
//         const stream = await navigator.mediaDevices.getUserMedia({
//           video: true,
//           audio: true,
//         });
//         if (videoRef.current) {
//           videoRef.current.srcObject = stream;
//         }
//       } catch (err) {
//         console.warn("Camera/Microphone not available");
//       }
//     };
//     startMedia();
//   }, []);

//   /* ================= TEXT TO SPEECH ================= */
//   const speakQuestion = (text, onEnd) => {
//     if (!window.speechSynthesis) return;

//     window.speechSynthesis.cancel();

//     const utterance = new SpeechSynthesisUtterance(text);
//     utterance.lang = "en-US";
//     utterance.rate = 0.9;
//     utterance.pitch = 1;

//     utterance.onend = () => {
//       if (onEnd) onEnd();
//     };

//     window.speechSynthesis.speak(utterance);
//   };

//   /* ================= SPEECH TO TEXT ================= */
//   const startSpeechRecognition = () => {
//     const SpeechRecognition =
//       window.SpeechRecognition || window.webkitSpeechRecognition;

//     if (!SpeechRecognition) {
//       alert("Speech recognition not supported in this browser");
//       return;
//     }

//     const recognition = new SpeechRecognition();
//     recognition.continuous = true;
//     recognition.interimResults = false;
//     recognition.lang = "en-US";

//     recognition.onresult = (event) => {
//       let finalTranscript = "";

//       for (let i = 0; i < event.results.length; i++) {
//         if (event.results[i].isFinal) {
//           finalTranscript += event.results[i][0].transcript + " ";
//         }
//       }

//       setAnswerText(finalTranscript.trim());
//     };

//     recognition.onerror = (e) => {
//       console.error("Speech error:", e);
//     };

//     recognition.start();
//     recognitionRef.current = recognition;
//     setListening(true);
//   };

//   const stopSpeechRecognition = () => {
//     recognitionRef.current?.stop();
//     setListening(false);
//   };

//   /* ================= BEGIN INTERVIEW ================= */
//   const beginInterview = async () => {
//     try {
//       setLoading(true);

//       const res = await axios.post(
//         `${import.meta.env.VITE_BACKEND_URL}api/interview/${sessionId}/begin`,
//         {},
//         { withCredentials: true }
//       );

//       const qText = res.data.data.currentQuestion.text;

//       setQuestion(qText);
//       setInterviewStarted(true);

//       speakQuestion(qText, () => {
//         startSpeechRecognition();
//       });
//     } catch (err) {
//       console.error(err);
//       alert("Failed to start interview");
//     } finally {
//       setLoading(false);
//     }
//   };

//   /* ================= COMPLETE INTERVIEW ================= */
//   const completeInterview = async () => {
//     try {
//       const res = await axios.post(
//         `${import.meta.env.VITE_BACKEND_URL}api/interview/${sessionId}/complete`,
//         {},
//         { withCredentials: true }
//       );
//       console.log(res.data.success);
//       if (res.data.success) {
//         navigate(`/score/${sessionId}`);
//       }
//     } catch (err) {
//       console.error("Complete interview error:", err);
//       alert("Failed to complete interview");
//     }
//   };

//   /* ================= SUBMIT ANSWER ================= */
//   const submitAnswer = async () => {
//     try {
//       setLoading(true);
//       stopSpeechRecognition();

//       const res = await axios.post(
//         `${import.meta.env.VITE_BACKEND_URL}api/interview/${sessionId}/submit-answer`,
//         { answer: answerText },
//         { withCredentials: true }
//       );

//       if (res.data.data.hasMoreQuestions) {
//         const nextQ = res.data.data.nextQuestion.text;

//         setAnswerText("");
//         setQuestion(nextQ);

//         speakQuestion(nextQ, () => {
//           startSpeechRecognition();
//         });
//       } else {
//         await completeInterview();
//       }
//     } catch (err) {
//       console.error(err);
//       alert("Failed to submit answer");
//     } finally {
//       setLoading(false);
//     }
//   };

//   /* ================= UI ================= */
//   return (
//     <div className="grid grid-cols-3 gap-6 p-6 bg-gray-100 min-h-[90vh]">

//       <div className="col-span-1 bg-black rounded-xl overflow-hidden">
//         <video
//           ref={videoRef}
//           autoPlay
//           muted
//           className="w-full h-full object-cover"
//         />
//       </div>

//       <div className="col-span-2 bg-white rounded-xl shadow p-6 space-y-5">

//         <div className="text-lg font-semibold text-gray-800">
//           {question || "Click Begin Interview"}
//         </div>

//         <textarea
//           value={answerText}
//           readOnly
//           className="w-full h-40 border rounded-lg p-4"
//           placeholder="Your spoken answer will appear here..."
//         />

//         <div className="flex gap-4 justify-end">
//           {!interviewStarted && (
//             <button
//               onClick={beginInterview}
//               disabled={loading}
//               className="bg-sky-600 text-white px-5 py-2 rounded-lg"
//             >
//               Begin Interview
//             </button>
//           )}

//           {interviewStarted && (
//             <>
//               {!listening ? (
//                 <button
//                   onClick={startSpeechRecognition}
//                   className="bg-green-600 text-white px-5 py-2 rounded-lg"
//                 >
//                   Start Speaking
//                 </button>
//               ) : (
//                 <button
//                   onClick={stopSpeechRecognition}
//                   className="bg-red-600 text-white px-5 py-2 rounded-lg"
//                 >
//                   Stop Speaking
//                 </button>
//               )}

//               <button
//                 onClick={submitAnswer}
//                 disabled={loading || !answerText}
//                 className="bg-blue-600 text-white px-5 py-2 rounded-lg"
//               >
//                 Submit Answer
//               </button>
//             </>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default InterviewRoom;

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const InterviewRoom = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate(); // ✅ NEW

  const videoRef = useRef(null);
  const recognitionRef = useRef(null);

  const [question, setQuestion] = useState("");
  const [answerText, setAnswerText] = useState("");
  const [listening, setListening] = useState(false);
  const [loading, setLoading] = useState(false);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");

  /* ================= CAMERA + MIC ================= */
  useEffect(() => {
    const startMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.warn("Camera/Microphone not available");
      }
    };
    startMedia();
  }, []);

  /* ================= TEXT TO SPEECH ================= */
  const speakQuestion = (text, onEnd) => {
    if (!window.speechSynthesis) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.9;
    utterance.pitch = 1;

    utterance.onend = () => {
      if (onEnd) onEnd();
    };

    window.speechSynthesis.speak(utterance);
  };

  /* ================= SPEECH TO TEXT ================= */
  const startSpeechRecognition = () => {
    if (manualMode) return;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition not supported in this browser");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-IN";

    // recognition.onresult = (event) => {
    //   let finalTranscript = "";

    //   for (let i = 0; i < event.results.length; i++) {
    //     if (event.results[i].isFinal) {
    //       finalTranscript += event.results[i][0].transcript + " ";
    //     }
    //   }

    //   setAnswerText(finalTranscript.trim());
    // };
    recognition.onresult = (event) => {
      let interimTranscript = "";
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          finalTranscript += transcript + " ";
        } else {
          interimTranscript += transcript;
        }
      }

      setAnswerText(finalTranscript + interimTranscript);
    };

    recognition.onerror = (e) => {
      console.error("Speech error:", e);
    };

    recognition.start();
    recognitionRef.current = recognition;
    setListening(true);
  };

  const stopSpeechRecognition = () => {
    recognitionRef.current?.stop();
    setListening(false);
  };

  /* ================= BEGIN INTERVIEW ================= */
  const beginInterview = async () => {
    try {
      setLoading(true);

      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}api/interview/${sessionId}/begin`,
        {},
        { withCredentials: true }
      );

      const qText = res.data.data.currentQuestion.text;

      setQuestion(qText);
      setInterviewStarted(true);

      if (!manualMode) {
        speakQuestion(qText, () => {
          startSpeechRecognition();
        });
      }
    } catch (err) {
      console.error(err);
      alert("Failed to start interview");
    } finally {
      setLoading(false);
    }
  };

  /* ================= COMPLETE INTERVIEW ================= */
  const completeInterview = async () => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}api/interview/${sessionId}/complete`,
        {},
        { withCredentials: true }
      );
      console.log(res.data.success)
      if (res.data.success) {
        navigate(`/score/${sessionId}`);
      }
    } catch (err) {
      console.error("Complete interview error:", err);
      alert("Failed to complete interview");
    }
  };

  /* ================= SUBMIT ANSWER ================= */
  const submitAnswer = async () => {
    try {
      setLoading(true);
      stopSpeechRecognition();

      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}api/interview/${sessionId}/submit-answer`,
        { answer: answerText },
        { withCredentials: true }
      );

      if (res.data.data.hasMoreQuestions) {
        const nextQ = res.data.data.nextQuestion.text;

        setAnswerText("");
        setQuestion(nextQ);

        if (!manualMode) {
          speakQuestion(nextQ, () => {
            startSpeechRecognition();
          });
        }
      } else {
        // ✅ Interview Finished → Call complete endpoint
        await completeInterview();
      }
    } catch (err) {
      console.error(err);
      alert("Failed to submit answer");
    } finally {
      setLoading(false);
    }
  };
  /* ================= TAB CHANGE DETECTION ================= */
 useEffect(() => {
  if (!interviewStarted) return;

  const handleVisibilityChange = () => {
    if (document.hidden) {
      setWarningMessage("⚠️ Tab switching is not allowed during the interview.");
      setShowWarning(true);

      reportProctoringEvent("tab_switch", "medium", {
        message: "User switched tab or minimized window"
      });
    }
  };

  const handleBlur = () => {
    setWarningMessage("⚠️ Window lost focus. Please stay on the interview screen.");
    setShowWarning(true);

    reportProctoringEvent("tab_switch", "medium", {
      message: "Window lost focus"
    });
  };

  document.addEventListener("visibilitychange", handleVisibilityChange);
  window.addEventListener("blur", handleBlur);

  return () => {
    document.removeEventListener("visibilitychange", handleVisibilityChange);
    window.removeEventListener("blur", handleBlur);
  };
}, [interviewStarted]);

  const reportProctoringEvent = async (eventType, severity, details = {}) => {
      try {
        await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}api/interview/${sessionId}/proctoring`,
          {
            eventType,
            severity,
            details
          },
          { withCredentials: true }
        );
      } catch (err) {
        console.error("Failed to report proctoring event:", err);
      }
    };

  /* ================= UI ================= */
  return (
    <div className="grid grid-cols-3 gap-6 p-6 bg-gray-100 min-h-[90vh]">

      <div className="col-span-1 bg-black rounded-xl overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          muted
          className="w-full h-full object-cover"
        />
      </div>

      <div className="col-span-2 bg-white rounded-xl shadow p-6 space-y-5">

        <div className="text-lg font-semibold text-gray-800">
          {question || "Click Begin Interview"}
        </div>

        <button
          onClick={() => {
            stopSpeechRecognition();
            setManualMode((prev) => !prev);
          }}
          className="bg-gray-600 text-white px-4 py-2 rounded-lg"
        >
          {manualMode ? "Switch to Speech Mode" : "Switch to Manual Mode"}
        </button>

        <textarea
          value={answerText}
          onChange={(e) => manualMode && setAnswerText(e.target.value)}
          readOnly={!manualMode}
          className="w-full h-40 border rounded-lg p-4"
          placeholder={
            manualMode
              ? "Type your answer here..."
              : "Your spoken answer will appear here..."
          }
        />

        <div className="flex gap-4 justify-end">
          {!interviewStarted && (
            <button
              onClick={beginInterview}
              disabled={loading}
              className="bg-sky-600 text-white px-5 py-2 rounded-lg"
            >
              Begin Interview
            </button>
          )}

          {interviewStarted && (
            <>
              {!manualMode && (
                !listening ? (
                  <button
                    onClick={startSpeechRecognition}
                    className="bg-green-600 text-white px-5 py-2 rounded-lg"
                  >
                    Start Speaking
                  </button>
                ) : (
                  <button
                    onClick={stopSpeechRecognition}
                    className="bg-red-600 text-white px-5 py-2 rounded-lg"
                  >
                    Stop Speaking
                  </button>
                )
              )}

              <button
                onClick={submitAnswer}
                disabled={loading || !answerText}
                className="bg-blue-600 text-white px-5 py-2 rounded-lg"
              >
                Submit Answer
              </button>
            </>
          )}
        </div>
      </div>
      {showWarning && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-xl shadow-lg w-96 text-center">
      <h2 className="text-lg font-semibold text-red-600 mb-3">
        Proctoring Warning
      </h2>
      <p className="text-gray-700 mb-4">{warningMessage}</p>
      <button
        onClick={() => setShowWarning(false)}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg"
      >
        I Understand
      </button>
    </div>
  </div>
)}

    </div>
  );
};

export default InterviewRoom;
