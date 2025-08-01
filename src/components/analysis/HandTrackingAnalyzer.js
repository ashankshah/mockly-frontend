// /*
// NEEDS TO BE FIXED:
// - still slow on CPU - webGL not working
// - scaling and benchmarks need to be adapted to new canvas size
// - iod display functionality

// NOTE: Visual overlays are disabled - computer vision analysis still active
// All hand tracking and analysis continues to work, but no visual feedback
// */

// import React, { useEffect, useRef, useState } from 'react';
// import '@tensorflow/tfjs-backend-webgl';
// import * as handpose from '@tensorflow-models/hand-pose-detection';
// import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';
// import * as tf from '@tensorflow/tfjs-core';
// import '@tensorflow/tfjs-backend-webgl';

// const W = 400, H = 300;
// const TRAIL_LEN = 45;
// const COLORS = ['yellow', 'orange'];
// const MOVE_EPS = 2;
// const ANGLE_THR = 1.0;
// const CALIBRATION_TIME = 1000;
// const HEAD_CIRCLE_RADIUS = 30;
// const IOD_RATIO_THRESHOLD = 0.6;
// const HEAD_CIRCLE_CENTER_X = W / 2;
// const HEAD_CIRCLE_CENTER_Y = H / 3;

// const TOO_LITTLE = m => m.speed < 130;
// const TOO_MUCH = m => m.speed > 150;

// const HandTrackingAnalyzer = React.memo(({ videoRef, isActive, onMetricsUpdate }) => {
//   const rafRef = useRef();
//   const trails = useRef([[], []]);
//   const showOverlay = useRef(false); // Disabled visual overlays
//   const iodRef = useRef(null);
//   const baselineIOD = useRef(null);
//   const faceGoodRef = useRef(false);
//   const lastEyeLine = useRef(null);
//   const lastTimeRef = useRef(0);
//   const lastPositionsRef = useRef([null, null]);
//   const lastVectorsRef = useRef([null, null]);
//   const erraticCountRef = useRef([0, 0]);
//   const totalDistanceRef = useRef([0, 0]);
//   const handVisibleTimeRef = useRef([0, 0]);
//   const handAssignments = useRef([null, null]);
//   const lastFeedbackRef = useRef('');
//   const feedbackStableCountRef = useRef(0);
//   const [calibrated, setCalibrated] = useState(false);
//   const calibrationTimerRef = useRef(null);

//   useEffect(() => {
//     if (!videoRef.current) { 
//         console.log("Video reference is not set");
//         return;
//     }

//     const video = videoRef.current;

//     let handDetector, faceDetector;

//     const setup = async () => {
//       // Wait for video to be ready
//       const waitForVideo = () => {
//         return new Promise((resolve) => {
//           const checkVideo = () => {
//             if (video.videoWidth > 0 && video.videoHeight > 0 && 
//                 video.readyState >= 2) {
//               resolve();
//             } else {
//               setTimeout(checkVideo, 100);
//             }
//           };
//           checkVideo();
//         });
//       };

//       await waitForVideo();

//       // Try CPU backend first to avoid WebGL issues
//       try {
//         await tf.setBackend('cpu');
//         await tf.ready();
//         console.log("Using CPU backend:", tf.getBackend());
//       } catch (error) {
//         console.error("Backend initialization failed:", error);
//         throw error;
//       }

//       // Test TensorFlow with a simple operation
//       const testTensor = tf.tensor([1, 2, 3, 4]);
//       const testResult = testTensor.add(1);
//       testTensor.dispose();
//       testResult.dispose();

//       handDetector = await handpose.createDetector(handpose.SupportedModels.MediaPipeHands, {
//         runtime: 'tfjs',
//         modelType: 'lite',
//         maxHands: 2,
//         detectorModelUrl: undefined,
//         landmarkModelUrl: undefined
//       });

