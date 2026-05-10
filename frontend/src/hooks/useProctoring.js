// /**
//  * useProctoring.js  — @vladmandic/face-api + COCO-SSD edition
//  * Fixed: withFaceLandmarks() — no argument (vladmandic API)
//  * Fixed: collectSeedFrame — no argument to withFaceLandmarks
//  * Fixed: face absence false alarms — higher grace period
//  */

// import { useEffect, useRef, useState, useCallback } from "react";
// import * as faceapi from "@vladmandic/face-api";
// import * as cocoSsd from "@tensorflow-models/coco-ssd";
// import axios from "axios";

// /* ══════════════════════════════════════════════════════════════════
//    TUNABLES
// ══════════════════════════════════════════════════════════════════ */
// const MODELS_PATH            = "/models";
// const SCAN_INTERVAL_MS       = 1500;
// const REPORT_COOLDOWN_MS     = 9000;
// const FACE_ABSENCE_GRACE     = 4;      // ← raised: 4 consecutive misses (~6s) before warning
// const LOOK_AWAY_GRACE        = 3;
// const LOOK_AWAY_YAW_DEG      = 30;    // ← slightly more lenient
// const DESCRIPTOR_DISTANCE    = 0.50;  // ← slightly more lenient for lighting variation
// const DESCRIPTOR_SEED_FRAMES = 6;     // ← more seed frames = more stable reference
// const DESCRIPTOR_EMA_ALPHA   = 0.06;
// const FORBIDDEN_OBJECTS      = new Set(["cell phone", "book", "laptop"]);
// const OBJECT_MIN_CONFIDENCE  = 0.60;  // ← higher threshold = fewer false positives
// /* ══════════════════════════════════════════════════════════════════ */

// function cosineDistance(a, b) {
//   let dot = 0, na = 0, nb = 0;
//   for (let i = 0; i < a.length; i++) {
//     dot += a[i] * b[i];
//     na  += a[i] * a[i];
//     nb  += b[i] * b[i];
//   }
//   return 1 - dot / (Math.sqrt(na) * Math.sqrt(nb));
// }

// function estimateYawDeg(landmarks) {
//   const pts      = landmarks.positions;
//   const noseTip  = pts[30];
//   const leftEye  = pts[36];
//   const rightEye = pts[45];
//   const eyeSpan  = Math.abs(rightEye.x - leftEye.x);
//   if (eyeSpan < 1) return 0;
//   const eyeMidX  = (leftEye.x + rightEye.x) / 2;
//   return Math.abs(((noseTip.x - eyeMidX) / eyeSpan) * 90);
// }

// /* ══════════════════════════════════════════════════════════════════
//    HOOK
// ══════════════════════════════════════════════════════════════════ */
// export function useProctoring({ sessionId, videoRef, enabled, backendUrl }) {

//   const [showWarning,    setShowWarning]    = useState(false);
//   const [warningMessage, setWarningMessage] = useState("");
//   const [modelsReady,    setModelsReady]    = useState(false);

//   const scanRef            = useRef(null);
//   const lastReportRef      = useRef({});
//   const modelsLoadedRef    = useRef(false);
//   const cocoModelRef       = useRef(null);
//   const absenceCountRef    = useRef(0);
//   const lookAwayCountRef   = useRef(0);
//   const seedDescriptorsRef = useRef([]);
//   const refDescriptorRef   = useRef(null);
//   const scanningRef        = useRef(false); // prevent overlapping scans

//   const warn = useCallback((msg) => {
//     setWarningMessage(msg);
//     setShowWarning(true);
//   }, []);

//   const dismissWarning = useCallback(() => setShowWarning(false), []);

//   const report = useCallback(async (eventType, severity, details = {}) => {
//     if (!sessionId) return;
//     const now  = Date.now();
//     const last = lastReportRef.current[eventType] ?? 0;
//     if (now - last < REPORT_COOLDOWN_MS) return;
//     lastReportRef.current[eventType] = now;
//     try {
//       await axios.post(
//         `${backendUrl}api/interview/${sessionId}/proctoring`,
//         { eventType, severity, details },
//         { withCredentials: true }
//       );
//     } catch (err) {
//       console.error("[Proctoring] report failed:", err);
//     }
//   }, [sessionId, backendUrl]);

//   /* ── MODEL LOADING ── */
//   useEffect(() => {
//     if (modelsLoadedRef.current) return;
//     (async () => {
//       try {
//         await Promise.all([
//           faceapi.nets.tinyFaceDetector.loadFromUri(MODELS_PATH),
//           faceapi.nets.faceLandmark68Net.loadFromUri(MODELS_PATH),   // ← full 68 net (vladmandic)
//           faceapi.nets.faceRecognitionNet.loadFromUri(MODELS_PATH),
//         ]);
//         cocoModelRef.current    = await cocoSsd.load({ base: "mobilenet_v2" });
//         modelsLoadedRef.current = true;
//         setModelsReady(true);
//         console.log("[Proctoring] Models ready ✓");
//       } catch (err) {
//         console.error("[Proctoring] Model load error:", err);
//       }
//     })();
//   }, []);

