// // import { useEffect, useRef, useState, useCallback } from "react";
// // import axios from "axios";
// // import { useParams, useNavigate, useLocation } from "react-router-dom";
// // import SpeechRecognition, {
// //   useSpeechRecognition,
// // } from "react-speech-recognition";

// // const InterviewRoom = () => {
// //   const { sessionId } = useParams();
// //   const location = useLocation();
// //   const jobId = location.state?.jobId;
// //   const navigate = useNavigate();
// //   const videoRef = useRef(null);
// //   const canvasRef = useRef(null);
// //   const streamRef = useRef(null);
// //   const timerRef = useRef(null);
// //   const faceCheckRef = useRef(null);

// //   /* ── STATE ── */
// //   const [question, setQuestion] = useState("");
// //   const [answerText, setAnswerText] = useState("");
// //   const [loading, setLoading] = useState(false);
// //   const [interviewStarted, setInterviewStarted] = useState(false);
// //   const [showWarning, setShowWarning] = useState(false);
// //   const [warningMessage, setWarningMessage] = useState("");

// //   const [permStage, setPermStage] = useState("idle");
// //   const [cameraReady, setCameraReady] = useState(false);
// //   const [micReady, setMicReady] = useState(false);
// //   const [faceDetected, setFaceDetected] = useState(false);
// //   const [timeLeft, setTimeLeft] = useState(120);
// //   const [questionTimeLimit, setQuestionTimeLimit] = useState(120);
// //   const [questionIndex, setQuestionIndex] = useState(0);
// //   const [totalQuestions, setTotalQuestions] = useState(0);
// //   const [isSpeaking, setIsSpeaking] = useState(false);
// //   const [showSubmitModal, setShowSubmitModal] = useState(false);

// //   /* ── sync transcript ── */
// //   const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } =
// //     useSpeechRecognition({ clearTranscriptOnListen: false });

// //   useEffect(() => {
// //     setAnswerText(transcript);
// //   }, [transcript]);

// //   /* ════════════════════════════════════════
// //      FACE DETECTION
// //   ════════════════════════════════════════ */
// //   const startFaceDetection = () => {
// //     if (faceCheckRef.current) clearInterval(faceCheckRef.current);
// //     faceCheckRef.current = setInterval(() => {
// //       const video = videoRef.current;
// //       const canvas = canvasRef.current;
// //       if (!video || !canvas || video.readyState < 2) return;
// //       const ctx = canvas.getContext("2d");
// //       canvas.width = 80;
// //       canvas.height = 60;
// //       ctx.drawImage(video, 0, 0, 80, 60);
// //       const data = ctx.getImageData(0, 0, 80, 60).data;
// //       let sum = 0, sumSq = 0;
// //       const pixels = data.length / 4;
// //       for (let i = 0; i < data.length; i += 4) {
// //         const b = (data[i] + data[i + 1] + data[i + 2]) / 3;
// //         sum += b;
// //         sumSq += b * b;
// //       }
// //       const mean = sum / pixels;
// //       const variance = sumSq / pixels - mean * mean;
// //       setFaceDetected(variance > 200 && mean > 20 && mean < 240);
// //     }, 800);
// //   };

// //   /* ════════════════════════════════════════
// //      REQUEST PERMISSIONS
// //   ════════════════════════════════════════ */
// //   const requestPermissions = async () => {
// //     setPermStage("requesting");
// //     try {
// //       const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
// //       streamRef.current = stream;
// //       if (videoRef.current) {
// //         videoRef.current.srcObject = stream;
// //         videoRef.current.onloadedmetadata = () => startFaceDetection();
// //       }
// //       setCameraReady(!!stream.getVideoTracks()[0]?.enabled);
// //       setMicReady(!!stream.getAudioTracks()[0]?.enabled);
// //       setPermStage("granted");
// //     } catch {
// //       setPermStage("denied");
// //     }
// //   };

// //   useEffect(() => () => {
// //     if (faceCheckRef.current) clearInterval(faceCheckRef.current);
// //     if (timerRef.current) clearInterval(timerRef.current);
// //   }, []);

// //   const canBegin = cameraReady && micReady && faceDetected;

// //   /* ════════════════════════════════════════
// //      TIMER
// //   ════════════════════════════════════════ */
// //   const startTimer = (seconds) => {
// //     if (timerRef.current) clearInterval(timerRef.current);
// //     setTimeLeft(seconds);
// //     timerRef.current = setInterval(() => {
// //       setTimeLeft((prev) => {
// //         if (prev <= 1) { clearInterval(timerRef.current); return 0; }
// //         return prev - 1;
// //       });
// //     }, 1000);
// //   };

// //   const stopTimer = () => { if (timerRef.current) clearInterval(timerRef.current); };

// //   useEffect(() => {
// //     if (timeLeft === 0 && interviewStarted) submitAnswer(true);
// //   }, [timeLeft]);

// //   /* ════════════════════════════════════════
// //      TEXT TO SPEECH
// //   ════════════════════════════════════════ */
// //   const speakQuestion = (text, onEnd) => {
// //     if (!window.speechSynthesis) return;
// //     window.speechSynthesis.cancel();
// //     const utterance = new SpeechSynthesisUtterance(text);
// //     utterance.lang = "en-US";
// //     utterance.rate = 0.9;
// //     setIsSpeaking(true);
// //     utterance.onend = () => { setIsSpeaking(false); if (onEnd) onEnd(); };
// //     utterance.onerror = () => setIsSpeaking(false);
// //     window.speechSynthesis.speak(utterance);
// //   };

// //   /* ════════════════════════════════════════
// //      SPEECH RECOGNITION
// //   ════════════════════════════════════════ */
// //   const startSpeechRecognition = () => {
// //     if (!browserSupportsSpeechRecognition) {
// //       alert("Browser does not support speech recognition");
// //       return;
// //     }
// //     resetTranscript();
// //     SpeechRecognition.startListening({ continuous: true, interimResults: true, language: "en-IN" });
// //   };

// //   const stopSpeechRecognition = () => SpeechRecognition.stopListening();

// //   /* ════════════════════════════════════════
// //      BEGIN INTERVIEW
// //   ════════════════════════════════════════ */
// //   const beginInterview = async () => {
// //     try {
// //       setLoading(true);
// //       const res = await axios.post(
// //         `${import.meta.env.VITE_BACKEND_URL}api/interview/${sessionId}/begin`,
// //         {}, { withCredentials: true }
// //       );
// //       const { currentQuestion, totalQuestions: total } = res.data.data;
// //       const qText = currentQuestion.text;
// //       const timeLimit = currentQuestion.timeLimit || 120;

// //       setQuestion(qText);
// //       setInterviewStarted(true);
// //       setTotalQuestions(total);
// //       setQuestionIndex(0);
// //       setQuestionTimeLimit(timeLimit);

// //       speakQuestion(qText, () => {
// //         startTimer(timeLimit);
// //         startSpeechRecognition();
// //       });
// //     } catch (err) {
// //       console.error(err);
// //       alert("Failed to start interview");
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   /* ════════════════════════════════════════
// //      COMPLETE INTERVIEW
// //   ════════════════════════════════════════ */
// //   const completeInterview = async () => {
// //     try {
// //       stopTimer();
// //       stopSpeechRecognition();
// //       window.speechSynthesis?.cancel();
// //       streamRef.current?.getTracks().forEach((t) => t.stop());
// //       const res = await axios.post(
// //         `${import.meta.env.VITE_BACKEND_URL}api/interview/${sessionId}/complete`,
// //         { jobId: jobId }, { withCredentials: true }
// //       );
// //       if (res.data.success) navigate(`/score/${sessionId}`);
// //     } catch (err) {
// //       console.error("Complete interview error:", err);
// //       alert("Failed to complete interview");
// //     }
// //   };

// //   /* ════════════════════════════════════════
// //      SUBMIT ANSWER
// //   ════════════════════════════════════════ */
// //   const submitAnswer = async (autoSubmit = false) => {
// //     try {
// //       setLoading(true);
// //       stopTimer();
// //       stopSpeechRecognition();

// //       const answer = autoSubmit && !answerText.trim()
// //         ? "[No answer - time expired]"
// //         : answerText;

// //       const res = await axios.post(
// //         `${import.meta.env.VITE_BACKEND_URL}api/interview/${sessionId}/submit-answer`,
// //         { answer },
// //         { withCredentials: true }
// //       );

// //       if (res.data.data.hasMoreQuestions) {
// //         const nextQ = res.data.data.nextQuestion;
// //         const nextText = nextQ.text;
// //         const nextLimit = nextQ.timeLimit || 120;

// //         setAnswerText("");
// //         resetTranscript();
// //         setQuestion(nextText);
// //         setQuestionIndex((prev) => prev + 1);
// //         setQuestionTimeLimit(nextLimit);

// //         speakQuestion(nextText, () => {
// //           startTimer(nextLimit);
// //           startSpeechRecognition();
// //         });
// //       } else {
// //         await completeInterview();
// //       }
// //     } catch (err) {
// //       console.error(err);
// //       alert("Failed to submit answer");
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   /* ════════════════════════════════════════
// //      EARLY SUBMIT
// //   ════════════════════════════════════════ */
// //   const confirmEarlySubmit = async () => {
// //     setShowSubmitModal(false);
// //     if (answerText.trim()) {
// //       await submitAnswer(false);
// //     } else {
// //       await completeInterview();
// //     }
// //   };