//       faceDetector = await faceLandmarksDetection.createDetector(faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh, {
//         runtime: 'tfjs',
//         modelType:'lite',
//         refineLandmarks: true,
//         maxFaces: 1
//       });

//       console.log("Models loaded successfully");

//       let countdown = 5;
//       calibrationTimerRef.current = setInterval(() => {
//         countdown--;
//         if (countdown === 0) {
//           clearInterval(calibrationTimerRef.current);
//           setCalibrated(true);
//           baselineIOD.current = iodRef.current;
//           handVisibleTimeRef.current = [0, 0];
//           totalDistanceRef.current = [0, 0];
//           erraticCountRef.current = [0, 0];
//           lastPositionsRef.current = [null, null];
//           lastVectorsRef.current = [null, null];
//           lastTimeRef.current = performance.now();
//         }
//       }, 1000);

//       const loop = async () => {
//         if (!isActive) { return; }
//         if (!video) return;

//         // Enhanced video readiness check
//         if (video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0 || video.paused || video.ended) {
//           rafRef.current = requestAnimationFrame(loop);
//           return;
//         }

//         // Calculate scaling factors for coordinate conversion (using video dimensions)
//         const scaleX = 1; // No canvas scaling needed
//         const scaleY = 1; // No canvas scaling needed

//         const now = performance.now();
//         const delta = now - lastTimeRef.current;
//         lastTimeRef.current = now;

//         // Create a new canvas from video frame to ensure proper format
//         const tempCanvas = document.createElement('canvas');
//         tempCanvas.width = video.videoWidth;
//         tempCanvas.height = video.videoHeight;
//         const tempCtx = tempCanvas.getContext('2d');
//         tempCtx.drawImage(video, 0, 0);

//         const [hands, faces] = await Promise.all([
//           handDetector.estimateHands(tempCanvas),
//           faceDetector.estimateFaces(tempCanvas)
//         ]);

//         // Validate keypoints
//         hands.forEach((hand, index) => {
//           if (hand.keypoints && hand.keypoints.length > 0) {
//             const nanKeypoints = hand.keypoints.filter(kpt => isNaN(kpt.x) || isNaN(kpt.y));
//             if (nanKeypoints.length > 0) {
//               console.error(`Hand ${index} has ${nanKeypoints.length}/${hand.keypoints.length} NaN keypoints`);
//             }
//           }
//         });



//         if (faces.length > 0) {
//             console.log(`Detected ${faces.length} face(s)`);
//             const k = faces[0].keypoints;
//             const l = k.find(p => p.name === 'leftEye');
//             const r = k.find(p => p.name === 'rightEye');
//             if (l && r) {
//                 const iod = Math.hypot(l.x - r.x, l.y - r.y);
//                 iodRef.current = iod;
//                 lastEyeLine.current = { lx: l.x, ly: l.y, rx: r.x, ry: r.y };

//                 const centerX = (l.x + r.x) / 2;
//                 const centerY = (l.y + r.y) / 2;
//                 const dx = centerX - HEAD_CIRCLE_CENTER_X;
//                 const dy = centerY - HEAD_CIRCLE_CENTER_Y;
//                 const dist = Math.sqrt(dx * dx + dy * dy);
//                 const iodLimit = (HEAD_CIRCLE_RADIUS * 2) * IOD_RATIO_THRESHOLD;
//                 faceGoodRef.current = iod < iodLimit && dist < HEAD_CIRCLE_RADIUS * 0.8;
//             }
//             }

//             // Overlay drawing (DISABLED - no visual overlay)
//             // Visual overlays removed while keeping computer vision analysis active


//         const iodScale = iodRef.current && baselineIOD.current ? iodRef.current / baselineIOD.current : 1.0;
//         const seen = [false, false];
//         const metrics = [{ speed: 0, err: 0 }, { speed: 0, err: 0 }];

//         for (const h of hands) {
//           const kpts = h.keypoints;
          