//   /* ── SEED FRAME COLLECTOR ── */
//   const collectSeedFrame = useCallback(async (video) => {
//     const det = await faceapi
//       .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions({ scoreThreshold: 0.5 }))
//       .withFaceLandmarks()          // ← NO argument — vladmandic API
//       .withFaceDescriptor();

//     if (!det?.descriptor) return;
//     seedDescriptorsRef.current.push(det.descriptor);

//     if (seedDescriptorsRef.current.length >= DESCRIPTOR_SEED_FRAMES) {
//       const len  = seedDescriptorsRef.current[0].length;
//       const mean = new Float32Array(len);
//       for (const d of seedDescriptorsRef.current) {
//         for (let i = 0; i < len; i++) mean[i] += d[i];
//       }
//       for (let i = 0; i < len; i++) mean[i] /= seedDescriptorsRef.current.length;
//       refDescriptorRef.current = mean;
//       console.log("[Proctoring] Reference descriptor locked ✓");
//     }
//   }, []);

//   /* ── MAIN SCAN ── */
//   const runScan = useCallback(async () => {
//     if (!modelsLoadedRef.current) return;
//     if (scanningRef.current) return;          // skip if previous scan still running
//     const video = videoRef.current;
//     if (!video || video.readyState < 2) return;

//     scanningRef.current = true;
//     try {
//       const options = new faceapi.TinyFaceDetectorOptions({ scoreThreshold: 0.40 });

//       /* detect all faces — NO argument to withFaceLandmarks() */
//       const detections = await faceapi
//         .detectAllFaces(video, options)
//         .withFaceLandmarks()        // ← NO argument
//         .withFaceDescriptors();

//       const faceCount = detections.length;

//       /* 1 ── FACE ABSENCE */
//       if (faceCount === 0) {
//         absenceCountRef.current++;
//         if (absenceCountRef.current >= FACE_ABSENCE_GRACE) {
//           warn("⚠️ No face detected. Please stay visible in the camera.");
//           report("face_absence", "medium", { consecutive: absenceCountRef.current });
//           absenceCountRef.current = 0;
//         }
//         return;
//       }
//       absenceCountRef.current = 0;

//       /* 2 ── MULTIPLE FACES */
//       if (faceCount >= 2) {
//         warn(`⚠️ ${faceCount} faces detected. Only the candidate should be on camera.`);
//         report("multiple_faces", "high", { faceCount });
//       }

//       /* pick largest face as primary */
//       const primary = detections.reduce((best, d) => {
//         const area     = d.detection.box.width * d.detection.box.height;
//         const bestArea = best.detection.box.width * best.detection.box.height;
//         return area > bestArea ? d : best;
//       }, detections[0]);

//       /* 3 ── LOOK-AWAY */
//       const yaw = estimateYawDeg(primary.landmarks);
//       if (yaw > LOOK_AWAY_YAW_DEG) {
//         lookAwayCountRef.current++;
//         if (lookAwayCountRef.current >= LOOK_AWAY_GRACE) {
//           warn("⚠️ Please look at the camera during the interview.");
//           report("look_away", "medium", { yawDeg: Math.round(yaw) });
//           lookAwayCountRef.current = 0;
//         }
//       } else {
//         lookAwayCountRef.current = 0;
//       }

//       /* 4 ── FACE IDENTITY */
//       if (!refDescriptorRef.current) {
//         await collectSeedFrame(video);
//       } else if (primary.descriptor) {
//         const dist = cosineDistance(primary.descriptor, refDescriptorRef.current);
//         if (dist > DESCRIPTOR_DISTANCE) {
//           warn("⚠️ Face identity mismatch. Ensure only the registered candidate is present.");
//           report("face_inconsistency", "high", { cosineDistance: dist.toFixed(3) });
//         }
//         // EMA update
//         for (let i = 0; i < refDescriptorRef.current.length; i++) {
//           refDescriptorRef.current[i] =
//             refDescriptorRef.current[i] * (1 - DESCRIPTOR_EMA_ALPHA) +
//             primary.descriptor[i] * DESCRIPTOR_EMA_ALPHA;
//         }
//       }

//       /* 5 ── FORBIDDEN OBJECTS */
//       if (cocoModelRef.current) {
//         const predictions = await cocoModelRef.current.detect(video);
//         const hits = predictions.filter(
//           (p) => FORBIDDEN_OBJECTS.has(p.class) && p.score >= OBJECT_MIN_CONFIDENCE
//         );
//         if (hits.length > 0) {
//           const labels = [...new Set(hits.map((h) => h.class))].join(", ");
//           warn(`⚠️ Prohibited item detected: ${labels}. Please remove it from frame.`);
//           report("object_detected", "high", {
//             objects: hits.map((h) => ({ class: h.class, score: h.score.toFixed(2) })),
//           });
//         }
//       }
//     } catch (err) {
//       console.error("[Proctoring] scan error:", err);
//     } finally {
//       scanningRef.current = false;
//     }
//   }, [videoRef, warn, report, collectSeedFrame]);

