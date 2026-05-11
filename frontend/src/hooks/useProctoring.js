// // 
// import { useEffect, useRef, useState, useCallback } from "react";
// import axios from "axios";
// import * as faceapi from "face-api.js";

// const DETECT_MS       = 1500;
// const MATCH_THRESHOLD = 0.52;
// const DEBOUNCE_MS     = 7000;
// const MODEL_URL       = "/models";

// export const MAX_VIOLATIONS = Infinity; // termination removed

// /* ─── Gaze estimator ─────────────────────────────────────────── */
// const estimateGaze = (landmarks) => {
//   try {
//     const lEye = landmarks.getLeftEye();
//     const rEye = landmarks.getRightEye();
//     const nose = landmarks.getNose();
//     const midX = (lEye[0].x + rEye[3].x) / 2;
//     const midY = (lEye[0].y + rEye[3].y) / 2;
//     const dx   = nose[3].x - midX;
//     const dy   = nose[3].y - midY;
//     if (Math.abs(dx) > 26) return dx > 0 ? "right" : "left";
//     if (dy < -16) return "up";
//     return "center";
//   } catch { return "center"; }
// };

// const euclidean = (a, b) => {
//   let s = 0;
//   for (let i = 0; i < a.length; i++) s += (a[i] - b[i]) ** 2;
//   return Math.sqrt(s);
// };

// const EVENT_CFG = {
//   face_absence:       { sev: "high",   msg: "⚠️ Your face is not visible. Please sit directly in front of the camera." },
//   multiple_faces:     { sev: "high",   msg: "🚨 Multiple faces detected. Only you should be in the frame." },
//   face_inconsistency: { sev: "high",   msg: "🚨 Face mismatch! The person on screen doesn't match the registered candidate." },
//   look_away:          { sev: "medium", msg: "👁 Please keep your eyes on the screen." },
//   object_detected:    { sev: "high",   msg: "📵 Unauthorized object detected. Please remove it from view." },
//   tab_switch:         { sev: "medium", msg: "⚠️ Tab switching is not allowed during the interview." },
//   background_change:  { sev: "medium", msg: "⚠️ Please keep the interview window in focus." },
// };

// /* ══════════════════════════════════════════════════════════════
//    IMPROVED OBJECT DETECTION
//    — Detects phones (bright glowing rectangle), books/papers
//      (high edge density in non-face regions), and other flat
//      rectangular objects. Works on mobile too.
// ══════════════════════════════════════════════════════════════ */
// const buildObjectDetector = () => {
//   const canvas = document.createElement("canvas");

//   return (video, faceBoxes = []) => {
//     try {
//       const vw = video.videoWidth;
//       const vh = video.videoHeight;
//       if (!vw || !vh) return false;

//       const SAMPLE = 64;
//       canvas.width  = SAMPLE;
//       canvas.height = SAMPLE;
//       const ctx = canvas.getContext("2d", { willReadFrequently: true });

//       // Zones: avoid centre (face area), focus on hands/lap/sides
//       // Each zone: [srcX%, srcY%, srcW%, srcH%]
//       const zones = [
//         [0.0,  0.55, 0.45, 0.45], // bottom-left  (lap / book)
//         [0.55, 0.55, 0.45, 0.45], // bottom-right (phone in hand)
//         [0.0,  0.1,  0.25, 0.50], // left edge    (paper on desk)
//         [0.75, 0.1,  0.25, 0.50], // right edge
//         [0.2,  0.65, 0.60, 0.35], // bottom centre (desk surface)
//       ];

//       for (const [xp, yp, wp, hp] of zones) {
//         const sx = xp * vw, sy = yp * vh, sw = wp * vw, sh = hp * vh;
//         ctx.drawImage(video, sx, sy, sw, sh, 0, 0, SAMPLE, SAMPLE);
//         const { data } = ctx.getImageData(0, 0, SAMPLE, SAMPLE);

//         let brightPx = 0;  // glowing screen pixels
//         let edgePx   = 0;  // sharp-edge pixels (book/paper)
//         let bluePx   = 0;  // blue-tinted bright (phone screen glow)

//         const total = SAMPLE * SAMPLE;