//           // Validate keypoints before processing
//           if (!kpts || kpts.length < 13) {
//             console.warn("Insufficient keypoints, skipping hand");
//             continue;
//           }

//           // Check if the specific keypoints we need exist and are valid
//           if (!kpts[8] || !kpts[9] || !kpts[12] || 
//               isNaN(kpts[8].x) || isNaN(kpts[8].y) ||
//               isNaN(kpts[9].x) || isNaN(kpts[9].y) ||
//               isNaN(kpts[12].x) || isNaN(kpts[12].y)) {
//             console.warn("Required keypoints (8,9,12) are invalid");
//             continue;
//           }
          
//           // Scale keypoints to match canvas display size
//           const x = ((kpts[8].x + kpts[9].x + kpts[12].x) / 3) * scaleX;
//           const y = ((kpts[8].y + kpts[9].y + kpts[12].y) / 3) * scaleY;

//           let handIndex = x < canvas.width / 2 ? 0 : 1;
//           seen[handIndex] = true;
//           handVisibleTimeRef.current[handIndex] += delta;

//           const tr = trails.current[handIndex];
//           tr.push({ x, y });
//           if (tr.length > TRAIL_LEN) tr.shift();

//           if (lastPositionsRef.current[handIndex]) {
//             const dx = x - lastPositionsRef.current[handIndex].x;
//             const dy = y - lastPositionsRef.current[handIndex].y;
//             const dist = Math.hypot(dx, dy);
//             if (dist >= MOVE_EPS) {
//               const normDist = dist / iodScale;
//               totalDistanceRef.current[handIndex] += normDist;
              
//               if (lastVectorsRef.current[handIndex]) {
//                 const lastDx = lastVectorsRef.current[handIndex].dx;
//                 const lastDy = lastVectorsRef.current[handIndex].dy;
//                 const curAngle = Math.atan2(dy, dx);
//                 const lastAngle = Math.atan2(lastDy, lastDx);
//                 let dA = Math.abs(curAngle - lastAngle);
//                 if (dA > Math.PI) dA = 2 * Math.PI - dA;
//                 if (dA > ANGLE_THR) erraticCountRef.current[handIndex]++;
//               }
//               lastVectorsRef.current[handIndex] = { dx, dy };
//             }
//           }
//           lastPositionsRef.current[handIndex] = { x, y };

//           // Hand tracking overlay drawing (DISABLED - no visual overlay)
//           // Visual overlays removed while keeping computer vision analysis active

//           const visibleTime = handVisibleTimeRef.current[handIndex] / 1000;
//           const speed = visibleTime > 0 ? totalDistanceRef.current[handIndex] / visibleTime : 0;
//           const err = visibleTime > 0 ? erraticCountRef.current[handIndex] / visibleTime : 0;
//           metrics[handIndex] = { speed, err };
//         }

//         let fb = '';
//         if (seen[0]) {
//           if (TOO_LITTLE(metrics[0])) fb = 'Too little – gesture more';
//           else if (TOO_MUCH(metrics[0])) fb = 'Too much – slow down';
//           else fb = 'Just right';
//         } else {
//           fb = 'No hands detected';
//         }

//         if (fb === lastFeedbackRef.current) feedbackStableCountRef.current++;
//         else {
//           feedbackStableCountRef.current = 0;
//           lastFeedbackRef.current = fb;
//         }
//         console.log('🤲 DEBUG: Hand tracking frame data:', {
//           feedback: fb,
//           lastFeedback: lastFeedbackRef.current,
//           stableCount: feedbackStableCountRef.current,
//           handsDetected: seen,
//           hasCallback: !!onMetricsUpdate,
//           callbackType: typeof onMetricsUpdate
//         });