//   /* ── TAB / WINDOW FOCUS ── */
//   useEffect(() => {
//     if (!enabled) return;
//     const onHidden = () => {
//       if (document.hidden) {
//         warn("⚠️ Tab switching is not allowed during the interview.");
//         report("tab_switch", "medium");
//       }
//     };
//     const onBlur = () => {
//       warn("⚠️ Window lost focus. Keep the interview tab active.");
//       report("tab_switch", "medium");
//     };
//     document.addEventListener("visibilitychange", onHidden);
//     window.addEventListener("blur", onBlur);
//     return () => {
//       document.removeEventListener("visibilitychange", onHidden);
//       window.removeEventListener("blur", onBlur);
//     };
//   }, [enabled, warn, report]);

//   /* ── START / STOP SCAN LOOP ── */
//   useEffect(() => {
//     clearInterval(scanRef.current);
//     if (!enabled || !modelsReady) return;

//     absenceCountRef.current    = 0;
//     lookAwayCountRef.current   = 0;
//     seedDescriptorsRef.current = [];
//     refDescriptorRef.current   = null;
//     lastReportRef.current      = {};
//     scanningRef.current        = false;

//     scanRef.current = setInterval(runScan, SCAN_INTERVAL_MS);
//     return () => clearInterval(scanRef.current);
//   }, [enabled, modelsReady, runScan]);

//   return { showWarning, warningMessage, dismissWarning, modelsReady };
// }

/**
 * useProctoring.js — @vladmandic/face-api edition
 *
 * FIXES vs previous versions:
 *
 * ✅ GAze detection — now tracks three independent axes:
 *    - Yaw  (head left/right): nose x vs eye-midpoint x
 *    - Pitch (head up/down):   nose tip y vs forehead/chin y ratio
 *    - Iris  (eye rotation):   iris centre x within eye socket corners
 *      → Catches "looking sideways with head still" which old code missed entirely
 *
 * ✅ Object detection — COCO-SSD removed entirely.
 *    It conflicts with vladmandic/face-api's TF backend (both call
 *    tf.setBackend / tf.ready) causing "Platform already set" and
 *    "t3 is not a function" crashes.  Replaced with three pure-canvas
 *    heuristics that need zero extra dependencies:
 *      1. Screen glow — bright large rectangle in frame → phone/tablet
 *      2. Book/paper — high-frequency edge density → paper or notes
 *      3. Earphone — small high-contrast dot near ear landmark
 *
 * ✅ False "no face" alarms — raised grace counter + fixed withFaceLandmarks(true)
 *    (vladmandic requires `true` to pick the tiny landmark net, bare call
 *    falls back to the heavy net which is too slow at 1.3s intervals)
 *
 * ✅ Scan guard — scanningRef prevents overlapping async scan ticks
 *
 * ✅ EMA descriptor — identity reference drifts slowly with the candidate
 *    so minor lighting changes do not trigger face_mismatch
 */
//=================================================================================================

// import { useEffect, useRef, useState, useCallback } from "react";
// import * as faceapi from "@vladmandic/face-api";
// import axios from "axios";

// /* ══════════════════════════════════════════════════════════════════
//    TUNABLES  — adjust here, not inline
// ══════════════════════════════════════════════════════════════════ */
// const MODELS_PATH             = "/models";
// const SCAN_INTERVAL_MS        = 1400;
// const REPORT_COOLDOWN_MS      = 9000;

// // Face absence: how many consecutive misses before warning fires
// const FACE_ABSENCE_GRACE      = 5;      // ~7 s at 1.4 s/tick

// // Head-pose thresholds (degrees, approximate)
// const YAW_WARN_DEG            = 28;     // left/right head turn
// const PITCH_WARN_DEG          = 22;     // head tilt up/down

// // Iris-offset threshold: fraction of eye-socket width
// // 0 = perfectly centred, 1 = fully at the edge
// const IRIS_WARN_FRACTION      = 0.38;

// // Consecutive gaze-away ticks before warning
// const GAZE_AWAY_GRACE         = 3;

// // Face identity
// const DESCRIPTOR_SEED_FRAMES  = 7;
// const DESCRIPTOR_DISTANCE     = 0.50;   // cosine — 0 = identical, 1 = unrelated
// const DESCRIPTOR_EMA_ALPHA    = 0.06;   // how fast reference drifts

// // Canvas-based object heuristics
// const PHONE_BRIGHT_FRACTION   = 0.28;   // fraction of sample area that must be very bright
// const PHONE_BRIGHTNESS_THR    = 210;    // pixel luminance threshold for "screen glow"
// const BOOK_EDGE_FRACTION      = 0.40;   // fraction of sample area that must be "edge"
// const BOOK_EDGE_THR           = 30;     // gradient magnitude threshold for paper edges
// const EAR_REGION_SIZE         = 36;     // px — square around ear landmark to sample
// const EAR_CONTRAST_THR        = 55;     // contrast threshold for earphone dot
// /* ══════════════════════════════════════════════════════════════════ */

// /* ─── utility: cosine distance ─── */
// function cosineDistance(a, b) {
//   let dot = 0, na = 0, nb = 0;
//   for (let i = 0; i < a.length; i++) {
//     dot += a[i] * b[i];
//     na  += a[i] * a[i];
//     nb  += b[i] * b[i];
//   }
//   return 1 - dot / (Math.sqrt(na) * Math.sqrt(nb));
// }