// //   /* ════════════════════════════════════════
// //      PROCTORING
// //   ════════════════════════════════════════ */
// //   useEffect(() => {
// //     if (!interviewStarted) return;
// //     const handleVisibilityChange = () => {
// //       if (document.hidden) {
// //         setWarningMessage("⚠️ Tab switching is not allowed.");
// //         setShowWarning(true);
// //         reportProctoringEvent("tab_switch", "medium");
// //       }
// //     };
// //     const handleBlur = () => {
// //       setWarningMessage("⚠️ Window lost focus.");
// //       setShowWarning(true);
// //       reportProctoringEvent("tab_switch", "medium");
// //     };
// //     document.addEventListener("visibilitychange", handleVisibilityChange);
// //     window.addEventListener("blur", handleBlur);
// //     return () => {
// //       document.removeEventListener("visibilitychange", handleVisibilityChange);
// //       window.removeEventListener("blur", handleBlur);
// //     };
// //   }, [interviewStarted]);

// //   const reportProctoringEvent = async (eventType, severity) => {
// //     try {
// //       await axios.post(
// //         `${import.meta.env.VITE_BACKEND_URL}api/interview/${sessionId}/proctoring`,
// //         { eventType, severity }, { withCredentials: true }
// //       );
// //     } catch (err) {
// //       console.error("Proctoring error:", err);
// //     }
// //   };

// //   /* ════════════════════════════════════════
// //      TIMER HELPERS
// //   ════════════════════════════════════════ */
// //   const formatTime = (s) =>
// //     `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
// //   const timerPct = Math.max(0, (timeLeft / questionTimeLimit) * 100);
// //   const timerColor = timerPct > 50 ? "#16a34a" : timerPct > 25 ? "#d97706" : "#dc2626";

// //   /* ════════════════════════════════════════
// //      GATE SCREEN
// //   ════════════════════════════════════════ */
// //   if (!interviewStarted && permStage !== "granted") {
// //     return (
// //       <div className="grid grid-cols-3 gap-6 p-6 min-h-[90vh]" style={{ background: "#0f1117" }}>

// //         {/* Camera panel */}
// //         <div className="col-span-1 rounded-xl overflow-hidden relative" style={{ background: "#111827", border: "1px solid #1f2937" }}>
// //           <video
// //             ref={videoRef}
// //             autoPlay
// //             muted
// //             playsInline
// //             className="w-full h-full object-cover"
// //             style={{ transform: "scaleX(-1)" }}
// //           />
// //           <canvas ref={canvasRef} className="hidden" />

// //           {permStage !== "granted" && (
// //             <div className="absolute inset-0 flex items-center justify-center text-gray-600 text-sm">
// //               Camera preview
// //             </div>
// //           )}

// //           {permStage === "granted" && (
// //             <div className={`absolute bottom-3 left-3 right-3 text-xs text-center py-2 rounded-lg font-semibold ${
// //               faceDetected
// //                 ? "bg-green-900/80 text-green-300 border border-green-700"
// //                 : "bg-red-900/80 text-red-300 border border-red-700"
// //             }`}>
// //               {faceDetected ? "✓ Face detected" : "⚠ No face — sit in front of camera"}
// //             </div>
// //           )}
// //         </div>

// //         {/* Info panel */}
// //         <div className="col-span-2 rounded-xl p-6 space-y-5" style={{ background: "#111827", border: "1px solid #1f2937" }}>
// //           <div className="text-lg font-semibold" style={{ color: "#f9fafb" }}>
// //             Verify your setup before starting
// //           </div>
// //           <p className="text-sm" style={{ color: "#9ca3af" }}>
// //             Camera access, microphone, and a visible face are all required to begin the interview.
// //           </p>

// //           <div className="space-y-3">
// //             <CheckRow label="Camera access" status={permStage === "idle" ? "idle" : cameraReady ? "ok" : "fail"} />
// //             <CheckRow label="Microphone access" status={permStage === "idle" ? "idle" : micReady ? "ok" : "fail"} />
// //             <CheckRow label="Face visible in camera" status={permStage !== "granted" ? "idle" : faceDetected ? "ok" : "fail"} />
// //           </div>

// //           {permStage === "denied" && (
// //             <div className="text-sm rounded-lg p-3" style={{ background: "#1f0a0a", border: "1px solid #7f1d1d", color: "#fca5a5" }}>
// //               Access denied. Allow camera & microphone in your browser settings and reload.
// //             </div>
// //           )}

// //           <div className="flex gap-4 justify-end">
// //             {(permStage === "idle" || permStage === "denied") && (
// //               <button
// //                 onClick={requestPermissions}
// //                 className="px-5 py-2 rounded-lg font-semibold text-sm text-white transition-colors"
// //                 style={{ background: "#2563eb" }}
// //               >
// //                 Allow Camera & Microphone
// //               </button>
// //             )}
// //             {permStage === "requesting" && (
// //               <button disabled className="px-5 py-2 rounded-lg text-sm cursor-not-allowed" style={{ background: "#374151", color: "#6b7280" }}>
// //                 Requesting…
// //               </button>
// //             )}
// //             {permStage === "granted" && (
// //               <button
// //                 onClick={beginInterview}
// //                 disabled={!canBegin || loading}
// //                 className="px-5 py-2 rounded-lg font-semibold text-sm transition-colors"
// //                 style={{
// //                   background: canBegin && !loading ? "#2563eb" : "#1f2937",
// //                   color: canBegin && !loading ? "#fff" : "#4b5563",
// //                   cursor: canBegin && !loading ? "pointer" : "not-allowed",
// //                 }}
// //               >
// //                 {loading ? "Starting…" : !faceDetected ? "Waiting for face…" : "Begin Interview"}
// //               </button>
// //             )}
// //           </div>
// //         </div>
// //       </div>
// //     );
// //   }

// //   /* ════════════════════════════════════════
// //      MAIN INTERVIEW UI
// //   ════════════════════════════════════════ */
// //   return (
// //     <div className="grid grid-cols-3 gap-6 p-6 min-h-[90vh]" style={{ background: "#0f1117" }}>

// //       {/* Camera */}
// //       <div className="col-span-1 rounded-xl overflow-hidden relative" style={{ background: "#111827", border: "1px solid #1f2937" }}>
// //         <video
// //           ref={videoRef}
// //           autoPlay
// //           muted
// //           playsInline
// //           className="w-full h-full object-cover"
// //           style={{ transform: "scaleX(-1)" }}
// //         />
// //         <canvas ref={canvasRef} className="hidden" />

// //         {/* LIVE badge */}
// //         <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded px-2 py-1" style={{ background: "rgba(0,0,0,0.6)" }}>
// //           <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
// //           <span className="text-xs font-semibold" style={{ color: "#f87171" }}>LIVE</span>
// //         </div>

// //         {/* Mic status */}
// //         <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded px-2 py-1" style={{ background: "rgba(0,0,0,0.6)" }}>
// //           <span className={`w-1.5 h-1.5 rounded-full ${listening ? "bg-green-400 animate-pulse" : "bg-gray-600"}`} />
// //           <span className="text-xs font-semibold" style={{ color: listening ? "#86efac" : "#6b7280" }}>
// //             {listening ? "MIC ON" : "MIC OFF"}
// //           </span>
// //         </div>

// //         {/* Face badge */}
// //         <div className={`absolute bottom-3 left-3 right-3 text-xs text-center py-1.5 rounded-lg font-semibold ${
// //           faceDetected
// //             ? "bg-green-900/80 text-green-300 border border-green-700"
// //             : "bg-red-900/80 text-red-300 border border-red-700"
// //         }`}>
// //           {faceDetected ? "✓ Face detected" : "⚠ Face not visible"}
// //         </div>
// //       </div>

// //       {/* Answer panel */}
// //       <div className="col-span-2 rounded-xl p-6 space-y-5" style={{ background: "#111827", border: "1px solid #1f2937" }}>

// //         {/* Timer row + Submit Interview */}
// //         {interviewStarted && (
// //           <>
// //             <div className="flex items-center justify-between">
// //               <div className="flex items-center gap-3">
// //                 <div
// //                   className="flex items-center gap-2 px-3 py-1 rounded-full border text-sm font-bold"
// //                   style={{ color: timerColor, borderColor: timerColor + "66", background: timerColor + "11" }}
// //                 >
// //                   <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: timerColor }} />
// //                   {formatTime(timeLeft)}
// //                 </div>
// //                 <span className="text-xs" style={{ color: "#6b7280" }}>
// //                   Question {questionIndex + 1} / {totalQuestions}
// //                 </span>
// //               </div>
// //               <button
// //                 onClick={() => setShowSubmitModal(true)}
// //                 className="text-xs font-semibold px-4 py-1.5 rounded-lg transition-colors"
// //                 style={{ border: "1px solid #7f1d1d", color: "#f87171", background: "#1f0a0a" }}
// //               >
// //                 Submit Interview
// //               </button>
// //             </div>

// //             {/* Timer progress bar */}
// //             <div className="w-full h-1.5 rounded-full overflow-hidden -mt-2" style={{ background: "#1f2937" }}>
// //               <div
// //                 className="h-full rounded-full transition-all duration-1000"
// //                 style={{ width: `${timerPct}%`, background: timerColor }}
// //               />
// //             </div>
// //           </>
// //         )}

// //         {/* Question text */}
// //         <div className="text-lg font-semibold" style={{ color: "#f9fafb" }}>
// //           {question || "Click Begin Interview"}
// //         </div>

