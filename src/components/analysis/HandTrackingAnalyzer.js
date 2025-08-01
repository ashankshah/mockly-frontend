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

  const getFinalMetrics = () => {
    return [0, 1].map((handIndex) => {
      const totalDistance = totalDistanceRef.current[handIndex];
      const visibleTimeSec = handVisibleTimeRef.current[handIndex] / 1000;
      const erraticCount = erraticCountRef.current[handIndex];

      const speed = visibleTimeSec > 0 ? totalDistance / visibleTimeSec : 0;
      const erraticness = visibleTimeSec > 0 ? erraticCount / visibleTimeSec : 0;

      return {
        hand: handIndex === 0 ? 'Right Hand' : 'Left Hand',
        averageSpeed: speed,
        averageErraticness: erraticness,
        totalDistance,
        totalVisibleTime: visibleTimeSec
      };
    });
  };


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
          const handMetricsData = getFinalMetrics(); 
          const fullReport = {
            handMetrics: handMetricsData,
            feedback: fb
          };

          console.log('🖐️ Hand Metrics Reported to Parent:', handMetricsData);

          onMetricsUpdate(fullReport);;
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