//         if (feedbackStableCountRef.current >= 1) {
//         console.log('🚀 CALLING onMetricsUpdate with data');
//         onMetricsUpdate({
//           handMetrics: metrics.map((m, i) => ({
//             hand: i === 0 ? 'Right Hand' : 'Left Hand',
//             speed: m.speed,
//             err: m.err
//           })),
//           feedback: fb
//         });
//         console.log('✅ onMetricsUpdate call completed');
//       }

//         rafRef.current = requestAnimationFrame(loop);
//       };

//       rafRef.current = requestAnimationFrame(loop);
//     };

//     setup();

//     return () => {
//       rafRef.current && cancelAnimationFrame(rafRef.current);
//       clearInterval(calibrationTimerRef.current);
//     };
//       }, [isActive, videoRef, onMetricsUpdate]);

//   return null;
// });

// HandTrackingAnalyzer.displayName = 'HandTrackingAnalyzer';

// export default HandTrackingAnalyzer;

import React, { useEffect, useRef, useState } from 'react';
// import { Hands } from '@mediapipe/hands/hands';
// import { FaceMesh } from '@mediapipe/face_mesh/face_mesh';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';


const W = 400, H = 300;
const TRAIL_LEN = 45;
const MOVE_EPS = 2;
const ANGLE_THR = 1.0;
const HEAD_CIRCLE_RADIUS = 30;
const IOD_RATIO_THRESHOLD = 0.6;
const HEAD_CIRCLE_CENTER_X = W / 2;
const HEAD_CIRCLE_CENTER_Y = H / 3;

const TOO_LITTLE = m => m.speed < 130;
const TOO_MUCH = m => m.speed > 150;