// //         {/* TTS replay */}
// //         {interviewStarted && (
// //           <button
// //             onClick={() => speakQuestion(question)}
// //             disabled={isSpeaking}
// //             className="text-xs underline disabled:opacity-40 transition-colors"
// //             style={{ color: "#6b7280" }}
// //           >
// //             {isSpeaking ? "🔊 Speaking…" : "🔊 Replay question audio"}
// //           </button>
// //         )}

// //         {/* Textarea */}
// //         <textarea
// //           value={answerText}
// //           onChange={(e) => setAnswerText(e.target.value)}
// //           className="w-full h-40 rounded-lg p-4 text-sm resize-none outline-none"
// //           style={{
// //             background: "#0f1117",
// //             border: "1px solid #1f2937",
// //             color: "#f9fafb",
// //           }}
// //           placeholder="Your spoken answer will appear here..."
// //         />

// //         {/* Buttons */}
// //         <div className="flex gap-4 justify-end">
// //           {!interviewStarted && (
// //             <button
// //               onClick={beginInterview}
// //               disabled={loading}
// //               className="px-5 py-2 rounded-lg text-sm font-semibold text-white"
// //               style={{ background: "#2563eb" }}
// //             >
// //               Begin Interview
// //             </button>
// //           )}

// //           {interviewStarted && (
// //             <button
// //               onClick={() => submitAnswer(false)}
// //               disabled={loading || !answerText}
// //               className="px-5 py-2 rounded-lg text-sm font-semibold text-white transition-colors"
// //               style={{
// //                 background: loading || !answerText ? "#1f2937" : "#2563eb",
// //                 color: loading || !answerText ? "#4b5563" : "#fff",
// //                 cursor: loading || !answerText ? "not-allowed" : "pointer",
// //               }}
// //             >
// //               {loading ? "Submitting…" : questionIndex + 1 === totalQuestions ? "Submit Final Answer" : "Submit Answer"}
// //             </button>
// //           )}
// //         </div>
// //       </div>

// //       {/* Submit Interview Modal */}
// //       {showSubmitModal && (
// //         <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: "rgba(0,0,0,0.7)" }}>
// //           <div className="p-6 rounded-xl w-96 text-center" style={{ background: "#111827", border: "1px solid #1f2937" }}>
// //             <h2 className="text-base font-semibold mb-2" style={{ color: "#f9fafb" }}>Submit Interview Early?</h2>
// //             <p className="text-sm mb-1" style={{ color: "#9ca3af" }}>
// //               You're on question <strong style={{ color: "#f9fafb" }}>{questionIndex + 1}</strong> of{" "}
// //               <strong style={{ color: "#f9fafb" }}>{totalQuestions}</strong>.
// //             </p>
// //             {totalQuestions - questionIndex - 1 > 0 && (
// //               <p className="text-sm font-medium mb-3" style={{ color: "#f59e0b" }}>
// //                 {totalQuestions - questionIndex - 1} question(s) will be left unanswered.
// //               </p>
// //             )}
// //             <p className="text-xs mb-5" style={{ color: "#6b7280" }}>This cannot be undone.</p>
// //             <div className="flex gap-3 justify-center">
// //               <button
// //                 onClick={() => setShowSubmitModal(false)}
// //                 className="px-5 py-2 rounded-lg text-sm font-semibold"
// //                 style={{ border: "1px solid #374151", color: "#9ca3af", background: "transparent" }}
// //               >
// //                 Continue Interview
// //               </button>
// //               <button
// //                 onClick={confirmEarlySubmit}
// //                 className="px-5 py-2 rounded-lg text-sm font-semibold text-white"
// //                 style={{ background: "#dc2626" }}
// //               >
// //                 Yes, Submit Now
// //               </button>
// //             </div>
// //           </div>
// //         </div>
// //       )}

// //       {/* Proctoring Warning Modal */}
// //       {showWarning && (
// //         <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: "rgba(0,0,0,0.7)" }}>
// //           <div className="p-6 rounded-xl w-96 text-center" style={{ background: "#111827", border: "1px solid #7f1d1d" }}>
// //             <h2 className="text-base font-semibold mb-3" style={{ color: "#f87171" }}>
// //               Proctoring Warning
// //             </h2>
// //             <p className="mb-5" style={{ color: "#d1d5db" }}>{warningMessage}</p>
// //             <button
// //               onClick={() => setShowWarning(false)}
// //               className="px-6 py-2 rounded-lg text-sm font-semibold text-white"
// //               style={{ background: "#1d4ed8" }}
// //             >
// //               I Understand
// //             </button>
// //           </div>
// //         </div>
// //       )}
// //     </div>
// //   );
// // };

// // /* ── CheckRow ── */
// // const CheckRow = ({ label, status }) => {
// //   const cfg = {
// //     ok:   { dot: "#22c55e", shadow: "0 0 6px #22c55e", badgeBg: "#052e16", badgeBorder: "#166534", badgeText: "#86efac", bLabel: "✓ Ready" },
// //     fail: { dot: "#ef4444", shadow: "none",             badgeBg: "#1f0a0a", badgeBorder: "#7f1d1d", badgeText: "#fca5a5", bLabel: "✗ Not detected" },
// //     idle: { dot: "#374151", shadow: "none",             badgeBg: "#111827", badgeBorder: "#1f2937", badgeText: "#6b7280", bLabel: "Waiting…" },
// //   };
// //   const c = cfg[status];
// //   return (
// //     <div className="flex items-center gap-3 rounded-lg px-4 py-3" style={{ background: "#0f1117", border: "1px solid #1f2937" }}>
// //       <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: c.dot, boxShadow: c.shadow }} />
// //       <span className="text-sm flex-1" style={{ color: "#d1d5db" }}>{label}</span>
// //       <span className="text-xs px-2 py-0.5 rounded border font-medium"
// //         style={{ background: c.badgeBg, borderColor: c.badgeBorder, color: c.badgeText }}>
// //         {c.bLabel}
// //       </span>
// //     </div>
// //   );
// // };

// // export default InterviewRoom;

// import { useEffect, useRef, useState } from "react";
// import axios from "axios";
// import { useParams, useNavigate, useLocation } from "react-router-dom";

// const InterviewRoom = () => {
//   const { sessionId } = useParams();
//   const location = useLocation();
//   const jobId = location.state?.jobId;
//   const navigate = useNavigate();

//   const videoRef = useRef(null);
//   const canvasRef = useRef(null);
//   const streamRef = useRef(null);
//   const timerRef = useRef(null);
//   const faceCheckRef = useRef(null);
//   const mediaRecorderRef = useRef(null);
//   const audioChunksRef = useRef([]);

//   /* ── STATE ── */
//   const [question, setQuestion] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [interviewStarted, setInterviewStarted] = useState(false);
//   const [showWarning, setShowWarning] = useState(false);
//   const [warningMessage, setWarningMessage] = useState("");
//   const [isSpeaking, setIsSpeaking] = useState(false);
//   const [showSubmitModal, setShowSubmitModal] = useState(false);
//   const [listening, setListening] = useState(false);
//   const [isTranscribing, setIsTranscribing] = useState(false);

//   /* ── gate screen state ── */
//   const [permStage, setPermStage] = useState("idle");
//   const [cameraReady, setCameraReady] = useState(false);
//   const [micReady, setMicReady] = useState(false);
//   const [faceDetected, setFaceDetected] = useState(false);

//   /* ── timer state ── */
//   const [timeLeft, setTimeLeft] = useState(120);
//   const [questionTimeLimit, setQuestionTimeLimit] = useState(120);

//   /* ── question tracking ── */
//   const [questionIndex, setQuestionIndex] = useState(0);
//   const [totalQuestions, setTotalQuestions] = useState(0);

//   /* ── cleanup ── */
//   useEffect(() => () => {
//     if (faceCheckRef.current) clearInterval(faceCheckRef.current);
//     if (timerRef.current) clearInterval(timerRef.current);
//   }, []);

//   /* ── auto submit on timer end ── */
//   useEffect(() => {
//     if (timeLeft === 0 && interviewStarted) submitAnswer(true);
//   }, [timeLeft]);

//   const canBegin = cameraReady && micReady && faceDetected;

//   /* ════════════════════════════════════════
//      FACE DETECTION
//   ════════════════════════════════════════ */
//   const startFaceDetection = () => {
//     if (faceCheckRef.current) clearInterval(faceCheckRef.current);
//     faceCheckRef.current = setInterval(() => {
//       const video = videoRef.current;
//       const canvas = canvasRef.current;
//       if (!video || !canvas || video.readyState < 2) return;
//       const ctx = canvas.getContext("2d");
//       canvas.width = 80;
//       canvas.height = 60;
//       ctx.drawImage(video, 0, 0, 80, 60);
//       const data = ctx.getImageData(0, 0, 80, 60).data;
//       let sum = 0, sumSq = 0;
//       const pixels = data.length / 4;
//       for (let i = 0; i < data.length; i += 4) {
//         const b = (data[i] + data[i + 1] + data[i + 2]) / 3;
//         sum += b;
//         sumSq += b * b;
//       }
//       const mean = sum / pixels;
//       const variance = sumSq / pixels - mean * mean;
//       setFaceDetected(variance > 200 && mean > 20 && mean < 240);
//     }, 800);
//   };

//   /* ════════════════════════════════════════
//      REQUEST PERMISSIONS
//   ════════════════════════════════════════ */
//   const requestPermissions = async () => {
//     setPermStage("requesting");
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
//       streamRef.current = stream;
//       if (videoRef.current) {
//         videoRef.current.srcObject = stream;
//         videoRef.current.onloadedmetadata = () => startFaceDetection();
//       }
//       setCameraReady(!!stream.getVideoTracks()[0]?.enabled);
//       setMicReady(!!stream.getAudioTracks()[0]?.enabled);
//       setPermStage("granted");
//     } catch {
//       setPermStage("denied");
//     }
//   };