//         for (let i = 0; i < data.length; i += 4) {
//           const r = data[i], g = data[i + 1], b = data[i + 2];
//           const lum = 0.299 * r + 0.587 * g + 0.114 * b;

//           if (lum > 190) brightPx++;
//           // Blue-ish bright = phone screen
//           if (lum > 160 && b > r && b > g) bluePx++;

//           // Horizontal edge (sharp luminance jump to next pixel)
//           if (i + 8 < data.length) {
//             const r2 = data[i+4], g2 = data[i+5], b2 = data[i+6];
//             const lum2 = 0.299 * r2 + 0.587 * g2 + 0.114 * b2;
//             if (Math.abs(lum - lum2) > 55) edgePx++;
//           }
//           // Vertical edge (sharp jump to pixel directly below)
//           const below = i + SAMPLE * 4;
//           if (below < data.length) {
//             const rb = data[below], gb = data[below+1], bb = data[below+2];
//             const lumB = 0.299 * rb + 0.587 * gb + 0.114 * bb;
//             if (Math.abs(lum - lumB) > 55) edgePx++;
//           }
//         }

//         const brightRatio = brightPx / total;
//         const edgeRatio   = edgePx   / (total * 2); // *2 because we count both axes
//         const blueRatio   = bluePx   / total;

//         // Phone screen: very bright OR blue-glowing
//         if (brightRatio > 0.28 || blueRatio > 0.12) return true;
//         // Book / paper / document: high edge density but not just noise
//         if (edgeRatio > 0.22 && brightRatio < 0.5) return true;
//       }
//       return false;
//     } catch { return false; }
//   };
// };

// /* ══════════════════════════════════════════════════════════════
//    HOOK
// ══════════════════════════════════════════════════════════════ */
// export function useProctoring({
//   sessionId,
//   videoRef,
//   enabled = false,
//   backendUrl = "",
//   onTerminate, // kept in signature for compatibility, never called
// }) {
//   const [modelsReady,    setModelsReady]    = useState(false);
//   const [showWarning,    setShowWarning]    = useState(false);
//   const [warningMessage, setWarningMessage] = useState("");
//   const [faceStatus,     setFaceStatus]     = useState("none");
//   const [gazeDir,        setGazeDir]        = useState("center");
//   const [phoneAlert,     setPhoneAlert]     = useState(false);

//   const modelsOk      = useRef(false);
//   const refDescriptor = useRef(null);
//   const detectRef     = useRef(null);
//   const lastEventRef  = useRef({});
//   const sessionRef    = useRef(sessionId);
//   const detectObject  = useRef(buildObjectDetector()).current;

//   useEffect(() => { sessionRef.current = sessionId; }, [sessionId]);

//   /* ── Load models ── */
//   useEffect(() => {
//     if (modelsOk.current) return;
//     (async () => {
//       try {
//         await Promise.all([
//           faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
//           faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
//           faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
//         ]);
//         modelsOk.current = true;
//         setModelsReady(true);
//         console.log("[Proctoring] Models ready ✓");
//       } catch (err) {
//         console.error("[Proctoring] Model load failed:", err);
//       }
//     })();
//   }, []);

//   /* ── Report to backend ── */
//   const report = useCallback(async (eventType, severity, details = "") => {
//     if (!sessionRef.current) return;
//     try {
//       await axios.post(
//         `${backendUrl}api/interview/${sessionRef.current}/proctoring`,
//         { eventType, severity, details },
//         { withCredentials: true }
//       );
//     } catch (e) {
//       console.error("[Proctoring] report failed:", e?.message);
//     }
//   }, [backendUrl]);

//   /* ── Fire event: debounce → warn → save ── */
//   const fireEvent = useCallback((eventType, details = "") => {
//     const now = Date.now();
//     if (now - (lastEventRef.current[eventType] || 0) < DEBOUNCE_MS) return;
//     lastEventRef.current[eventType] = now;

//     const cfg = EVENT_CFG[eventType] || { sev: "medium", msg: "⚠️ Proctoring alert." };
//     setWarningMessage(cfg.msg);
//     setShowWarning(true);
//     report(eventType, cfg.sev, details);
//   }, [report]);