// /* ─── Head pose from 68-point landmarks ─── */
// function estimatePose(landmarks) {
//   const pts = landmarks.positions;
//   //
//   // Landmark indices (dlib 68-point convention used by vladmandic):
//   //   0–16  jaw line        17–21 left brow    22–26 right brow
//   //   27–30 nose bridge     31–35 nose base    36–41 left eye
//   //   42–47 right eye       48–67 mouth
//   //
//   const noseTip   = pts[30];
//   const leftEye0  = pts[36];   // left-most point of left eye
//   const rightEye3 = pts[45];   // right-most point of right eye
//   const chin      = pts[8];    // bottom of jaw
//   const forehead  = pts[27];   // top of nose bridge (proxy for forehead)

//   const eyeSpan   = Math.abs(rightEye3.x - leftEye0.x);
//   const eyeMidX   = (leftEye0.x + rightEye3.x) / 2;
//   const eyeMidY   = (leftEye0.y + rightEye3.y) / 2;

//   // YAW — how far nose is horizontally from eye-midpoint, normalised by eye span
//   const yawRaw    = (noseTip.x - eyeMidX) / (eyeSpan || 1);
//   const yawDeg    = Math.abs(yawRaw * 90);

//   // PITCH — ratio of (nose-tip to eye-mid) vs (chin to forehead) vertical spans
//   const faceHeight     = Math.abs(chin.y - forehead.y) || 1;
//   const noseEyeOffset  = noseTip.y - eyeMidY;          // positive = looking down
//   const pitchNorm      = noseEyeOffset / faceHeight;    // ~0.15 forward, negative=up
//   // Forward-facing baseline ≈ 0.18 (nose below eyes by ~18% of face height)
//   const pitchDelta     = pitchNorm - 0.18;
//   const pitchDeg       = Math.abs(pitchDelta * 90);
//   const pitchDir       = pitchDelta > 0 ? "down" : "up";

//   return { yawDeg, pitchDeg, pitchDir, yawRaw };
// }

// /* ─── Iris gaze from eye-corner landmarks ─── */
// //
// // The 68-net gives us the 6 points of each eye socket:
// //   Left  eye:  36 (left corner) … 39 (right corner)
// //   Right eye:  42 (left corner) … 45 (right corner)
// //
// // We estimate the iris centre by computing the centroid of ALL 6 points per eye,
// // then measure how far that centroid sits from the socket's horizontal centre.
// // A centroid near the left corner = looking left; near right corner = looking right.
// //
// function estimateIrisOffset(landmarks) {
//   const pts = landmarks.positions;

//   function eyeOffset(idxList) {
//     const xs = idxList.map(i => pts[i].x);
//     const ys = idxList.map(i => pts[i].y);
//     const cx  = xs.reduce((s, v) => s + v, 0) / xs.length;
//     const cy  = ys.reduce((s, v) => s + v, 0) / ys.length;
//     const minX = Math.min(...xs);
//     const maxX = Math.max(...xs);
//     const socketW = maxX - minX || 1;
//     const socketCX = (minX + maxX) / 2;
//     // Signed fraction: negative = iris left of centre, positive = iris right
//     return (cx - socketCX) / socketW;
//   }

//   const leftOffset  = eyeOffset([36, 37, 38, 39, 40, 41]);
//   const rightOffset = eyeOffset([42, 43, 44, 45, 46, 47]);
//   const avg         = (leftOffset + rightOffset) / 2;

//   return avg; // negative = gaze left, positive = gaze right
// }

// /* ─── Canvas-based phone/screen glow detector ─── */
// // Samples the four corners of the frame (where people hold phones)
// // and checks for large bright uniform rectangles.
// function detectScreenGlow(video, canvas) {
//   const vw = video.videoWidth;
//   const vh = video.videoHeight;
//   if (!vw || !vh) return false;

//   const size = 60;
//   canvas.width  = size;
//   canvas.height = size;
//   const ctx = canvas.getContext("2d");

//   // Sample top-right, bottom-right, bottom-left corners
//   const regions = [
//     [vw * 0.65, 0,          vw * 0.35, vh * 0.45],   // top-right
//     [vw * 0.65, vh * 0.55,  vw * 0.35, vh * 0.45],   // bottom-right
//     [0,          vh * 0.55,  vw * 0.35, vh * 0.45],   // bottom-left
//   ];

//   for (const [sx, sy, sw, sh] of regions) {
//     ctx.drawImage(video, sx, sy, sw, sh, 0, 0, size, size);
//     const { data } = ctx.getImageData(0, 0, size, size);
//     let bright = 0;
//     for (let i = 0; i < data.length; i += 4) {
//       const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
//       if (lum > PHONE_BRIGHTNESS_THR) bright++;
//     }
//     if (bright / (size * size) > PHONE_BRIGHT_FRACTION) return true;
//   }
//   return false;
// }

// /* ─── Canvas-based paper/book edge detector ─── */
// // Samples the centre-bottom area (lap / desk) and measures
// // edge density using a simple Sobel-lite pass.
// function detectPaperEdges(video, canvas) {
//   const vw = video.videoWidth;
//   const vh = video.videoHeight;
//   if (!vw || !vh) return false;