//   /* ════════════════════════════════════════
//      TIMER
//   ════════════════════════════════════════ */
//   const startTimer = (seconds) => {
//     if (timerRef.current) clearInterval(timerRef.current);
//     setTimeLeft(seconds);
//     timerRef.current = setInterval(() => {
//       setTimeLeft((prev) => {
//         if (prev <= 1) { clearInterval(timerRef.current); return 0; }
//         return prev - 1;
//       });
//     }, 1000);
//   };

//   const stopTimer = () => { if (timerRef.current) clearInterval(timerRef.current); };

//   const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
//   const timerPct = Math.max(0, (timeLeft / questionTimeLimit) * 100);
//   const timerColor = timerPct > 50 ? "#16a34a" : timerPct > 25 ? "#d97706" : "#dc2626";

//   /* ════════════════════════════════════════
//      TTS
//   ════════════════════════════════════════ */
//   const speakQuestion = (text, onEnd) => {
//     if (!window.speechSynthesis) return;
//     window.speechSynthesis.cancel();
//     const utterance = new SpeechSynthesisUtterance(text);
//     utterance.lang = "en-US";
//     utterance.rate = 0.9;
//     setIsSpeaking(true);
//     utterance.onend = () => { setIsSpeaking(false); if (onEnd) onEnd(); };
//     utterance.onerror = () => setIsSpeaking(false);
//     window.speechSynthesis.speak(utterance);
//   };

//   /* ════════════════════════════════════════
//      AUDIO RECORDING — AssemblyAI (copied from SubjectWiseInterviewRoom)
//   ════════════════════════════════════════ */
//   const startSpeechRecognition = () => {
//     try {
//       const originalStream = streamRef.current;
//       if (!originalStream) { console.error("No media stream"); return; }

//       const audioTracks = originalStream.getAudioTracks();
//       if (!audioTracks.length) { console.error("No audio track"); return; }

//       audioChunksRef.current = [];
//       const audioStream = new MediaStream(audioTracks);

//       let mimeType = "";
//       if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) mimeType = "audio/webm;codecs=opus";
//       else if (MediaRecorder.isTypeSupported("audio/webm")) mimeType = "audio/webm";
//       else if (MediaRecorder.isTypeSupported("audio/ogg")) mimeType = "audio/ogg";

//       const mr = mimeType
//         ? new MediaRecorder(audioStream, { mimeType })
//         : new MediaRecorder(audioStream);

//       mr.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
//       mr.onerror = (e) => console.error("MediaRecorder error:", e);
//       mr.onstart = () => setListening(true);

//       mr.start(1000);
//       mediaRecorderRef.current = mr;
//     } catch (err) {
//       console.error("startSpeechRecognition error:", err);
//     }
//   };

//   const stopSpeechRecognition = () => {
//     return new Promise((resolve) => {
//       const mr = mediaRecorderRef.current;
//       if (!mr || mr.state === "inactive") { setListening(false); return resolve(); }
//       mr.onstop = () => { setListening(false); resolve(); };
//       mr.stop();
//     });
//   };

//   /* ════════════════════════════════════════
//      BEGIN INTERVIEW
//   ════════════════════════════════════════ */
//   const beginInterview = async () => {
//     try {
//       setLoading(true);
//       const res = await axios.post(
//         `${import.meta.env.VITE_BACKEND_URL}api/interview/${sessionId}/begin`,
//         {}, { withCredentials: true }
//       );
//       const { currentQuestion, totalQuestions: total } = res.data.data;
//       const qText = currentQuestion.text;
//       const timeLimit = currentQuestion.timeLimit || 120;

//       setQuestion(qText);
//       setInterviewStarted(true);
//       setTotalQuestions(total);
//       setQuestionIndex(0);
//       setQuestionTimeLimit(timeLimit);

//       speakQuestion(qText, () => {
//         startTimer(timeLimit);
//         startSpeechRecognition();
//       });
//     } catch (err) {
//       console.error(err);
//       alert("Failed to start interview");
//     } finally {
//       setLoading(false);
//     }
//   };

//   /* ════════════════════════════════════════
//      COMPLETE INTERVIEW
//   ════════════════════════════════════════ */
//   const completeInterview = async () => {
//     try {
//       stopTimer();
//       await stopSpeechRecognition();
//       window.speechSynthesis?.cancel();
//       streamRef.current?.getTracks().forEach((t) => t.stop());

//       const res = await axios.post(
//         `${import.meta.env.VITE_BACKEND_URL}api/interview/${sessionId}/complete`,
//         { jobId },
//         { withCredentials: true }
//       );
//       if (res.data.success) navigate(`/score/${sessionId}`);
//     } catch (err) {
//       console.error("Complete interview error:", err);
//       // Navigate anyway so user isn't stuck
//       navigate(`/score/${sessionId}`);
//     }
//   };

//   /* ════════════════════════════════════════
//      SUBMIT ANSWER — stop recording → AssemblyAI transcribe → post answer
//   ════════════════════════════════════════ */
//   const submitAnswer = async (autoSubmit = false) => {
//     try {
//       setLoading(true);
//       stopTimer();

//       // Step 1: stop recording, wait for last chunk
//       await stopSpeechRecognition();

//       let answer = "[No answer - time expired]";

//       // Step 2: transcribe via AssemblyAI (backend)
//       if (audioChunksRef.current.length > 0) {
//         setIsTranscribing(true);
//         try {
//           const mimeType = mediaRecorderRef.current?.mimeType || "audio/webm";
//           const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
//           const formData = new FormData();
//           formData.append("audio", audioBlob, "answer.webm");

//           const { data } = await axios.post(
//             `${import.meta.env.VITE_BACKEND_URL}api/interview/transcribe`,
//             formData,
//             {
//               withCredentials: true,
//               headers: { "Content-Type": "multipart/form-data" },
//               timeout: 60000,
//             }
//           );
//           answer = data.text?.trim() || "[No speech detected]";
//         } catch (transcribeErr) {
//           console.error("Transcription failed:", transcribeErr);
//           answer = autoSubmit ? "[No answer - time expired]" : "[Transcription failed]";
//         } finally {
//           setIsTranscribing(false);
//         }
//       }

//       // Step 3: submit answer to backend
//       const res = await axios.post(
//         `${import.meta.env.VITE_BACKEND_URL}api/interview/${sessionId}/submit-answer`,
//         { answer },
//         { withCredentials: true }
//       );

//       const hasMoreQuestions = res.data.data?.hasMoreQuestions;
//       const nextQ = res.data.data?.nextQuestion;

//       if (hasMoreQuestions && nextQ) {
//         const nextText = nextQ.text;
//         const nextLimit = nextQ.timeLimit || 120;

//         audioChunksRef.current = []; // reset chunks for next question
//         setQuestion(nextText);
//         setQuestionIndex((prev) => prev + 1);
//         setQuestionTimeLimit(nextLimit);

//         speakQuestion(nextText, () => {
//           startTimer(nextLimit);
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

//   /* ════════════════════════════════════════
//      EARLY SUBMIT
//   ════════════════════════════════════════ */
//   const confirmEarlySubmit = async () => {
//     setShowSubmitModal(false);
//     await completeInterview();
//   };

//   /* ════════════════════════════════════════
//      PROCTORING
//   ════════════════════════════════════════ */
//   useEffect(() => {
//     if (!interviewStarted) return;
//     const handleVisibilityChange = () => {
//       if (document.hidden) {
//         setWarningMessage("⚠️ Tab switching is not allowed.");
//         setShowWarning(true);
//         reportProctoringEvent("tab_switch", "medium");
//       }
//     };
//     const handleBlur = () => {
//       setWarningMessage("⚠️ Window lost focus.");
//       setShowWarning(true);
//       reportProctoringEvent("tab_switch", "medium");
//     };
//     document.addEventListener("visibilitychange", handleVisibilityChange);
//     window.addEventListener("blur", handleBlur);
//     return () => {
//       document.removeEventListener("visibilitychange", handleVisibilityChange);
//       window.removeEventListener("blur", handleBlur);
//     };
//   }, [interviewStarted]);

//   const reportProctoringEvent = async (eventType, severity) => {
//     try {
//       await axios.post(
//         `${import.meta.env.VITE_BACKEND_URL}api/interview/${sessionId}/proctoring`,
//         { eventType, severity }, { withCredentials: true }
//       );
//     } catch (err) { console.error("Proctoring error:", err); }
//   };

//   /* ════════════════════════════════════════
//      GATE SCREEN
//   ════════════════════════════════════════ */
//   if (!interviewStarted && permStage !== "granted") {
//     return (
//       <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 p-4 sm:p-6 min-h-[90vh]" style={{ background: "#0f1117" }}>
//         <div className="sm:col-span-1 rounded-xl overflow-hidden relative min-h-[220px] sm:min-h-0" style={{ background: "#111827", border: "1px solid #1f2937" }}>
//           <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" style={{ transform: "scaleX(-1)" }} />
//           <canvas ref={canvasRef} className="hidden" />
//           {permStage !== "granted" && (
//             <div className="absolute inset-0 flex items-center justify-center text-sm" style={{ color: "#4b5563" }}>Camera preview</div>
//           )}
//           {permStage === "granted" && (
//             <div className={`absolute bottom-3 left-3 right-3 text-xs text-center py-2 rounded-lg font-semibold ${faceDetected ? "bg-green-900/80 text-green-300 border border-green-700" : "bg-red-900/80 text-red-300 border border-red-700"}`}>
//               {faceDetected ? "✓ Face detected" : "⚠ No face — sit in front of camera"}
//             </div>
//           )}
//         </div>