//   /* ── Capture reference face ── */
//   const captureReferenceFace = useCallback(async () => {
//     const video = videoRef.current;
//     if (!video || !modelsOk.current) return false;
//     try {
//       const opts = new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.35 });
//       const det  = await faceapi
//         .detectSingleFace(video, opts)
//         .withFaceLandmarks()
//         .withFaceDescriptor();
//       if (!det) return false;
//       refDescriptor.current = det.descriptor;
//       console.log("[Proctoring] Reference face registered ✓");
//       return true;
//     } catch (e) {
//       console.error("[Proctoring] captureReferenceFace error:", e);
//       return false;
//     }
//   }, [videoRef]);

//   /* ── Detection loop ── */
//   useEffect(() => {
//     if (!modelsReady) return;
//     clearInterval(detectRef.current);

//     detectRef.current = setInterval(async () => {
//       const video = videoRef.current;
//       if (!video || video.readyState < 3 || video.videoWidth === 0) return;

//       try {
//         const opts = new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.25 });
//         const detections = await faceapi
//           .detectAllFaces(video, opts)
//           .withFaceLandmarks()
//           .withFaceDescriptors();

//         const count = detections.length;

//         if (count === 0) {
//           setFaceStatus("none");
//           // ✅ Correct: sends "face_absence" — stored in faceAbsences
//           if (enabled) fireEvent("face_absence", "No face detected in frame");

//         } else if (count > 1) {
//           setFaceStatus("multi");
//           // ✅ Correct: sends "multiple_faces" — stored in multipleFacesDetected
//           if (enabled) fireEvent("multiple_faces", `${count} faces in frame`);

//         } else {
//           if (refDescriptor.current && detections[0].descriptor) {
//             const dist    = euclidean(detections[0].descriptor, refDescriptor.current);
//             const matched = dist <= MATCH_THRESHOLD;
//             setFaceStatus(matched ? "ok" : "mismatch");
//             if (!matched && enabled)
//               fireEvent("face_inconsistency", `dist=${dist.toFixed(3)}`);
//           } else {
//             setFaceStatus("ok");
//           }

//           if (detections[0].landmarks) {
//             const gaze = estimateGaze(detections[0].landmarks);
//             setGazeDir(gaze);
//             if (gaze !== "center" && enabled)
//               fireEvent("look_away", `gaze=${gaze}`);
//           }
//         }

//         // Object detection (runs regardless of face count)
//         const hasObj = detectObject(video);
//         setPhoneAlert(hasObj);
//         if (hasObj && enabled)
//           fireEvent("object_detected", "Suspicious object in frame");

//       } catch { /* silent frame skip */ }
//     }, DETECT_MS);

//     return () => clearInterval(detectRef.current);
//   }, [modelsReady, enabled, videoRef, fireEvent, detectObject]);

//   /* ── Tab / window blur ── */
//   useEffect(() => {
//     if (!enabled) return;
//     const onHide = () => fireEvent("tab_switch",        "Tab hidden");
//     const onBlur = () => fireEvent("background_change", "Window lost focus");
//     const visH   = () => { if (document.hidden) onHide(); };
//     document.addEventListener("visibilitychange", visH);
//     window.addEventListener("blur", onBlur);
//     return () => {
//       document.removeEventListener("visibilitychange", visH);
//       window.removeEventListener("blur", onBlur);
//     };
//   }, [enabled, fireEvent]);

//   useEffect(() => () => clearInterval(detectRef.current), []);

//   return {
//     modelsReady,
//     captureReferenceFace,
//     faceStatus,
//     gazeDir,
//     phoneAlert,
//     violations: 0,         // kept for UI compatibility
//     showWarning,
//     warningMessage,
//     dismissWarning: () => setShowWarning(false),
//   };
// }

// useProctoring.js — Fixed object detection (reduced false positives)
import { useEffect, useRef, useState, useCallback } from "react";
import axios from "axios";
import * as faceapi from "face-api.js";

const DETECT_MS       = 1500;
const MATCH_THRESHOLD = 0.52;
const DEBOUNCE_MS     = 7000;
const MODEL_URL       = "/models";

export const MAX_VIOLATIONS = Infinity; // termination removed