//   const size = 64;
//   canvas.width  = size;
//   canvas.height = size;
//   const ctx = canvas.getContext("2d");

//   // Sample bottom-centre (where papers/books usually appear)
//   ctx.drawImage(video, vw * 0.25, vh * 0.6, vw * 0.5, vh * 0.4, 0, 0, size, size);
//   const { data } = ctx.getImageData(0, 0, size, size);

//   // Convert to greyscale array
//   const grey = new Uint8Array(size * size);
//   for (let i = 0; i < size * size; i++) {
//     const o = i * 4;
//     grey[i] = 0.299 * data[o] + 0.587 * data[o + 1] + 0.114 * data[o + 2];
//   }

//   // Simple horizontal + vertical gradient magnitude
//   let edgePixels = 0;
//   for (let y = 1; y < size - 1; y++) {
//     for (let x = 1; x < size - 1; x++) {
//       const gx = grey[y * size + x + 1] - grey[y * size + x - 1];
//       const gy = grey[(y + 1) * size + x] - grey[(y - 1) * size + x];
//       const mag = Math.abs(gx) + Math.abs(gy);
//       if (mag > BOOK_EDGE_THR) edgePixels++;
//     }
//   }
//   return edgePixels / (size * size) > BOOK_EDGE_FRACTION;
// }

// /* ─── Canvas-based earphone detector ─── */
// // Samples a small region around each ear landmark (pts[0] and pts[16])
// // and checks for a small high-contrast circular blob.
// function detectEarphone(video, canvas, landmarks) {
//   const pts = landmarks.positions;
//   const vw  = video.videoWidth;
//   const vh  = video.videoHeight;
//   if (!vw || !vh) return false;

//   const size = EAR_REGION_SIZE;
//   canvas.width  = size;
//   canvas.height = size;
//   const ctx = canvas.getContext("2d");

//   // Scale landmark coords to video resolution
//   // (vladmandic returns coords in the element's CSS space by default;
//   //  but with TinyFaceDetector the positions are already in input-image space)
//   const earPoints = [pts[0], pts[16]]; // left jaw, right jaw (near ears)

//   for (const ep of earPoints) {
//     const sx = Math.max(0, ep.x - size / 2);
//     const sy = Math.max(0, ep.y - size / 2);
//     ctx.drawImage(video, sx, sy, size, size, 0, 0, size, size);
//     const { data } = ctx.getImageData(0, 0, size, size);

//     // Compute mean luminance and variance
//     let sum = 0;
//     const lums = new Float32Array(size * size);
//     for (let i = 0; i < size * size; i++) {
//       const o = i * 4;
//       lums[i] = 0.299 * data[o] + 0.587 * data[o + 1] + 0.114 * data[o + 2];
//       sum += lums[i];
//     }
//     const mean = sum / lums.length;
//     let variance = 0;
//     for (const l of lums) variance += (l - mean) ** 2;
//     variance /= lums.length;

//     // High variance near the ear = distinct small object (earphone/earbud)
//     if (Math.sqrt(variance) > EAR_CONTRAST_THR) return true;
//   }
//   return false;
// }

// /* ══════════════════════════════════════════════════════════════════
//    HOOK
// ══════════════════════════════════════════════════════════════════ */
// export function useProctoring({ sessionId, videoRef, enabled, backendUrl }) {

//   const [showWarning,    setShowWarning]    = useState(false);
//   const [warningMessage, setWarningMessage] = useState("");
//   const [modelsReady,    setModelsReady]    = useState(false);

//   const scanRef            = useRef(null);
//   const lastReportRef      = useRef({});
//   const modelsLoadedRef    = useRef(false);
//   const absenceCountRef    = useRef(0);
//   const gazeAwayCountRef   = useRef(0);
//   const seedDescriptorsRef = useRef([]);
//   const refDescriptorRef   = useRef(null);
//   const scanningRef        = useRef(false);

//   // Reusable off-screen canvas for object heuristics (no extra TF models)
//   const heuristicCanvas = useRef(document.createElement("canvas"));

//   const warn = useCallback((msg) => {
//     setWarningMessage(msg);
//     setShowWarning(true);
//   }, []);

//   const dismissWarning = useCallback(() => setShowWarning(false), []);

//   /* ── backend reporter with per-event cooldown ── */
//   const report = useCallback(async (eventType, severity, details = {}) => {
//     if (!sessionId) return;
//     const now  = Date.now();
//     const last = lastReportRef.current[eventType] ?? 0;
//     if (now - last < REPORT_COOLDOWN_MS) return;
//     lastReportRef.current[eventType] = now;
//     try {
//       await axios.post(
//         `${backendUrl}api/interview/${sessionId}/proctoring`,
//         { eventType, severity, details },
//         { withCredentials: true }
//       );
//     } catch (err) {
//       console.error("[Proctoring] report failed:", err);
//     }
//   }, [sessionId, backendUrl]);