//         <div className="sm:col-span-2 rounded-xl p-5 sm:p-6 space-y-5" style={{ background: "#111827", border: "1px solid #1f2937" }}>
//           <div className="text-lg font-semibold" style={{ color: "#f9fafb" }}>Verify your setup before starting</div>
//           <p className="text-sm" style={{ color: "#9ca3af" }}>Camera access, microphone, and a visible face are all required to begin the interview.</p>
//           <div className="space-y-3">
//             <CheckRow label="Camera access" status={permStage === "idle" ? "idle" : cameraReady ? "ok" : "fail"} />
//             <CheckRow label="Microphone access" status={permStage === "idle" ? "idle" : micReady ? "ok" : "fail"} />
//             <CheckRow label="Face visible in camera" status={permStage !== "granted" ? "idle" : faceDetected ? "ok" : "fail"} />
//           </div>
//           {permStage === "denied" && (
//             <div className="text-sm rounded-lg p-3" style={{ background: "#1f0a0a", border: "1px solid #7f1d1d", color: "#fca5a5" }}>
//               Access denied. Allow camera & microphone in your browser settings and reload.
//             </div>
//           )}
//           <div className="flex gap-4 justify-end flex-wrap">
//             {(permStage === "idle" || permStage === "denied") && (
//               <button onClick={requestPermissions} className="px-5 py-2 rounded-lg font-semibold text-sm text-white" style={{ background: "#2563eb" }}>
//                 Allow Camera & Microphone
//               </button>
//             )}
//             {permStage === "requesting" && (
//               <button disabled className="px-5 py-2 rounded-lg text-sm cursor-not-allowed" style={{ background: "#374151", color: "#6b7280" }}>Requesting…</button>
//             )}
//             {permStage === "granted" && (
//               <button
//                 onClick={beginInterview}
//                 disabled={!canBegin || loading}
//                 className="px-5 py-2 rounded-lg font-semibold text-sm transition-colors"
//                 style={{
//                   background: canBegin && !loading ? "#2563eb" : "#1f2937",
//                   color: canBegin && !loading ? "#fff" : "#4b5563",
//                   cursor: canBegin && !loading ? "pointer" : "not-allowed",
//                 }}
//               >
//                 {loading ? "Starting…" : !faceDetected ? "Waiting for face…" : "Begin Interview"}
//               </button>
//             )}
//           </div>
//         </div>
//       </div>
//     );
//   }

//   /* ════════════════════════════════════════
//      MAIN INTERVIEW UI
//   ════════════════════════════════════════ */
//   return (
//     <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 p-4 sm:p-6 min-h-[90vh]" style={{ background: "#0f1117" }}>

//       {/* Camera */}
//       <div className="sm:col-span-1 rounded-xl overflow-hidden relative min-h-[200px] sm:min-h-0" style={{ background: "#111827", border: "1px solid #1f2937" }}>
//         <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" style={{ transform: "scaleX(-1)" }} />
//         <canvas ref={canvasRef} className="hidden" />

//         <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded px-2 py-1" style={{ background: "rgba(0,0,0,0.6)" }}>
//           <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
//           <span className="text-xs font-semibold" style={{ color: "#f87171" }}>LIVE</span>
//         </div>

//         <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded px-2 py-1" style={{ background: "rgba(0,0,0,0.6)" }}>
//           <span className={`w-1.5 h-1.5 rounded-full ${listening ? "bg-green-400 animate-pulse" : "bg-gray-600"}`} />
//           <span className="text-xs font-semibold" style={{ color: listening ? "#86efac" : "#6b7280" }}>
//             {listening ? "MIC ON" : "MIC OFF"}
//           </span>
//         </div>

//         <div className={`absolute bottom-3 left-3 right-3 text-xs text-center py-1.5 rounded-lg font-semibold ${faceDetected ? "bg-green-900/80 text-green-300 border border-green-700" : "bg-red-900/80 text-red-300 border border-red-700"}`}>
//           {faceDetected ? "✓ Face detected" : "⚠ Face not visible"}
//         </div>
//       </div>

//       {/* Answer panel */}
//       <div className="sm:col-span-2 rounded-xl p-5 sm:p-6 space-y-5" style={{ background: "#111827", border: "1px solid #1f2937" }}>

//         {interviewStarted && (
//           <>
//             <div className="flex items-center justify-between">
//               <div className="flex items-center gap-3">
//                 <div
//                   className="flex items-center gap-2 px-3 py-1 rounded-full border text-sm font-bold"
//                   style={{ color: timerColor, borderColor: timerColor + "66", background: timerColor + "11" }}
//                 >
//                   <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: timerColor }} />
//                   {formatTime(timeLeft)}
//                 </div>
//                 <span className="text-xs" style={{ color: "#6b7280" }}>Question {questionIndex + 1} / {totalQuestions}</span>
//               </div>
//               <button
//                 onClick={() => setShowSubmitModal(true)}
//                 className="text-xs font-semibold px-4 py-1.5 rounded-lg transition-colors"
//                 style={{ border: "1px solid #7f1d1d", color: "#f87171", background: "#1f0a0a" }}
//               >
//                 Submit Interview
//               </button>
//             </div>
//             <div className="w-full h-1.5 rounded-full overflow-hidden -mt-2" style={{ background: "#1f2937" }}>
//               <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${timerPct}%`, background: timerColor }} />
//             </div>
//           </>
//         )}

//         {/* Question */}
//         <div className="text-lg font-semibold" style={{ color: "#f9fafb" }}>
//           {question || "Click Begin Interview"}
//         </div>

//         {/* TTS replay */}
//         {interviewStarted && (
//           <button
//             onClick={() => speakQuestion(question)}
//             disabled={isSpeaking}
//             className="text-xs underline disabled:opacity-40 transition-colors"
//             style={{ color: "#6b7280" }}
//           >
//             {isSpeaking ? "🔊 Speaking…" : "🔊 Replay question audio"}
//           </button>
//         )}

//         {/* Status box — recording / transcribing indicator (replaces textarea) */}
//         {interviewStarted && (
//           <div
//             className="w-full h-40 rounded-lg p-4 text-sm flex flex-col items-center justify-center gap-3"
//             style={{ background: "#0f1117", border: "1px solid #1f2937" }}
//           >
//             {isTranscribing ? (
//               <>
//                 <div className="flex gap-1.5">
//                   {[0, 1, 2].map((i) => (
//                     <span key={i} className="w-2 h-2 rounded-full bg-blue-500"
//                       style={{ animation: `bounce 1s ease-in-out ${i * 0.15}s infinite` }} />
//                   ))}
//                 </div>
//                 <p className="text-xs" style={{ color: "#93c5fd" }}>Transcribing your answer…</p>
//               </>
//             ) : listening ? (
//               <>
//                 <div className="flex gap-1 items-end h-6">
//                   {[1, 3, 2, 4, 2, 3, 1].map((h, i) => (
//                     <span key={i} className="w-1 rounded-full bg-green-400"
//                       style={{ height: `${h * 5}px`, animation: `wavepulse 0.6s ease-in-out ${i * 0.1}s infinite alternate` }} />
//                   ))}
//                 </div>
//                 <p className="text-xs" style={{ color: "#86efac" }}>🎙️ Recording your answer…</p>
//                 <p className="text-xs text-center" style={{ color: "#4b5563" }}>
//                   Speak clearly in English. Your answer will be transcribed when you submit.
//                 </p>
//               </>
//             ) : (
//               <p className="text-xs" style={{ color: "#4b5563" }}>
//                 {isSpeaking ? "🔊 Listen to the question…" : "Recording will start after the question is read."}
//               </p>
//             )}
//           </div>
//         )}

//         {/* Buttons */}
//         <div className="flex gap-4 justify-end">
//           {!interviewStarted && (
//             <button
//               onClick={beginInterview}
//               disabled={loading}
//               className="px-5 py-2 rounded-lg text-sm font-semibold text-white"
//               style={{ background: "#2563eb" }}
//             >
//               {loading ? "Starting…" : "Begin Interview"}
//             </button>
//           )}

//           {interviewStarted && (
//             <button
//               onClick={() => submitAnswer(false)}
//               disabled={loading || isTranscribing}
//               className="px-5 py-2 rounded-lg text-sm font-semibold text-white transition-colors"
//               style={{
//                 background: loading || isTranscribing ? "#1f2937" : "#2563eb",
//                 color: loading || isTranscribing ? "#4b5563" : "#fff",
//                 cursor: loading || isTranscribing ? "not-allowed" : "pointer",
//               }}
//             >
//               {isTranscribing
//                 ? "Transcribing…"
//                 : loading
//                 ? "Submitting…"
//                 : questionIndex + 1 === totalQuestions
//                 ? "Submit Final Answer"
//                 : "Submit Answer"}
//             </button>
//           )}
//         </div>
//       </div>