/* ─── Gaze estimator ─────────────────────────────────────────── */
const estimateGaze = (landmarks) => {
  try {
    const lEye = landmarks.getLeftEye();
    const rEye = landmarks.getRightEye();
    const nose = landmarks.getNose();
    const midX = (lEye[0].x + rEye[3].x) / 2;
    const midY = (lEye[0].y + rEye[3].y) / 2;
    const dx   = nose[3].x - midX;
    const dy   = nose[3].y - midY;
    if (Math.abs(dx) > 26) return dx > 0 ? "right" : "left";
    if (dy < -16) return "up";
    return "center";
  } catch { return "center"; }
};

const euclidean = (a, b) => {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += (a[i] - b[i]) ** 2;
  return Math.sqrt(s);
};

const EVENT_CFG = {
  face_absence:       { sev: "high",   msg: "⚠️ Your face is not visible. Please sit directly in front of the camera." },
  multiple_faces:     { sev: "high",   msg: "🚨 Multiple faces detected. Only you should be in the frame." },
  face_inconsistency: { sev: "high",   msg: "🚨 Face mismatch! The person on screen doesn't match the registered candidate." },
  look_away:          { sev: "medium", msg: "👁 Please keep your eyes on the screen." },
  object_detected:    { sev: "high",   msg: "📵 Unauthorized object detected. Please remove it from view." },
  tab_switch:         { sev: "medium", msg: "⚠️ Tab switching is not allowed during the interview." },
  background_change:  { sev: "medium", msg: "⚠️ Please keep the interview window in focus." },
};