//   /* ══════════════════════════════════════════════════════════════
//      MODEL LOADING
//      vladmandic/face-api manages the TF backend internally.
//      Do NOT call tf.setBackend() or load COCO-SSD — they conflict.
//   ══════════════════════════════════════════════════════════════ */
//   useEffect(() => {
//     if (modelsLoadedRef.current) return;
//     (async () => {
//       try {
//         await Promise.all([
//           faceapi.nets.tinyFaceDetector.loadFromUri(MODELS_PATH),
//           // Use the full 68-net (not tiny) — we need all 68 points for iris+pitch
//           faceapi.nets.faceLandmark68Net.loadFromUri(MODELS_PATH),
//           faceapi.nets.faceRecognitionNet.loadFromUri(MODELS_PATH),
//         ]);
//         modelsLoadedRef.current = true;
//         setModelsReady(true);
//         console.log("[Proctoring] Models ready ✓");
//       } catch (err) {
//         console.error("[Proctoring] Model load error:", err);
//       }
//     })();
//   }, []);

//   /* ══════════════════════════════════════════════════════════════
//      SEED FRAME COLLECTOR — builds stable reference descriptor
//   ══════════════════════════════════════════════════════════════ */
//   const collectSeedFrame = useCallback(async (video) => {
//     const opts = new faceapi.TinyFaceDetectorOptions({ scoreThreshold: 0.5 });
//     const det  = await faceapi
//       .detectSingleFace(video, opts)
//       .withFaceLandmarks()     // NO true — we want full 68-net
//       .withFaceDescriptor();

//     if (!det?.descriptor) return;
//     seedDescriptorsRef.current.push(det.descriptor);

//     if (seedDescriptorsRef.current.length >= DESCRIPTOR_SEED_FRAMES) {
//       const len  = seedDescriptorsRef.current[0].length;
//       const mean = new Float32Array(len);
//       for (const d of seedDescriptorsRef.current) {
//         for (let i = 0; i < len; i++) mean[i] += d[i];
//       }
//       for (let i = 0; i < len; i++) mean[i] /= seedDescriptorsRef.current.length;
//       refDescriptorRef.current = mean;
//       console.log("[Proctoring] Reference descriptor locked ✓");
//     }
//   }, []);

//   /* ══════════════════════════════════════════════════════════════
//      MAIN SCAN TICK
//   ══════════════════════════════════════════════════════════════ */
//   const runScan = useCallback(async () => {
//     if (!modelsLoadedRef.current)  return;
//     if (scanningRef.current)       return;   // guard against overlapping ticks
//     const video = videoRef.current;
//     if (!video || video.readyState < 2) return;

//     scanningRef.current = true;
//     try {
//       const opts = new faceapi.TinyFaceDetectorOptions({ scoreThreshold: 0.38 });

//       // withFaceLandmarks() with NO argument → full 68-net (vladmandic)
//       const detections = await faceapi
//         .detectAllFaces(video, opts)
//         .withFaceLandmarks()
//         .withFaceDescriptors();

//       const faceCount = detections.length;

//       /* ── 1. FACE ABSENCE ── */
//       if (faceCount === 0) {
//         absenceCountRef.current++;
//         if (absenceCountRef.current >= FACE_ABSENCE_GRACE) {
//           warn("⚠️ No face detected. Please sit directly in front of the camera.");
//           report("face_absence", "medium", { consecutiveMisses: absenceCountRef.current });
//           absenceCountRef.current = 0;   // reset so the warning isn't re-fired every tick
//         }
//         return;  // nothing else to check without a face
//       }
//       absenceCountRef.current = 0;   // face found → reset absence counter immediately

//       /* ── 2. MULTIPLE FACES ── */
//       if (faceCount >= 2) {
//         warn(`⚠️ ${faceCount} faces detected. Only the candidate should be visible.`);
//         report("multiple_faces", "high", { faceCount });
//       }

//       /* pick the largest face as the primary candidate */
//       const primary = detections.reduce((best, d) => {
//         const area     = d.detection.box.width  * d.detection.box.height;
//         const bestArea = best.detection.box.width * best.detection.box.height;
//         return area > bestArea ? d : best;
//       }, detections[0]);

//       /* ── 3. GAZE DETECTION (yaw + pitch + iris) ── */
//       const { yawDeg, pitchDeg, pitchDir } = estimatePose(primary.landmarks);
//       const irisOffset = estimateIrisOffset(primary.landmarks);
//       const irisAway   = Math.abs(irisOffset) > IRIS_WARN_FRACTION;

//       const headAway   = yawDeg > YAW_WARN_DEG || pitchDeg > PITCH_WARN_DEG;
//       const gazeAway   = headAway || irisAway;

//       if (gazeAway) {
//         gazeAwayCountRef.current++;
//         if (gazeAwayCountRef.current >= GAZE_AWAY_GRACE) {
//           // Build a specific message so the candidate knows what to fix
//           let reason = "";
//           if (yawDeg > YAW_WARN_DEG) {
//             reason = `turning head ${irisOffset < 0 ? "left" : "right"}`;
//           } else if (pitchDeg > PITCH_WARN_DEG) {
//             reason = `looking ${pitchDir}`;
//           } else if (irisAway) {
//             reason = `eyes looking ${irisOffset < 0 ? "left" : "right"}`;
//           }
//           warn(`👁️ Please look at the camera. Detected: ${reason}.`);
//           report("look_away", "medium", {
//             yawDeg:      Math.round(yawDeg),
//             pitchDeg:    Math.round(pitchDeg),
//             pitchDir,
//             irisOffset:  irisOffset.toFixed(3),
//             reason,
//           });
//           gazeAwayCountRef.current = 0;
//         }
//       } else {
//         gazeAwayCountRef.current = 0;
//       }