//       {/* Submit Interview Modal */}
//       {showSubmitModal && (
//         <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: "rgba(0,0,0,0.7)" }}>
//           <div className="p-6 rounded-xl w-11/12 max-w-sm text-center" style={{ background: "#111827", border: "1px solid #1f2937" }}>
//             <h2 className="text-base font-semibold mb-2" style={{ color: "#f9fafb" }}>Submit Interview Early?</h2>
//             <p className="text-sm mb-1" style={{ color: "#9ca3af" }}>
//               You're on question <strong style={{ color: "#f9fafb" }}>{questionIndex + 1}</strong> of{" "}
//               <strong style={{ color: "#f9fafb" }}>{totalQuestions}</strong>.
//             </p>
//             {totalQuestions - questionIndex - 1 > 0 && (
//               <p className="text-sm font-medium mb-3" style={{ color: "#f59e0b" }}>
//                 {totalQuestions - questionIndex - 1} question(s) will be left unanswered.
//               </p>
//             )}
//             <p className="text-xs mb-5" style={{ color: "#6b7280" }}>This cannot be undone.</p>
//             <div className="flex gap-3 justify-center">
//               <button onClick={() => setShowSubmitModal(false)} className="px-5 py-2 rounded-lg text-sm font-semibold"
//                 style={{ border: "1px solid #374151", color: "#9ca3af", background: "transparent" }}>
//                 Continue Interview
//               </button>
//               <button onClick={confirmEarlySubmit} className="px-5 py-2 rounded-lg text-sm font-semibold text-white"
//                 style={{ background: "#dc2626" }}>
//                 Yes, Submit Now
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Proctoring Warning Modal */}
//       {showWarning && (
//         <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: "rgba(0,0,0,0.7)" }}>
//           <div className="p-6 rounded-xl w-11/12 max-w-sm text-center" style={{ background: "#111827", border: "1px solid #7f1d1d" }}>
//             <h2 className="text-base font-semibold mb-3" style={{ color: "#f87171" }}>Proctoring Warning</h2>
//             <p className="mb-5 text-sm" style={{ color: "#d1d5db" }}>{warningMessage}</p>
//             <button onClick={() => setShowWarning(false)} className="px-6 py-2 rounded-lg text-sm font-semibold text-white"
//               style={{ background: "#1d4ed8" }}>
//               I Understand
//             </button>
//           </div>
//         </div>
//       )}

//       <style>{`
//         @keyframes bounce {
//           0%, 100% { transform: translateY(0); }
//           50% { transform: translateY(-6px); }
//         }
//         @keyframes wavepulse {
//           from { opacity: 0.4; }
//           to { opacity: 1; }
//         }
//       `}</style>
//     </div>
//   );
// };

// /* ── CheckRow ── */
// const CheckRow = ({ label, status }) => {
//   const cfg = {
//     ok:   { dot: "#22c55e", shadow: "0 0 6px #22c55e", badgeBg: "#052e16", badgeBorder: "#166534", badgeText: "#86efac", bLabel: "✓ Ready" },
//     fail: { dot: "#ef4444", shadow: "none",             badgeBg: "#1f0a0a", badgeBorder: "#7f1d1d", badgeText: "#fca5a5", bLabel: "✗ Not detected" },
//     idle: { dot: "#374151", shadow: "none",             badgeBg: "#111827", badgeBorder: "#1f2937", badgeText: "#6b7280", bLabel: "Waiting…" },
//   };
//   const c = cfg[status];
//   return (
//     <div className="flex items-center gap-3 rounded-lg px-4 py-3" style={{ background: "#0f1117", border: "1px solid #1f2937" }}>
//       <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: c.dot, boxShadow: c.shadow }} />
//       <span className="text-sm flex-1" style={{ color: "#d1d5db" }}>{label}</span>
//       <span className="text-xs px-2 py-0.5 rounded border font-medium" style={{ background: c.badgeBg, borderColor: c.badgeBorder, color: c.badgeText }}>
//         {c.bLabel}
//       </span>
//     </div>
//   );
// };

// export default InterviewRoom;

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useProctoring } from "../hooks/useProctoring";