/* ══════════════════════════════════════════════════════════════
   IMPROVED OBJECT DETECTION — v2
   Key fixes:
   1. Raised edgeRatio threshold: 0.22 → 0.42 (clothes/shelves no longer trigger)
   2. Raised brightRatio threshold: 0.28 → 0.45 (window light no longer triggers)
   3. Raised blueRatio threshold: 0.12 → 0.18
   4. Background calibration: captures a baseline on first N frames and
      only flags regions that CHANGED significantly from baseline
   5. Temporal filtering: object must be detected in 3 consecutive
      intervals before firing (eliminates single-frame noise)
   6. Face zone exclusion: skips the top-centre zone where the
      user's face and clothing are, to avoid striped-top false positives
══════════════════════════════════════════════════════════════ */
const buildObjectDetector = () => {
  const canvas  = document.createElement("canvas");
  const SAMPLE  = 64;

  // Background calibration state
  let baseline       = null;   // Float32Array of luminance values per zone
  let calibFrames    = 0;
  const CALIB_FRAMES = 8;      // collect 8 frames (~12s) before trusting baseline

  // Temporal filter: require N consecutive positives before flagging
  let consecutiveHits = 0;
  const HIT_THRESHOLD = 3;     // must trigger 3 frames in a row (~4.5s)

  // Zones: [srcX%, srcY%, srcW%, srcH%]
  // Deliberately EXCLUDE top-centre (face + torso with clothes)
  const zones = [
    [0.0,  0.60, 0.40, 0.40], // bottom-left  (lap / book)
    [0.60, 0.60, 0.40, 0.40], // bottom-right (phone in hand)
    [0.0,  0.05, 0.20, 0.55], // far-left edge (paper on desk)
    [0.80, 0.05, 0.20, 0.55], // far-right edge
    [0.25, 0.70, 0.50, 0.30], // bottom centre (desk surface)
  ];

  const sampleZone = (ctx, video, xp, yp, wp, hp) => {
    const vw = video.videoWidth, vh = video.videoHeight;
    ctx.drawImage(video, xp * vw, yp * vh, wp * vw, hp * vh, 0, 0, SAMPLE, SAMPLE);
    return ctx.getImageData(0, 0, SAMPLE, SAMPLE).data;
  };

  const zoneLuminanceMean = (data) => {
    let sum = 0;
    for (let i = 0; i < data.length; i += 4) {
      sum += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    }
    return sum / (data.length / 4);
  };

  const analyzeZone = (data) => {
    let brightPx = 0, edgePx = 0, bluePx = 0;
    const total  = SAMPLE * SAMPLE;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i + 1], b = data[i + 2];
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;

      if (lum > 210) brightPx++;                        // only very bright (was 190)
      if (lum > 175 && b > r * 1.15 && b > g * 1.15)   // stricter blue check
        bluePx++;

      // Horizontal edge
      if (i + 8 < data.length) {
        const lum2 = 0.299 * data[i+4] + 0.587 * data[i+5] + 0.114 * data[i+6];
        if (Math.abs(lum - lum2) > 65) edgePx++;        // was 55
      }
      // Vertical edge
      const below = i + SAMPLE * 4;
      if (below < data.length) {
        const lumB = 0.299 * data[below] + 0.587 * data[below+1] + 0.114 * data[below+2];
        if (Math.abs(lum - lumB) > 65) edgePx++;
      }
    }

    return {
      brightRatio: brightPx / total,
      edgeRatio:   edgePx   / (total * 2),
      blueRatio:   bluePx   / total,
    };
  };

  return (video) => {
    try {
      const vw = video.videoWidth, vh = video.videoHeight;
      if (!vw || !vh) return false;

      canvas.width  = SAMPLE;
      canvas.height = SAMPLE;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });

      // ── Calibration phase: build background baseline ──────────
      if (calibFrames < CALIB_FRAMES) {
        if (!baseline) baseline = new Float32Array(zones.length);
        zones.forEach(([xp, yp, wp, hp], zi) => {
          const data = sampleZone(ctx, video, xp, yp, wp, hp);
          // Running average
          baseline[zi] = (baseline[zi] * calibFrames + zoneLuminanceMean(data)) / (calibFrames + 1);
        });
        calibFrames++;
        consecutiveHits = 0;
        return false; // never flag during calibration
      }

      // ── Detection phase ───────────────────────────────────────
      let zoneTriggered = false;

      for (let zi = 0; zi < zones.length; zi++) {
        const [xp, yp, wp, hp] = zones[zi];
        const data = sampleZone(ctx, video, xp, yp, wp, hp);
        const { brightRatio, edgeRatio, blueRatio } = analyzeZone(data);

        // Background-change delta: if luminance shifted a lot from
        // baseline this zone has something new in it
        const currentMean = zoneLuminanceMean(data);
        const delta       = Math.abs(currentMean - baseline[zi]);
        const bgChanged   = delta > 35; // >35 lum units = new object present

        // Phone screen: very bright AND background changed
        const isPhone = (brightRatio > 0.45 || blueRatio > 0.18) && bgChanged;

        // Book/paper/document:
        //   - high edge density (raised from 0.22 → 0.42)
        //   - not just clothing noise (also require bg change)
        const isBook  = edgeRatio > 0.42 && brightRatio < 0.55 && bgChanged;

        if (isPhone || isBook) {
          zoneTriggered = true;
          break;
        }
      }

      // ── Temporal filter ───────────────────────────────────────
      if (zoneTriggered) {
        consecutiveHits++;
      } else {
        consecutiveHits = 0;
      }

      return consecutiveHits >= HIT_THRESHOLD;

    } catch { return false; }
  };
};