const HandTrackingAnalyzer = React.memo(({ videoRef, isActive, onMetricsUpdate }) => {
  const rafRef = useRef();
  const trails = useRef([[], []]);
  const iodRef = useRef(null);
  const baselineIOD = useRef(null);
  const faceGoodRef = useRef(false);
  const lastEyeLine = useRef(null);
  const lastTimeRef = useRef(0);
  const lastPositionsRef = useRef([null, null]);
  const lastVectorsRef = useRef([null, null]);
  const erraticCountRef = useRef([0, 0]);
  const totalDistanceRef = useRef([0, 0]);
  const handVisibleTimeRef = useRef([0, 0]);
  const lastFeedbackRef = useRef('');
  const feedbackStableCountRef = useRef(0);
  const [calibrated, setCalibrated] = useState(false);
  const calibrationTimerRef = useRef(null);

  const hands = useRef(null);
  const faceMesh = useRef(null);

  useEffect(() => {
    if (!videoRef.current || !isActive) return;

    const video = videoRef.current;

    const setupMediaPipe = async () => {
      hands.current = new window.Hands({ locateFile: file => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}` });
      hands.current.setOptions({
        maxNumHands: 2,
        modelComplexity: 0,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      faceMesh.current = new window.FaceMesh({ locateFile: file => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}` });

      faceMesh.current.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      const onFaceResults = results => {
        if (results.multiFaceLandmarks.length > 0) {
          const lm = results.multiFaceLandmarks[0];
          const l = lm[33]; // left eye
          const r = lm[263]; // right eye
          const iod = Math.hypot(l.x - r.x, l.y - r.y);
          iodRef.current = iod;
          lastEyeLine.current = { lx: l.x, ly: l.y, rx: r.x, ry: r.y };

          const centerX = (l.x + r.x) / 2 * W;
          const centerY = (l.y + r.y) / 2 * H;
          const dx = centerX - HEAD_CIRCLE_CENTER_X;
          const dy = centerY - HEAD_CIRCLE_CENTER_Y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const iodLimit = (HEAD_CIRCLE_RADIUS * 2) * IOD_RATIO_THRESHOLD;
          faceGoodRef.current = iod < iodLimit && dist < HEAD_CIRCLE_RADIUS * 0.8;
        }
      };

      const onHandResults = results => {
        const now = performance.now();
        const delta = now - lastTimeRef.current;
        lastTimeRef.current = now;

        const iodScale = iodRef.current && baselineIOD.current ? iodRef.current / baselineIOD.current : 1.0;
        const metrics = [{ speed: 0, err: 0 }, { speed: 0, err: 0 }];
        const seen = [false, false];

        results.multiHandLandmarks.forEach((lm, i) => {
          const avgX = (lm[8].x + lm[9].x + lm[12].x) / 3 * W;
          const avgY = (lm[8].y + lm[9].y + lm[12].y) / 3 * H;
          const handIndex = avgX < W / 2 ? 0 : 1;
          seen[handIndex] = true;

          handVisibleTimeRef.current[handIndex] += delta;
          const tr = trails.current[handIndex];
          tr.push({ x: avgX, y: avgY });
          if (tr.length > TRAIL_LEN) tr.shift();

          if (lastPositionsRef.current[handIndex]) {
            const dx = avgX - lastPositionsRef.current[handIndex].x;
            const dy = avgY - lastPositionsRef.current[handIndex].y;
            const dist = Math.hypot(dx, dy);
            if (dist >= MOVE_EPS) {
              const normDist = dist / iodScale;
              totalDistanceRef.current[handIndex] += normDist;
              const lastVec = lastVectorsRef.current[handIndex];
              if (lastVec) {
                const angle = Math.abs(Math.atan2(dy, dx) - Math.atan2(lastVec.dy, lastVec.dx));
                const dA = angle > Math.PI ? 2 * Math.PI - angle : angle;
                if (dA > ANGLE_THR) erraticCountRef.current[handIndex]++;
              }
              lastVectorsRef.current[handIndex] = { dx, dy };
            }
          }

          lastPositionsRef.current[handIndex] = { x: avgX, y: avgY };

          const visibleTime = handVisibleTimeRef.current[handIndex] / 1000;
          const speed = visibleTime > 0 ? totalDistanceRef.current[handIndex] / visibleTime : 0;
          const err = visibleTime > 0 ? erraticCountRef.current[handIndex] / visibleTime : 0;
          metrics[handIndex] = { speed, err };
        });

        let fb = '';
        if (seen[0]) {
          if (TOO_LITTLE(metrics[0])) fb = 'Too little – gesture more';
          else if (TOO_MUCH(metrics[0])) fb = 'Too much – slow down';
          else fb = 'Just right';
        } else fb = 'No hands detected';

        if (fb === lastFeedbackRef.current) feedbackStableCountRef.current++;
        else {
          feedbackStableCountRef.current = 0;
          lastFeedbackRef.current = fb;
        }

        if (feedbackStableCountRef.current >= 1) {
          onMetricsUpdate({
            handMetrics: metrics.map((m, i) => ({
              hand: i === 0 ? 'Right Hand' : 'Left Hand',
              speed: m.speed,
              err: m.err
            })),
            feedback: fb
          });
        }
      };

      faceMesh.current.onResults(onFaceResults);
      hands.current.onResults(onHandResults);

      await faceMesh.current.initialize();
      await hands.current.initialize();

      const runLoop = async () => {
        if (!isActive || !videoRef.current) return;
        await faceMesh.current.send({ image: videoRef.current });
        await hands.current.send({ image: videoRef.current });
        rafRef.current = requestAnimationFrame(runLoop);
      };

      // Begin calibration countdown
      calibrationTimerRef.current = setTimeout(() => {
        setCalibrated(true);
        baselineIOD.current = iodRef.current;
        lastTimeRef.current = performance.now();
      }, 5000);

      rafRef.current = requestAnimationFrame(runLoop);
    };

    setupMediaPipe();

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (calibrationTimerRef.current) clearTimeout(calibrationTimerRef.current);
    };
  }, [isActive, videoRef, onMetricsUpdate]);

  return null;
});

HandTrackingAnalyzer.displayName = 'HandTrackingAnalyzer';

export default HandTrackingAnalyzer;