const InterviewRoom = () => {
  const { sessionId } = useParams();
  const location = useLocation();
  const jobId = location.state?.jobId;
  const navigate = useNavigate();

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const timerRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  /* ── STATE ── */
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [listening, setListening] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [terminated, setTerminated] = useState(false);

  /* ── gate screen state ── */
  const [permStage, setPermStage] = useState("idle");
  const [cameraReady, setCameraReady] = useState(false);
  const [micReady, setMicReady] = useState(false);

  /* ── timer state ── */
  const [timeLeft, setTimeLeft] = useState(120);
  const [questionTimeLimit, setQuestionTimeLimit] = useState(120);

  /* ── question tracking ── */
  const [questionIndex, setQuestionIndex] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);

  /* ════════════════════════════════════════
     PROCTORING HOOK
  ════════════════════════════════════════ */
  const {
    modelsReady,
    captureReferenceFace,
    faceStatus,
    gazeDir,
    phoneAlert,
    showWarning,
    warningMessage,
    dismissWarning,
  } = useProctoring({
    sessionId,
    videoRef,
    enabled: interviewStarted,
    backendUrl: import.meta.env.VITE_BACKEND_URL,
    onTerminate: () => {
      setTerminated(true);
      stopTimer();
      setListening(false);
      mediaRecorderRef.current?.stop();
      window.speechSynthesis?.cancel();
      streamRef.current?.getTracks().forEach((t) => t.stop());
    },
  });

  /* faceDetected = exactly 1 face present (for gate canBegin check) */
  const faceDetected = faceStatus === "ok";

  /* ── cleanup ── */
  useEffect(() => () => {
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  /* ── auto submit on timer end ── */
  useEffect(() => {
    if (timeLeft === 0 && interviewStarted) submitAnswer(true);
  }, [timeLeft]); // eslint-disable-line

  const canBegin = cameraReady && micReady && faceDetected && modelsReady;

  /* ════════════════════════════════════════
     REQUEST PERMISSIONS
  ════════════════════════════════════════ */
  const requestPermissions = async () => {
    setPermStage("requesting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await new Promise((res) => { videoRef.current.onloadedmetadata = res; });
        await videoRef.current.play().catch(() => {});
      }
      setCameraReady(!!stream.getVideoTracks()[0]?.enabled);
      setMicReady(!!stream.getAudioTracks()[0]?.enabled);
      setPermStage("granted");
    } catch (err) {
      console.error(err);
      setPermStage("denied");
    }
  };

  /* ════════════════════════════════════════
     TIMER
  ════════════════════════════════════════ */
  const startTimer = (seconds) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeLeft(seconds);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) { clearInterval(timerRef.current); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const stopTimer = () => { if (timerRef.current) clearInterval(timerRef.current); };

  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  const timerPct = Math.max(0, (timeLeft / questionTimeLimit) * 100);
  const timerColor = timerPct > 50 ? "#16a34a" : timerPct > 25 ? "#d97706" : "#dc2626";

  /* ════════════════════════════════════════
     TTS
  ════════════════════════════════════════ */
  const speakQuestion = (text, onEnd) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.9;
    setIsSpeaking(true);
    utterance.onend = () => { setIsSpeaking(false); if (onEnd) onEnd(); };
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  /* ════════════════════════════════════════
     AUDIO RECORDING
  ════════════════════════════════════════ */
  const startSpeechRecognition = () => {
    try {
      const originalStream = streamRef.current;
      if (!originalStream) { console.error("No media stream"); return; }

      const audioTracks = originalStream.getAudioTracks();
      if (!audioTracks.length) { console.error("No audio track"); return; }

      audioChunksRef.current = [];
      const audioStream = new MediaStream(audioTracks);

      let mimeType = "";
      if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) mimeType = "audio/webm;codecs=opus";
      else if (MediaRecorder.isTypeSupported("audio/webm")) mimeType = "audio/webm";
      else if (MediaRecorder.isTypeSupported("audio/ogg"))  mimeType = "audio/ogg";

      const mr = mimeType
        ? new MediaRecorder(audioStream, { mimeType })
        : new MediaRecorder(audioStream);

      mr.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      mr.onerror  = (e) => console.error("MediaRecorder error:", e);
      mr.onstart  = ()  => setListening(true);

      mr.start(1000);
      mediaRecorderRef.current = mr;
    } catch (err) {
      console.error("startSpeechRecognition error:", err);
    }
  };

  const stopSpeechRecognition = () => {
    return new Promise((resolve) => {
      const mr = mediaRecorderRef.current;
      if (!mr || mr.state === "inactive") { setListening(false); return resolve(); }
      mr.onstop = () => { setListening(false); resolve(); };
      mr.stop();
    });
  };

  /* ════════════════════════════════════════
     BEGIN INTERVIEW
  ════════════════════════════════════════ */
  const beginInterview = async () => {
    /* capture face fingerprint before starting */
    const faceOk = await captureReferenceFace();
    if (!faceOk) {
      alert("Could not register your face. Make sure your face is clearly visible and try again.");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}api/interview/${sessionId}/begin`,
        {}, { withCredentials: true }
      );
      const { currentQuestion, totalQuestions: total } = res.data.data;
      const qText = currentQuestion.text;
      const timeLimit = currentQuestion.timeLimit || 120;

      setQuestion(qText);
      setInterviewStarted(true);   // ← enables live proctoring in hook
      setTotalQuestions(total);
      setQuestionIndex(0);
      setQuestionTimeLimit(timeLimit);

      speakQuestion(qText, () => {
        startTimer(timeLimit);
        startSpeechRecognition();
      });
    } catch (err) {
      console.error(err);
      alert("Failed to start interview");
    } finally {
      setLoading(false);
    }
  };

  /* ════════════════════════════════════════
     COMPLETE INTERVIEW
  ════════════════════════════════════════ */
  const completeInterview = async () => {
    try {
      stopTimer();
      await stopSpeechRecognition();
      window.speechSynthesis?.cancel();
      streamRef.current?.getTracks().forEach((t) => t.stop());

      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}api/interview/${sessionId}/complete`,
        { jobId },
        { withCredentials: true }
      );
      if (res.data.success) navigate(`/score/${sessionId}`);
    } catch (err) {
      console.error("Complete interview error:", err);
      navigate(`/score/${sessionId}`);
    }
  };

  /* ════════════════════════════════════════
     SUBMIT ANSWER
  ════════════════════════════════════════ */
  const submitAnswer = async (autoSubmit = false) => {
    try {
      setLoading(true);
      stopTimer();

      // Step 1: stop recording, wait for last chunk
      await stopSpeechRecognition();

      let answer = "[No answer - time expired]";

      // Step 2: transcribe via backend
      if (audioChunksRef.current.length > 0) {
        setIsTranscribing(true);
        try {
          const mimeType  = mediaRecorderRef.current?.mimeType || "audio/webm";
          const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
          const formData  = new FormData();
          formData.append("audio", audioBlob, "answer.webm");

          const { data } = await axios.post(
            `${import.meta.env.VITE_BACKEND_URL}api/interview/transcribe`,
            formData,
            {
              withCredentials: true,
              headers: { "Content-Type": "multipart/form-data" },
              timeout: 60000,
            }
          );
          answer = data.text?.trim() || "[No speech detected]";
        } catch (transcribeErr) {
          console.error("Transcription failed:", transcribeErr);
          answer = autoSubmit ? "[No answer - time expired]" : "[Transcription failed]";
        } finally {
          setIsTranscribing(false);
        }
      }

      // Step 3: submit answer to backend
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}api/interview/${sessionId}/submit-answer`,
        { answer },
        { withCredentials: true }
      );

      const hasMoreQuestions = res.data.data?.hasMoreQuestions;
      const nextQ            = res.data.data?.nextQuestion;

      if (hasMoreQuestions && nextQ) {
        const nextText  = nextQ.text;
        const nextLimit = nextQ.timeLimit || 120;

        audioChunksRef.current = [];
        setQuestion(nextText);
        setQuestionIndex((prev) => prev + 1);
        setQuestionTimeLimit(nextLimit);

        speakQuestion(nextText, () => {
          startTimer(nextLimit);
          startSpeechRecognition();
        });
      } else {
        await completeInterview();
      }
    } catch (err) {
      console.error(err);
      alert("Failed to submit answer");
    } finally {
      setLoading(false);
    }
  };

  /* ════════════════════════════════════════
     EARLY SUBMIT
  ════════════════════════════════════════ */
  const confirmEarlySubmit = async () => {
    setShowSubmitModal(false);
    await completeInterview();
  };

  /* ════════════════════════════════════════
     GAZE LABEL
  ════════════════════════════════════════ */
  const gazeInfo = {
    center: { text: "👁 Eyes on screen", color: "#86efac" },
    left:   { text: "👁 Looking left",   color: "#fbbf24" },
    right:  { text: "👁 Looking right",  color: "#fbbf24" },
    up:     { text: "👁 Looking up",     color: "#fbbf24" },
  }[gazeDir] ?? { text: "👁 Eyes on screen", color: "#86efac" };

  /* ════════════════════════════════════════
     TERMINATED SCREEN
  ════════════════════════════════════════ */
  if (terminated) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-8"
      style={{ background: "#0f1117" }}>
      <div className="text-6xl">🚫</div>
      <h1 className="text-2xl font-bold" style={{ color: "#f87171" }}>Interview Terminated</h1>
      <p className="text-center max-w-md text-sm leading-6" style={{ color: "#9ca3af" }}>
        Your session was ended due to proctoring violations.
      </p>
      <button onClick={() => navigate("/")}
        className="mt-2 px-6 py-2 rounded-lg text-sm font-semibold text-white"
        style={{ background: "#1d4ed8" }}>
        Return Home
      </button>
    </div>
  );

  /* ════════════════════════════════════════
     GATE SCREEN
  ════════════════════════════════════════ */
  if (!interviewStarted && permStage !== "granted") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 p-4 sm:p-6 min-h-[90vh]"
        style={{ background: "#0f1117" }}>

        <div className="sm:col-span-1 rounded-xl overflow-hidden relative min-h-[220px] sm:min-h-0"
          style={{ background: "#111827", border: "1px solid #1f2937" }}>
          <video ref={videoRef} autoPlay muted playsInline
            className="w-full h-full object-cover" style={{ transform: "scaleX(-1)" }} />
          <canvas ref={canvasRef} className="hidden" />
          {permStage !== "granted" && (
            <div className="absolute inset-0 flex items-center justify-center text-sm"
              style={{ color: "#4b5563" }}>Camera preview</div>
          )}
          {permStage === "granted" && (
            <div className={`absolute bottom-3 left-3 right-3 text-xs text-center py-2 rounded-lg font-semibold
              ${faceDetected
                ? "bg-green-900/80 text-green-300 border border-green-700"
                : "bg-red-900/80 text-red-300 border border-red-700"}`}>
              {faceDetected ? "✓ Face detected" : "⚠ No face — sit in front of camera"}
            </div>
          )}
        </div>

        <div className="sm:col-span-2 rounded-xl p-5 sm:p-6 space-y-5"
          style={{ background: "#111827", border: "1px solid #1f2937" }}>
          <div className="text-lg font-semibold" style={{ color: "#f9fafb" }}>
            Verify your setup before starting
          </div>

          <p className="text-sm" style={{ color: "#9ca3af" }}>
            Camera access, microphone, and a visible face are all required to begin the interview.
            Your face will be registered as the authorised candidate.
          </p>

          <div className="space-y-3">
            <CheckRow label="Camera access"
              status={permStage === "idle" ? "idle" : cameraReady ? "ok" : "fail"} />
            <CheckRow label="Microphone access"
              status={permStage === "idle" ? "idle" : micReady ? "ok" : "fail"} />
            <CheckRow label="Face visible in camera"
              status={permStage !== "granted" ? "idle" : faceDetected ? "ok" : "fail"} />
          </div>

          {/* Models loading indicator */}
          {permStage === "granted" && !modelsReady && (
            <div className="flex items-center gap-2 text-xs rounded-lg px-3 py-2"
              style={{ background: "#1a1f2e", border: "1px solid #2d3748", color: "#6b7280" }}>
              <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse flex-shrink-0" />
              Loading proctoring models… (this takes a few seconds)
            </div>
          )}
          {permStage === "granted" && modelsReady && (
            <div className="flex items-center gap-2 text-xs rounded-lg px-3 py-2"
              style={{ background: "#052e16", border: "1px solid #166534", color: "#86efac" }}>
              <span className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
              Proctoring system ready
            </div>
          )}

          {permStage === "denied" && (
            <div className="text-sm rounded-lg p-3"
              style={{ background: "#1f0a0a", border: "1px solid #7f1d1d", color: "#fca5a5" }}>
              Access denied. Allow camera & microphone in your browser settings and reload.
            </div>
          )}

          <div className="flex gap-4 justify-end flex-wrap">
            {(permStage === "idle" || permStage === "denied") && (
              <button onClick={requestPermissions}
                className="px-5 py-2 rounded-lg font-semibold text-sm text-white"
                style={{ background: "#2563eb" }}>
                Allow Camera & Microphone
              </button>
            )}
            {permStage === "requesting" && (
              <button disabled className="px-5 py-2 rounded-lg text-sm cursor-not-allowed"
                style={{ background: "#374151", color: "#6b7280" }}>Requesting…</button>
            )}
            {permStage === "granted" && (
              <button
                onClick={beginInterview}
                disabled={!canBegin || loading}
                className="px-5 py-2 rounded-lg font-semibold text-sm transition-colors"
                style={{
                  background: canBegin && !loading ? "#2563eb" : "#1f2937",
                  color:      canBegin && !loading ? "#fff"    : "#4b5563",
                  cursor:     canBegin && !loading ? "pointer" : "not-allowed",
                }}>
                {loading       ? "Starting…"        :
                 !modelsReady  ? "Loading models…"  :
                 !faceDetected ? "Waiting for face…":
                                 "Begin Interview"}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ════════════════════════════════════════
     MAIN INTERVIEW UI
  ════════════════════════════════════════ */
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 p-4 sm:p-6 min-h-[90vh]"
      style={{ background: "#0f1117" }}>

      {/* Camera */}
      <div className="sm:col-span-1 rounded-xl overflow-hidden relative min-h-[200px] sm:min-h-0"
        style={{ background: "#111827", border: "1px solid #1f2937" }}>
        <video ref={videoRef} autoPlay muted playsInline
          className="w-full h-full object-cover" style={{ transform: "scaleX(-1)" }} />
        <canvas ref={canvasRef} className="hidden" />

        {/* LIVE badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded px-2 py-1"
          style={{ background: "rgba(0,0,0,0.6)" }}>
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-xs font-semibold" style={{ color: "#f87171" }}>LIVE</span>
        </div>

        {/* MIC badge */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded px-2 py-1"
          style={{ background: "rgba(0,0,0,0.6)" }}>
          <span className={`w-1.5 h-1.5 rounded-full ${listening ? "bg-green-400 animate-pulse" : "bg-gray-600"}`} />
          <span className="text-xs font-semibold" style={{ color: listening ? "#86efac" : "#6b7280" }}>
            {listening ? "MIC ON" : "MIC OFF"}
          </span>
        </div>

        {/* Gaze badge */}
        <div className="absolute top-10 right-3 flex items-center gap-1 rounded px-2 py-1 text-xs font-semibold"
          style={{ background: "rgba(0,0,0,0.6)", color: gazeInfo.color }}>
          {gazeInfo.text}
        </div>

        {/* Phone/object alert */}
        {phoneAlert && (
          <div className="absolute bottom-10 left-3 right-3 text-xs text-center py-1.5 rounded-lg font-semibold"
            style={{ background: "rgba(239,68,68,0.9)", color: "#fff" }}>
            📵 Unauthorized object detected
          </div>
        )}

        {/* Face status badge */}
        <div className={`absolute bottom-3 left-3 right-3 text-xs text-center py-1.5 rounded-lg font-semibold
          ${faceStatus === "ok"       ? "bg-green-900/80 text-green-300 border border-green-700"    : ""}
          ${faceStatus === "none"     ? "bg-red-900/80 text-red-300 border border-red-700"          : ""}
          ${faceStatus === "multi"    ? "bg-yellow-900/80 text-yellow-300 border border-yellow-700" : ""}
          ${faceStatus === "mismatch" ? "bg-red-900/80 text-red-300 border border-red-700"          : ""}`}>
          {faceStatus === "ok"       && "✓ Face verified"}
          {faceStatus === "none"     && "⚠ Face not visible"}
          {faceStatus === "multi"    && "⚠ Multiple faces detected"}
          {faceStatus === "mismatch" && "🚨 Face mismatch"}
        </div>
      </div>

      {/* Answer panel */}
      <div className="sm:col-span-2 rounded-xl p-5 sm:p-6 space-y-5"
        style={{ background: "#111827", border: "1px solid #1f2937" }}>

        {interviewStarted && (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1 rounded-full border text-sm font-bold"
                  style={{ color: timerColor, borderColor: timerColor + "66", background: timerColor + "11" }}>
                  <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: timerColor }} />
                  {formatTime(timeLeft)}
                </div>
                <span className="text-xs" style={{ color: "#6b7280" }}>
                  Question {questionIndex + 1} / {totalQuestions}
                </span>
              </div>
              <button onClick={() => setShowSubmitModal(true)}
                className="text-xs font-semibold px-4 py-1.5 rounded-lg transition-colors"
                style={{ border: "1px solid #7f1d1d", color: "#f87171", background: "#1f0a0a" }}>
                Submit Interview
              </button>
            </div>

            <div className="w-full h-1.5 rounded-full overflow-hidden -mt-2"
              style={{ background: "#1f2937" }}>
              <div className="h-full rounded-full transition-all duration-1000"
                style={{ width: `${timerPct}%`, background: timerColor }} />
            </div>
          </>
        )}

        {/* Question */}
        <div className="text-lg font-semibold" style={{ color: "#f9fafb" }}>
          {question || "Click Begin Interview"}
        </div>

        {/* TTS replay */}
        {interviewStarted && (
          <button onClick={() => speakQuestion(question)} disabled={isSpeaking}
            className="text-xs underline disabled:opacity-40 transition-colors"
            style={{ color: "#6b7280" }}>
            {isSpeaking ? "🔊 Speaking…" : "🔊 Replay question audio"}
          </button>
        )}

        {/* Recording status box */}
        {interviewStarted && (
          <div className="w-full h-40 rounded-lg p-4 text-sm flex flex-col items-center justify-center gap-3"
            style={{ background: "#0f1117", border: "1px solid #1f2937" }}>
            {isTranscribing ? (
              <>
                <div className="flex gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <span key={i} className="w-2 h-2 rounded-full bg-blue-500"
                      style={{ animation: `bounce 1s ease-in-out ${i * 0.15}s infinite` }} />
                  ))}
                </div>
                <p className="text-xs" style={{ color: "#93c5fd" }}>Transcribing your answer…</p>
              </>
            ) : listening ? (
              <>
                <div className="flex gap-1 items-end h-6">
                  {[1, 3, 2, 4, 2, 3, 1].map((h, i) => (
                    <span key={i} className="w-1 rounded-full bg-green-400"
                      style={{ height: `${h * 5}px`, animation: `wavepulse 0.6s ease-in-out ${i * 0.1}s infinite alternate` }} />
                  ))}
                </div>
                <p className="text-xs" style={{ color: "#86efac" }}>🎙️ Recording your answer…</p>
                <p className="text-xs text-center" style={{ color: "#4b5563" }}>
                  Speak clearly in English. Your answer will be transcribed when you submit.
                </p>
              </>
            ) : (
              <p className="text-xs" style={{ color: "#4b5563" }}>
                {isSpeaking
                  ? "🔊 Listen to the question…"
                  : "Recording will start after the question is read."}
              </p>
            )}
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-4 justify-end">
          {!interviewStarted && (
            <button onClick={beginInterview} disabled={loading}
              className="px-5 py-2 rounded-lg text-sm font-semibold text-white"
              style={{ background: "#2563eb" }}>
              {loading ? "Starting…" : "Begin Interview"}
            </button>
          )}
          {interviewStarted && (
            <button onClick={() => submitAnswer(false)}
              disabled={loading || isTranscribing}
              className="px-5 py-2 rounded-lg text-sm font-semibold text-white transition-colors"
              style={{
                background: loading || isTranscribing ? "#1f2937" : "#2563eb",
                color:      loading || isTranscribing ? "#4b5563" : "#fff",
                cursor:     loading || isTranscribing ? "not-allowed" : "pointer",
              }}>
              {isTranscribing
                ? "Transcribing…"
                : loading
                ? "Submitting…"
                : questionIndex + 1 === totalQuestions
                ? "Submit Final Answer"
                : "Submit Answer"}
            </button>
          )}
        </div>
      </div>

      {/* Submit Interview Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50"
          style={{ background: "rgba(0,0,0,0.7)" }}>
          <div className="p-6 rounded-xl w-11/12 max-w-sm text-center"
            style={{ background: "#111827", border: "1px solid #1f2937" }}>
            <h2 className="text-base font-semibold mb-2" style={{ color: "#f9fafb" }}>
              Submit Interview Early?
            </h2>
            <p className="text-sm mb-1" style={{ color: "#9ca3af" }}>
              You're on question{" "}
              <strong style={{ color: "#f9fafb" }}>{questionIndex + 1}</strong> of{" "}
              <strong style={{ color: "#f9fafb" }}>{totalQuestions}</strong>.
            </p>
            {totalQuestions - questionIndex - 1 > 0 && (
              <p className="text-sm font-medium mb-3" style={{ color: "#f59e0b" }}>
                {totalQuestions - questionIndex - 1} question(s) will be left unanswered.
              </p>
            )}
            <p className="text-xs mb-5" style={{ color: "#6b7280" }}>This cannot be undone.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setShowSubmitModal(false)}
                className="px-5 py-2 rounded-lg text-sm font-semibold"
                style={{ border: "1px solid #374151", color: "#9ca3af", background: "transparent" }}>
                Continue Interview
              </button>
              <button onClick={confirmEarlySubmit}
                className="px-5 py-2 rounded-lg text-sm font-semibold text-white"
                style={{ background: "#dc2626" }}>
                Yes, Submit Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Proctoring Warning Modal */}
      {showWarning && (
        <div className="fixed inset-0 flex items-center justify-center z-50"
          style={{ background: "rgba(0,0,0,0.7)" }}>
          <div className="p-6 rounded-xl w-11/12 max-w-sm text-center"
            style={{ background: "#111827", border: "1px solid #7f1d1d" }}>
            <h2 className="text-base font-semibold mb-1" style={{ color: "#f87171" }}>
              Proctoring Warning
            </h2>
            <p className="mb-5 text-sm" style={{ color: "#d1d5db" }}>{warningMessage}</p>
            <button onClick={dismissWarning}
              className="px-6 py-2 rounded-lg text-sm font-semibold text-white"
              style={{ background: "#1d4ed8" }}>
              I Understand
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes wavepulse {
          from { opacity: 0.4; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

/* ── CheckRow ── */
const CheckRow = ({ label, status }) => {
  const cfg = {
    ok:   { dot: "#22c55e", shadow: "0 0 6px #22c55e", badgeBg: "#052e16", badgeBorder: "#166534", badgeText: "#86efac", bLabel: "✓ Ready" },
    fail: { dot: "#ef4444", shadow: "none",             badgeBg: "#1f0a0a", badgeBorder: "#7f1d1d", badgeText: "#fca5a5", bLabel: "✗ Not detected" },
    idle: { dot: "#374151", shadow: "none",             badgeBg: "#111827", badgeBorder: "#1f2937", badgeText: "#6b7280", bLabel: "Waiting…" },
  };
  const c = cfg[status] || cfg.idle;
  return (
    <div className="flex items-center gap-3 rounded-lg px-4 py-3"
      style={{ background: "#0f1117", border: "1px solid #1f2937" }}>
      <span className="w-3 h-3 rounded-full flex-shrink-0"
        style={{ background: c.dot, boxShadow: c.shadow }} />
      <span className="text-sm flex-1" style={{ color: "#d1d5db" }}>{label}</span>
      <span className="text-xs px-2 py-0.5 rounded border font-medium"
        style={{ background: c.badgeBg, borderColor: c.badgeBorder, color: c.badgeText }}>
        {c.bLabel}
      </span>
    </div>
  );
};

export default InterviewRoom;