/* ══════════════════════════════════════════════════════════════
   HOOK
══════════════════════════════════════════════════════════════ */
export function useProctoring({
  sessionId,
  videoRef,
  enabled = false,
  backendUrl = "",
  onTerminate,
}) {
  const [modelsReady,    setModelsReady]    = useState(false);
  const [showWarning,    setShowWarning]    = useState(false);
  const [warningMessage, setWarningMessage] = useState("");
  const [faceStatus,     setFaceStatus]     = useState("none");
  const [gazeDir,        setGazeDir]        = useState("center");
  const [phoneAlert,     setPhoneAlert]     = useState(false);

  const modelsOk      = useRef(false);
  const refDescriptor = useRef(null);
  const detectRef     = useRef(null);
  const lastEventRef  = useRef({});
  const sessionRef    = useRef(sessionId);
  const detectObject  = useRef(buildObjectDetector()).current;

  useEffect(() => { sessionRef.current = sessionId; }, [sessionId]);

  /* ── Load models ── */
  useEffect(() => {
    if (modelsOk.current) return;
    (async () => {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);
        modelsOk.current = true;
        setModelsReady(true);
        console.log("[Proctoring] Models ready ✓");
      } catch (err) {
        console.error("[Proctoring] Model load failed:", err);
      }
    })();
  }, []);

  /* ── Report to backend ── */
  const report = useCallback(async (eventType, severity, details = "") => {
    if (!sessionRef.current) return;
    try {
      await axios.post(
        `${backendUrl}api/interview/${sessionRef.current}/proctoring`,
        { eventType, severity, details },
        { withCredentials: true }
      );
    } catch (e) {
      console.error("[Proctoring] report failed:", e?.message);
    }
  }, [backendUrl]);

  /* ── Fire event: debounce → warn → save ── */
  const fireEvent = useCallback((eventType, details = "") => {
    const now = Date.now();
    if (now - (lastEventRef.current[eventType] || 0) < DEBOUNCE_MS) return;
    lastEventRef.current[eventType] = now;

    const cfg = EVENT_CFG[eventType] || { sev: "medium", msg: "⚠️ Proctoring alert." };
    setWarningMessage(cfg.msg);
    setShowWarning(true);
    report(eventType, cfg.sev, details);
  }, [report]);

  /* ── Capture reference face ── */
  const captureReferenceFace = useCallback(async () => {
    const video = videoRef.current;
    if (!video || !modelsOk.current) return false;
    try {
      const opts = new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.35 });
      const det  = await faceapi
        .detectSingleFace(video, opts)
        .withFaceLandmarks()
        .withFaceDescriptor();
      if (!det) return false;
      refDescriptor.current = det.descriptor;
      console.log("[Proctoring] Reference face registered ✓");
      return true;
    } catch (e) {
      console.error("[Proctoring] captureReferenceFace error:", e);
      return false;
    }
  }, [videoRef]);

  /* ── Detection loop ── */
  useEffect(() => {
    if (!modelsReady) return;
    clearInterval(detectRef.current);

    detectRef.current = setInterval(async () => {
      const video = videoRef.current;
      if (!video || video.readyState < 3 || video.videoWidth === 0) return;

      try {
        const opts = new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.25 });
        const detections = await faceapi
          .detectAllFaces(video, opts)
          .withFaceLandmarks()
          .withFaceDescriptors();

        const count = detections.length;

        if (count === 0) {
          setFaceStatus("none");
          if (enabled) fireEvent("face_absence", "No face detected in frame");

        } else if (count > 1) {
          setFaceStatus("multi");
          if (enabled) fireEvent("multiple_faces", `${count} faces in frame`);

        } else {
          if (refDescriptor.current && detections[0].descriptor) {
            const dist    = euclidean(detections[0].descriptor, refDescriptor.current);
            const matched = dist <= MATCH_THRESHOLD;
            setFaceStatus(matched ? "ok" : "mismatch");
            if (!matched && enabled)
              fireEvent("face_inconsistency", `dist=${dist.toFixed(3)}`);
          } else {
            setFaceStatus("ok");
          }

          if (detections[0].landmarks) {
            const gaze = estimateGaze(detections[0].landmarks);
            setGazeDir(gaze);
            if (gaze !== "center" && enabled)
              fireEvent("look_away", `gaze=${gaze}`);
          }
        }

        // Object detection (runs regardless of face count)
        const hasObj = detectObject(video);
        setPhoneAlert(hasObj);
        if (hasObj && enabled)
          fireEvent("object_detected", "Suspicious object in frame");

      } catch { /* silent frame skip */ }
    }, DETECT_MS);

    return () => clearInterval(detectRef.current);
  }, [modelsReady, enabled, videoRef, fireEvent, detectObject]);

  /* ── Tab / window blur ── */
  useEffect(() => {
    if (!enabled) return;
    const onHide = () => fireEvent("tab_switch",        "Tab hidden");
    const onBlur = () => fireEvent("background_change", "Window lost focus");
    const visH   = () => { if (document.hidden) onHide(); };
    document.addEventListener("visibilitychange", visH);
    window.addEventListener("blur", onBlur);
    return () => {
      document.removeEventListener("visibilitychange", visH);
      window.removeEventListener("blur", onBlur);
    };
  }, [enabled, fireEvent]);

  useEffect(() => () => clearInterval(detectRef.current), []);

  return {
    modelsReady,
    captureReferenceFace,
    faceStatus,
    gazeDir,
    phoneAlert,
    violations: 0,
    showWarning,
    warningMessage,
    dismissWarning: () => setShowWarning(false),
  };
}