//       /* ── 4. FACE IDENTITY ── */
//       if (!refDescriptorRef.current) {
//         await collectSeedFrame(video);
//       } else if (primary.descriptor) {
//         const dist = cosineDistance(primary.descriptor, refDescriptorRef.current);
//         if (dist > DESCRIPTOR_DISTANCE) {
//           warn("⚠️ Face identity mismatch. Ensure only the registered candidate is present.");
//           report("face_inconsistency", "high", { cosineDistance: dist.toFixed(3) });
//         }
//         // Slow EMA drift — keeps reference fresh under lighting changes
//         for (let i = 0; i < refDescriptorRef.current.length; i++) {
//           refDescriptorRef.current[i] =
//             refDescriptorRef.current[i] * (1 - DESCRIPTOR_EMA_ALPHA) +
//             primary.descriptor[i]       * DESCRIPTOR_EMA_ALPHA;
//         }
//       }

//       /* ── 5. OBJECT DETECTION (canvas heuristics — no COCO-SSD) ──
//        *
//        *  Three independent checks, each sampling a different region
//        *  of the video frame using a single shared off-screen canvas.
//        *  No TensorFlow involvement → no backend conflicts.
//        */
//       const canvas = heuristicCanvas.current;

//       // 5a. Phone / tablet screen glow (bright rectangle in corner regions)
//       if (detectScreenGlow(video, canvas)) {
//         warn("📵 Phone or bright screen detected. Please remove it from view.");
//         report("object_detected", "high", { object: "phone/screen", method: "screen_glow" });
//       }

//       // 5b. Book / paper / notes (high edge density in bottom-centre)
//       if (detectPaperEdges(video, canvas)) {
//         warn("📄 Paper or notes detected. Please remove them from the frame.");
//         report("object_detected", "high", { object: "paper/book", method: "edge_density" });
//       }

//       // 5c. Earphone / earbud near ear landmarks
//       if (detectEarphone(video, canvas, primary.landmarks)) {
//         warn("🎧 Earphone detected near ear. Please remove audio devices.");
//         report("object_detected", "high", { object: "earphone", method: "ear_contrast" });
//       }

//     } catch (err) {
//       console.error("[Proctoring] scan error:", err);
//     } finally {
//       scanningRef.current = false;
//     }
//   }, [videoRef, warn, report, collectSeedFrame]);

//   /* ── TAB / WINDOW FOCUS EVENTS ── */
//   useEffect(() => {
//     if (!enabled) return;
//     const onVisibility = () => {
//       if (document.hidden) {
//         warn("⚠️ Tab switching is not allowed during the interview.");
//         report("tab_switch", "medium");
//       }
//     };
//     const onBlur = () => {
//       warn("⚠️ Window lost focus. Keep the interview tab active.");
//       report("tab_switch", "medium");
//     };
//     document.addEventListener("visibilitychange", onVisibility);
//     window.addEventListener("blur", onBlur);
//     return () => {
//       document.removeEventListener("visibilitychange", onVisibility);
//       window.removeEventListener("blur", onBlur);
//     };
//   }, [enabled, warn, report]);

//   /* ── SCAN LOOP START / STOP ── */
//   useEffect(() => {
//     clearInterval(scanRef.current);
//     if (!enabled || !modelsReady) return;

//     // Full reset when (re)starting
//     absenceCountRef.current    = 0;
//     gazeAwayCountRef.current   = 0;
//     seedDescriptorsRef.current = [];
//     refDescriptorRef.current   = null;
//     lastReportRef.current      = {};
//     scanningRef.current        = false;

//     scanRef.current = setInterval(runScan, SCAN_INTERVAL_MS);
//     return () => clearInterval(scanRef.current);
//   }, [enabled, modelsReady, runScan]);

//   return { showWarning, warningMessage, dismissWarning, modelsReady };
// }



import { useEffect, useRef, useState, useCallback } from "react";
import * as faceapi from "@vladmandic/face-api";
import axios from "axios";

const MODELS_PATH = "/models";

const SCAN_INTERVAL = 1800;

const FACE_MISSING_LIMIT = 6;
const LOOK_AWAY_LIMIT = 4;

const YAW_LIMIT = 32;
const PITCH_LIMIT = 24;

const WARNING_COOLDOWN = 7000;

const FACE_DISTANCE_LIMIT = 0.72;

function cosineDistance(a, b) {
  let dot = 0;
  let na = 0;
  let nb = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }

  return 1 - dot / (Math.sqrt(na) * Math.sqrt(nb));
}

