/**
 * Video Audio Processor Component
 * Handles video/audio capture, speech recognition, and transcript processing
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import SelectedQuestionDisplay from './SelectedQuestionDisplay';
import { isTranscriptSimulationEnabled, getTranscriptSimulationConfig } from '../config';
import { 
  DEFAULT_METRICS, 
  TranscriptValidator, 
  MediaStreamUtils, 
  SpeechRecognitionUtils,
  TimeoutManager,
  ErrorHandler
} from '../utils/interviewUtils';
import { 
  INTERVIEW_CONFIG, 
  AUDIO_CONSTRAINTS, 
  CSS_CLASSES, 
  UI_TEXT, 
  ERROR_MESSAGES, 
  DEV_MESSAGES 
} from '../constants/interviewConstants';

// Transcript simulation manager
const TranscriptSimulationManager = {
  createSimulation(config, finalBuffer, updateTranscript, isFinished) {
    let currentIndex = 0;
    
    const interval = setInterval(() => {
      if (currentIndex >= config.sentences.length || isFinished()) {
        clearInterval(interval);
        return;
      }
      
      if (config.showInterim) {
        this.showInterimText(config, finalBuffer, updateTranscript, currentIndex, isFinished);
      } else {
        this.showFinalSentence(config, finalBuffer, updateTranscript, currentIndex);
      }
      currentIndex++;
    }, config.interval);
    
    return interval;
  },

  showInterimText(config, finalBuffer, updateTranscript, currentIndex, isFinished) {
    const interimText = config.interimText;
    const newInterimTranscript = (finalBuffer.current + (finalBuffer.current ? ' ' : '') + interimText);
    updateTranscript(newInterimTranscript);
    
    setTimeout(() => {
      if (isFinished()) return;
      
      const finalSentence = config.sentences[currentIndex];
      finalBuffer.current += finalSentence + ' ';
      updateTranscript(finalBuffer.current);
    }, config.interimDelay);
  },

  showFinalSentence(config, finalBuffer, updateTranscript, currentIndex) {
    const finalSentence = config.sentences[currentIndex];
    finalBuffer.current += finalSentence + ' ';
    updateTranscript(finalBuffer.current);
  }
};

function VideoAudioProcessor({ onFinish, selectedQuestion }) {
  // Refs for DOM elements and state management
  const videoRef = useRef();
  const transcriptScrollableRef = useRef();
  
  // State management
  const [liveTranscript, setLiveTranscript] = useState('');
  const [listeningDots, setListeningDots] = useState('');
  const [simulationInterval, setSimulationInterval] = useState(null);
  const [permissionState, setPermissionState] = useState('requesting'); // 'requesting', 'granted', 'denied'
  const [permissionError, setPermissionError] = useState('');
  const [hasVideo, setHasVideo] = useState(false);
  const [isAudioOnly, setIsAudioOnly] = useState(false);
  const [isVideoCardExpanded, setIsVideoCardExpanded] = useState(false);
  
  // Internal state refs
  const finalTranscriptBuffer = useRef('');
  const transcriptRef = useRef('');
  const hasFinished = useRef(false);
  const hasInitialized = useRef(false);
  
  // Timeout and interval refs
  const dotIntervalRef = useRef(null);
  const recognitionRef = useRef(null);
  const timeoutRef = useRef(null);
  const processingTimeoutRef = useRef(null);

  // Auto-scroll functionality
  const scrollToBottom = useCallback(() => {
    if (transcriptScrollableRef.current) {
      const element = transcriptScrollableRef.current;
      element.scrollTop = element.scrollHeight;
    }
  }, []);

  const updateTranscriptWithScroll = useCallback((newTranscript) => {
    setLiveTranscript(newTranscript);
    requestAnimationFrame(scrollToBottom);
  }, [scrollToBottom]);

  // Component state management
  const resetComponentState = () => {
    hasFinished.current = false;
    hasInitialized.current = false;
    setLiveTranscript('');
    setPermissionState('requesting');
    setPermissionError('');
    finalTranscriptBuffer.current = '';
    transcriptRef.current = '';
  };

  const cleanupResources = () => {
    const timeoutRefs = [timeoutRef, processingTimeoutRef];
    const intervalRefs = [dotIntervalRef];
    
    TimeoutManager.clearAllTimeouts(timeoutRefs);
    TimeoutManager.clearAllIntervals(intervalRefs);
    
    if (simulationInterval) {
      clearInterval(simulationInterval);
      setSimulationInterval(null);
    }
    
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  // Interview completion handling
  const handleInterviewCompletion = () => {
    const finalTranscript = TranscriptValidator.getFinalTranscript(
      finalTranscriptBuffer.current, 
      transcriptRef.current
    );
    
    if (TranscriptValidator.isValid(finalTranscript)) {
      onFinish(DEFAULT_METRICS, finalTranscript);
    } else {
      alert(ERROR_MESSAGES.NO_SPEECH_DETECTED);
      resetComponentState();
    }
  };

  // Dot animation management
  const setupDotAnimation = () => {
    dotIntervalRef.current = setInterval(() => {
      setListeningDots(prev => (prev.length >= INTERVIEW_CONFIG.maxDots ? '' : prev + '.'));
    }, INTERVIEW_CONFIG.dotAnimationInterval);
  };

  // Session timeout management
  const setupSessionTimeout = (stream) => {
    timeoutRef.current = TimeoutManager.createTimeout(() => {
      if (hasFinished.current) return;
      
      hasFinished.current = true;
      
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      
      MediaStreamUtils.stopTracks(stream);
      
      processingTimeoutRef.current = TimeoutManager.createTimeout(() => {
        handleInterviewCompletion();
      }, INTERVIEW_CONFIG.fallbackTimeout);
    }, INTERVIEW_CONFIG.sessionDuration);
  };

  // Speech recognition event handlers
  const handleSpeechResult = (event) => {
    if (hasFinished.current) return;
    
    const newFinalBuffer = SpeechRecognitionUtils.processResults(
      event, 
      finalTranscriptBuffer.current, 
      updateTranscriptWithScroll
    );
    
    finalTranscriptBuffer.current = newFinalBuffer;
    transcriptRef.current = finalTranscriptBuffer.current;
  };

  const handleSpeechError = (error) => {
    console.error("Speech recognition error:", error);
    
    if (isTranscriptSimulationEnabled() && error.error === 'no-speech') {
      console.log(DEV_MESSAGES.IGNORING_NO_SPEECH);
      return;
    }
    
    if (hasFinished.current) {
      recognitionRef.current.stop();
    }
  };

  const handleSpeechEnd = () => {
    if (hasFinished.current) return;
    
    if (isTranscriptSimulationEnabled()) {
      console.log(DEV_MESSAGES.NOT_AUTO_FINISHING);
      return;
    }
    
    if (recognitionRef.current) {
      recognitionRef.current.start();
    }
  };

  // Transcript simulation management
  const startTranscriptSimulation = useCallback(() => {
    if (!isTranscriptSimulationEnabled()) return;
    
    const config = getTranscriptSimulationConfig();
    const interval = TranscriptSimulationManager.createSimulation(
      config,
      finalTranscriptBuffer,
      updateTranscriptWithScroll,
      () => hasFinished.current
    );
    
    setSimulationInterval(interval);
  }, [updateTranscriptWithScroll]);

  // Media capture initialization with better error handling
  const startCapture = async () => {
    try {
      setPermissionState('requesting');
      setPermissionError('');
      setHasVideo(false);
      setIsAudioOnly(false);
      
      let stream = null;
      
      // First try to get both video and audio
      try {
        stream = await MediaStreamUtils.getUserMedia({ 
          video: true, 
          audio: AUDIO_CONSTRAINTS
        });
        setHasVideo(true);
        console.log('Successfully got video and audio');
      } catch (videoError) {
        console.log('Video failed, trying audio only:', videoError.message);
        
        // If video+audio fails, try just audio
        try {
          stream = await MediaStreamUtils.getUserMedia({ 
            video: false, 
            audio: AUDIO_CONSTRAINTS
          });
          setIsAudioOnly(true);
          console.log('Successfully got audio only');
        } catch (audioError) {
          throw audioError; // Re-throw to be caught by outer catch
        }
      }
      
      setPermissionState('granted');
      
      // Only setup video if we have a video stream with tracks
      if (stream && stream.getVideoTracks().length > 0) {
        MediaStreamUtils.setupVideoElement(videoRef, stream);
        setHasVideo(true);
      } else {
        setHasVideo(false);
        setIsAudioOnly(true);
      }
      
      if (!isTranscriptSimulationEnabled()) {
        const recognition = SpeechRecognitionUtils.createRecognition();
        recognition.onresult = handleSpeechResult;
        recognition.onerror = handleSpeechError;
        recognition.onend = handleSpeechEnd;
        
        recognitionRef.current = recognition;
        recognition.start();
      } else {
        console.log(DEV_MESSAGES.SKIPPING_SPEECH_RECOGNITION);
      }
      
      setupSessionTimeout(stream);
      
      if (isTranscriptSimulationEnabled()) {
        startTranscriptSimulation();
      }
      
    } catch (error) {
      console.error("Media capture error:", error);
      setPermissionState('denied');
      
      // Set appropriate error message based on error type
      if (error.name === 'NotAllowedError') {
        setPermissionError('Microphone access was denied. Please allow access and try again.');
      } else if (error.name === 'NotFoundError') {
        setPermissionError('No microphone found. Please connect a microphone and try again.');
      } else if (error.name === 'NotReadableError') {
        setPermissionError('Microphone is already in use by another application.');
      } else {
        setPermissionError('Failed to access microphone. Please check your device and try again.');
      }
    }
  };

  // Retry permission request
  const retryPermissions = () => {
    resetComponentState();
    startCapture();
  };

  // Handle skip interview functionality
  const handleSkipInterview = () => {
    if (hasFinished.current) return;
    
    // Show confirmation dialog
    const confirmSkip = window.confirm(UI_TEXT.SKIP_CONFIRMATION);
    if (!confirmSkip) return;
    
    hasFinished.current = true;
    
    // Stop recognition if active
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    
    // Stop any media tracks
    if (videoRef.current && videoRef.current.srcObject) {
      MediaStreamUtils.stopTracks(videoRef.current.srcObject);
    }
    
    // Clean up resources
    cleanupResources();
    
    // Process the interview with whatever transcript we have so far
    setTimeout(() => {
      handleInterviewCompletion();
    }, INTERVIEW_CONFIG.processingDelay);
  };

  // Effects
  useEffect(() => {
    if (transcriptScrollableRef.current) {
      transcriptScrollableRef.current.scrollTop = transcriptScrollableRef.current.scrollHeight;
    }
  }, [liveTranscript]);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    setupDotAnimation();
    startCapture();

    return () => {
      hasFinished.current = true;
      cleanupResources();
    };
  }, []);

  // Render functions

  const renderPermissionScreen = () => (
    <div className="permission-screen">
      <div className="card card--dynamic">
        <div className="permission-screen__content">
          <h3 className="permission-screen__title">
            {permissionState === 'requesting' ? 'Requesting Permissions' : 'Permission Required'}
          </h3>
          {permissionState === 'requesting' ? (
            <div>
              <p className="permission-screen__message">
                Please allow access to your microphone to start the interview. Camera access is optional.
              </p>
              <div className="permission-screen__spinner">
                <div className="permission-screen__spinner-element"></div>
              </div>
            </div>
          ) : (
            <div>
              <p className="permission-screen__error">{permissionError}</p>
              <div className="permission-screen__instructions">
                <h4>To enable microphone access:</h4>
                <ol>
                  <li>Look for the microphone icon in your browser's address bar</li>
                  <li>Click it and select "Allow"</li>
                  <li>Or check your browser settings under Privacy & Security → Microphone</li>
                  <li>Note: Camera is optional - the interview works with just your microphone</li>
                  <li>Refresh the page if needed</li>
                </ol>
              </div>
              <button 
                className="button permission-screen__retry-button"
                onClick={retryPermissions}
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderDevModeIndicator = () => (
    <div className="transcript-main__dev-indicator">
      {DEV_MESSAGES.SIMULATION_ACTIVE}
    </div>
  );

  const renderTranscriptContent = () => {
    const formattedTranscript = TranscriptValidator.formatContent(liveTranscript);
    
    if (formattedTranscript) {
      return formattedTranscript;
    }
    
    return isTranscriptSimulationEnabled()
      ? DEV_MESSAGES.SIMULATION_ENABLED
      : `${UI_TEXT.LISTENING} ${listeningDots}`;
  };

  const toggleVideoCard = () => {
    setIsVideoCardExpanded(!isVideoCardExpanded);
  };

  const renderVideoCard = () => (
    <div className={`video-card ${isVideoCardExpanded ? 'video-card--expanded' : ''}`}>
      <div className="video-card__header">
        <span className="video-card__title">Camera Views</span>
        <button 
          className="video-card__toggle"
          onClick={toggleVideoCard}
          aria-label={isVideoCardExpanded ? 'Collapse video views' : 'Expand video views'}
        >
          <span className={`video-card__arrow ${isVideoCardExpanded ? 'video-card__arrow--up' : 'video-card__arrow--down'}`}>
            {isVideoCardExpanded ? '▲' : '▼'}
          </span>
        </button>
      </div>
      
      <div className="video-card__content">
        {/* Primary video output */}
        <div className="video-card__video-container">
          <div className="video-card__video-label">You</div>
          <div className="video-card__video-box">
            {hasVideo ? (
              <video
                ref={videoRef}
                className="video-card__video-element"
                autoPlay
                muted
                playsInline
              />
            ) : (
              <div className="video-card__audio-only-placeholder">
                <div className="video-card__audio-only-icon">🎤</div>
                <div className="video-card__audio-only-text">
                  <span>Audio Only</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Additional video outputs - shown when expanded */}
        {isVideoCardExpanded && (
          <>
            <div className="video-card__video-container">
              <div className="video-card__video-label">Interviewer</div>
              <div className="video-card__video-box video-card__video-box--placeholder">
                <div className="video-card__placeholder">
                  <div className="video-card__placeholder-icon">👤</div>
                  <div className="video-card__placeholder-text">
                    <span>Interviewer View</span>
                    <small>Not available</small>
                  </div>
                </div>
              </div>
            </div>

            <div className="video-card__video-container">
              <div className="video-card__video-label">Screen Share</div>
              <div className="video-card__video-box video-card__video-box--placeholder">
                <div className="video-card__placeholder">
                  <div className="video-card__placeholder-icon">🖥️</div>
                  <div className="video-card__placeholder-text">
                    <span>Screen Share</span>
                    <small>Not available</small>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );

  const renderVideoScreen = () => (
    <>
      {/* Question display at the top */}
      <div style={{ marginBottom: 'var(--spacing-md)' }}>
        <SelectedQuestionDisplay 
          questionId={selectedQuestion} 
          variant="interview" 
        />
      </div>
      
      {/* Main content area with sidebar */}
      <div className="interview-content-wrapper">
        {/* Video card sidebar */}
        <div className="interview-sidebar">
          {renderVideoCard()}
        </div>
        
        {/* Main transcript area */}
        <div className="interview-main">
          <div className="transcript-main">
            <div className="transcript-main__header">
              <h2 className="transcript-main__title">{UI_TEXT.TRANSCRIPT_TITLE}</h2>
            </div>
            <div className="transcript-main__content" ref={transcriptScrollableRef}>
              <p
                className="transcript-main__text"
                title="Scroll to see full transcript"
                role="log"
                aria-live="polite"
                aria-label="Live interview transcript"
              >
                {renderTranscriptContent()}
              </p>
              {isTranscriptSimulationEnabled() && renderDevModeIndicator()}
            </div>
          </div>
        </div>
      </div>
      
      {/* Skip interview button */}
      <div style={{ position: 'fixed', bottom: 'var(--spacing-lg)', right: 'var(--spacing-lg)', zIndex: 10 }}>
        <button 
          className="button interview-layout__skip-button"
          onClick={handleSkipInterview}
          aria-label="Skip and end interview"
          title="Skip and end interview"
        >
          {UI_TEXT.SKIP_INTERVIEW} ⏭️
        </button>
      </div>
    </>
  );

  // Main render logic
  if (permissionState === 'requesting' || permissionState === 'denied') {
    return renderPermissionScreen();
  }

  return renderVideoScreen();
}

export default VideoAudioProcessor;
