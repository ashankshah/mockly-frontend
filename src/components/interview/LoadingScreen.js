import React, { useEffect, useRef, useState, useCallback } from 'react';
import SelectedQuestionDisplay from './SelectedQuestionDisplay';

const LoadingScreen = ({ onDone, selectedQuestion }) => {
  const [permissionStatus, setPermissionStatus] = useState('pending');
  const [error, setError] = useState('');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [mediaStream, setMediaStream] = useState(null);

  // Face detection state
  const [faceDetected, setFaceDetected] = useState(false);
  const [faceInPosition, setFaceInPosition] = useState(false);
  const [faceModel, setFaceModel] = useState(null);
  const [faceMessage, setFaceMessage] = useState('Initializing...');

  const animationFrameRef = useRef();

  // Load FaceMesh model for face detection
  const loadFaceModel = useCallback(async () => {
    try {
      if (!window.facemesh) {
        console.warn('FaceMesh library not available');
        return;
      }
      const model = await window.facemesh.load();
      setFaceModel(model);
      console.log('✅ FaceMesh model loaded for setup screen');
    } catch (err) {
      console.warn('Failed to load FaceMesh for setup screen:', err);
    }
  }, []);

  // Face detection and positioning analysis
  const detectFacePosition = useCallback(async () => {
    if (!faceModel || !videoRef.current || !canvasRef.current) return;

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (video.readyState >= 2) {
        const predictions = await faceModel.estimateFaces(video);

        if (predictions.length > 0) {
          setFaceDetected(true);

          // Get face landmarks
          const landmarks = predictions[0].scaledMesh;

          // Calculate face center (using nose tip and between eyes)
          const noseTip = landmarks[1]; // Nose tip landmark
          const leftEye = landmarks[33];
          const rightEye = landmarks[362];

          if (noseTip && leftEye && rightEye) {
            const faceCenterX = (leftEye[0] + rightEye[0]) / 2;
            const faceCenterY = (leftEye[1] + rightEye[1] + noseTip[1]) / 3;

            // Calculate video center
            const videoCenterX = video.videoWidth / 2;
            const videoCenterY = video.videoHeight / 2;

            // Calculate distance from center
            const distance = Math.sqrt(
              Math.pow(faceCenterX - videoCenterX, 2) + 
              Math.pow(faceCenterY - videoCenterY, 2)
            );

            // Check if face is in the center circle (adjust threshold as needed)
            const threshold = 80; // pixels
            const inPosition = distance < threshold;

            setFaceInPosition(inPosition);

            if (inPosition) {
              setFaceMessage('Perfect! You\'re positioned correctly');
            } else {
              // Determine direction to guide user
              const deltaX = faceCenterX - videoCenterX;
              const deltaY = faceCenterY - videoCenterY;

              let direction = '';
              if (Math.abs(deltaX) > Math.abs(deltaY)) {
                direction = deltaX > 0 ? 'Move a bit to the right' : 'Move a bit to the left';
              } else {
                direction = deltaY > 0 ? 'Move up slightly' : 'Move down slightly';
              }

              setFaceMessage(direction);
            }
          }
        } else {
          setFaceDetected(false);
          setFaceInPosition(false);
          setFaceMessage('Please position your face in the circle');
        }
      }
    } catch (err) {
      console.error('Face detection error:', err);
      setFaceMessage('Face detection active');
    }

    if (permissionStatus === 'granted') {
      animationFrameRef.current = requestAnimationFrame(detectFacePosition);
    }
  }, [faceModel, permissionStatus]);

  // Start face detection when video is ready
  useEffect(() => {
    if (faceModel && mediaStream && permissionStatus === 'granted') {
      detectFacePosition();
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [faceModel, mediaStream, permissionStatus, detectFacePosition]);

  useEffect(() => {
    let active = true;
    async function requestMedia() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: { ideal: 640 }, 
            height: { ideal: 480 },
            facingMode: 'user'
          }, 
          audio: true 
        });
        if (!active) return;
        setMediaStream(stream);
        setPermissionStatus('granted');
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error('Camera/microphone access denied:', err);
        setError('Camera and microphone access is required for the interview.');
        setPermissionStatus('denied');
      }
    }
    requestMedia();
    loadFaceModel();

    return () => {
      active = false;
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [loadFaceModel]);

  useEffect(() => {
    if (videoRef.current && mediaStream) {
      videoRef.current.srcObject = mediaStream;
    }
  }, [mediaStream]);

  const handleDone = () => {
    if (permissionStatus === 'granted' && typeof onDone === 'function') {
      onDone(mediaStream);
    }
  };

  const handleRetry = async () => {
    setError('');
    setPermissionStatus('pending');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 }, 
          height: { ideal: 480 },
          facingMode: 'user'
        }, 
        audio: true 
      });
      setMediaStream(stream);
      setPermissionStatus('granted');
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Retry failed:', err);
      setError('Camera and microphone access is still required.');
      setPermissionStatus('denied');
    }
  };

  const circleClassName = `setup-screen__guidance-circle ${faceInPosition ? 'setup-screen__guidance-circle--ok' : 'setup-screen__guidance-circle--warn'}`;

  return (
    <div className="setup-screen">
      <div className="card card--processing">
        <div className="setup-screen__content">
          <h2 className="setup-screen__title">Interview Setup</h2>
          <p className="setup-screen__subtitle">
            We need access to your camera and microphone for the interview. Position yourself in the circle below.
          </p>

          {selectedQuestion && (
            <SelectedQuestionDisplay 
              questionId={selectedQuestion} 
              variant="minimal" 
              className="setup-screen__question"
            />
          )}

          <div className="setup-screen__video-container">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
              className="setup-screen__video"
            />

            <div className={circleClassName} aria-hidden="true">
              {faceInPosition && <span className="setup-screen__check">✓</span>}
        </div>

        {permissionStatus === 'pending' && (
              <div className="setup-screen__overlay" role="status" aria-live="polite">
                <div className="setup-screen__spinner" />
                <div className="setup-screen__overlay-text">Requesting camera access...</div>
          </div>
        )}

        {permissionStatus === 'denied' && (
              <div className="setup-screen__overlay setup-screen__overlay--error" role="alert">
                <div className="setup-screen__overlay-icon">📷</div>
                <div className="setup-screen__overlay-title">Camera access denied</div>
                <div className="setup-screen__overlay-text">Please allow camera and microphone access to continue</div>
              </div>
            )}

            <canvas ref={canvasRef} className="setup-screen__canvas" width={640} height={480} />
      </div>

      {permissionStatus === 'granted' && (
            <div className={`setup-screen__feedback ${faceInPosition ? 'setup-screen__feedback--ok' : 'setup-screen__feedback--warn'}`} aria-live="polite">
          {faceDetected ? (
            <span>
              {faceInPosition ? '✅ ' : '👤 '}
              {faceMessage}
            </span>
          ) : (
            <span>👤 {faceMessage}</span>
          )}
        </div>
      )}

          <div className="setup-screen__actions">
        {permissionStatus === 'denied' && (
              <button className="button" onClick={handleRetry}>Try Again</button>
        )}

        <button
              className={`button ${permissionStatus !== 'granted' ? 'button--disabled' : ''}`}
          disabled={permissionStatus !== 'granted'}
          onClick={handleDone}
        >
          {permissionStatus === 'granted' ? 'Start Interview' : 'Waiting for Access'}
        </button>
      </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;