function estimatePose(landmarks) {
  const pts = landmarks.positions;

  const nose = pts[30];
  const leftEye = pts[36];
  const rightEye = pts[45];
  const chin = pts[8];
  const forehead = pts[27];

  const eyeSpan = Math.abs(rightEye.x - leftEye.x);

  const eyeMidX = (leftEye.x + rightEye.x) / 2;
  const eyeMidY = (leftEye.y + rightEye.y) / 2;

  const yaw = Math.abs(((nose.x - eyeMidX) / eyeSpan) * 90);

  const faceHeight = Math.abs(chin.y - forehead.y);

  const pitchRaw = (nose.y - eyeMidY) / faceHeight;

  const pitch = Math.abs((pitchRaw - 0.18) * 90);

  return {
    yaw,
    pitch,
  };
}

export function useProctoring({
  sessionId,
  videoRef,
  enabled,
  backendUrl,
}) {
  const [modelsReady, setModelsReady] = useState(false);

  const [showWarning, setShowWarning] = useState(false);

  const [warningMessage, setWarningMessage] = useState("");

  const scanRef = useRef(null);

  const warningLockRef = useRef(false);

  const lastReportRef = useRef({});

  const missingFaceRef = useRef(0);

  const lookAwayRef = useRef(0);

  const referenceDescriptorRef = useRef(null);

  const scanningRef = useRef(false);

  const dismissWarning = () => {
    setShowWarning(false);

    setTimeout(() => {
      warningLockRef.current = false;
    }, 2000);
  };

  const warn = useCallback((msg) => {
    if (warningLockRef.current) return;

    warningLockRef.current = true;

    setWarningMessage(msg);

    setShowWarning(true);
  }, []);

  const report = useCallback(
    async (eventType, severity, details = {}) => {
      if (!sessionId) return;

      const now = Date.now();

      const last = lastReportRef.current[eventType] || 0;

      if (now - last < WARNING_COOLDOWN) return;

      lastReportRef.current[eventType] = now;

      try {
        await axios.post(
          `${backendUrl}api/interview/${sessionId}/proctoring`,
          {
            eventType,
            severity,
            details,
          },
          {
            withCredentials: true,
          }
        );
      } catch (err) {
        console.error(err);
      }
    },
    [sessionId, backendUrl]
  );

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODELS_PATH),

          faceapi.nets.faceLandmark68Net.loadFromUri(MODELS_PATH),

          faceapi.nets.faceRecognitionNet.loadFromUri(MODELS_PATH),
        ]);

        if (mounted) {
          setModelsReady(true);
        }
      } catch (err) {
        console.error(err);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, []);

  const runScan = useCallback(async () => {
    if (scanningRef.current) return;

    const video = videoRef.current;

    if (!video) return;

    if (video.readyState < 2) return;

    scanningRef.current = true;

    try {
      const detection = await faceapi
        .detectAllFaces(
          video,
          new faceapi.TinyFaceDetectorOptions({
            scoreThreshold: 0.5,
          })
        )
        .withFaceLandmarks()
        .withFaceDescriptors();

      const count = detection.length;

      if (count === 0) {
        missingFaceRef.current++;

        if (missingFaceRef.current >= FACE_MISSING_LIMIT) {
          warn("No face detected. Please face the camera.");

          report("face_absent", "medium");

          missingFaceRef.current = 0;
        }

        return;
      }

      missingFaceRef.current = 0;

      if (count > 1) {
        warn("Multiple faces detected.");

        report("multiple_faces", "high", {
          count,
        });
      }

      const primary = detection[0];

      const pose = estimatePose(primary.landmarks);

      const lookingAway =
        pose.yaw > YAW_LIMIT || pose.pitch > PITCH_LIMIT;

      if (lookingAway) {
        lookAwayRef.current++;

        if (lookAwayRef.current >= LOOK_AWAY_LIMIT) {
          warn("Please look at the screen.");

          report("looking_away", "medium", pose);

          lookAwayRef.current = 0;
        }
      } else {
        lookAwayRef.current = 0;
      }

      if (!referenceDescriptorRef.current) {
        referenceDescriptorRef.current =
          primary.descriptor;
      } else {
        const dist = cosineDistance(
          primary.descriptor,
          referenceDescriptorRef.current
        );

        if (dist > FACE_DISTANCE_LIMIT) {
          warn("Face mismatch detected.");

          report("face_mismatch", "high", {
            distance: dist,
          });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      scanningRef.current = false;
    }
  }, [videoRef, warn, report]);

  useEffect(() => {
    if (!enabled || !modelsReady) return;

    scanRef.current = setInterval(
      runScan,
      SCAN_INTERVAL
    );

    return () => {
      clearInterval(scanRef.current);
    };
  }, [enabled, modelsReady, runScan]);

  useEffect(() => {
    if (!enabled) return;

    const onVisibility = () => {
      if (document.hidden) {
        warn("Tab switching detected.");

        report("tab_switch", "medium");
      }
    };

    const onBlur = () => {
      warn("Window focus lost.");

      report("window_blur", "medium");
    };

    document.addEventListener(
      "visibilitychange",
      onVisibility
    );

    window.addEventListener("blur", onBlur);

    return () => {
      document.removeEventListener(
        "visibilitychange",
        onVisibility
      );

      window.removeEventListener(
        "blur",
        onBlur
      );
    };
  }, [enabled, warn, report]);

  return {
    modelsReady,
    showWarning,
    warningMessage,
    dismissWarning,
  };
}