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
  createSimulation(config, transcriptRef, updateTranscript, isFinished) {
    let currentIndex = 0;
    
    const interval = setInterval(() => {
      if (currentIndex >= config.sentences.length || isFinished()) {
        clearInterval(interval);
        return;
      }
      
      if (config.showInterim) {
        this.showInterimText(config, transcriptRef, updateTranscript, currentIndex, isFinished);
      } else {
        this.showFinalSentence(config, transcriptRef, updateTranscript, currentIndex);
      }
      currentIndex++;
    }, config.interval);
    
    return interval;
  },

  showInterimText(config, transcriptRef, updateTranscript, currentIndex, isFinished) {
    const interimText = config.interimText;
    const newInterimTranscript = (transcriptRef.current + (transcriptRef.current ? ' ' : '') + interimText);
    updateTranscript(newInterimTranscript);
    
    setTimeout(() => {
      if (isFinished()) return;
      
      const finalSentence = config.sentences[currentIndex];
      transcriptRef.current += finalSentence + ' ';
      updateTranscript(transcriptRef.current);
    }, config.interimDelay);
  },

  showFinalSentence(config, transcriptRef, updateTranscript, currentIndex) {
    const finalSentence = config.sentences[currentIndex];
    transcriptRef.current += finalSentence + ' ';
    updateTranscript(transcriptRef.current);
  }
};

function VideoAudioProcessor({ onFinish, onEnd, selectedQuestion }) {
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
  const [mediaStream, setMediaStream] = useState(null);
  
  // Internal state refs
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
    transcriptRef.current = '';
  };

  const cleanupResources = () => {
    // Clear timeouts and intervals
    if (dotIntervalRef.current) {
      clearInterval(dotIntervalRef.current);
      dotIntervalRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (processingTimeoutRef.current) {
      clearTimeout(processingTimeoutRef.current);
      processingTimeoutRef.current = null;
    }
    if (simulationInterval) {
      clearInterval(simulationInterval);
      setSimulationInterval(null);
    }
    
    // Stop media tracks
    if (mediaStream) {
      MediaStreamUtils.stopTracks(mediaStream);
      setMediaStream(null);
    }
  };

  // Interview completion handling
  const handleInterviewCompletion = () => {
    // Get the complete transcript (includes both final and interim results)
    const completeTranscript = transcriptRef.current || liveTranscript || '';
    
    // Debug logging
    console.log('Interview completion - Complete transcript:', completeTranscript);
    console.log('Interview completion - Live transcript:', liveTranscript);
    
    // Simple validation - just check if we have any meaningful content
    const hasValidTranscript = completeTranscript.trim().length > 0;
    
    console.log('Interview completion - Has valid transcript:', hasValidTranscript);
    
    if (hasValidTranscript) {
      console.log('Interview completion - Using transcript:', completeTranscript);
      onFinish(DEFAULT_METRICS, completeTranscript);
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
    
    // Build the complete transcript from all results
    let completeTranscript = '';
    
    for (let i = 0; i < event.results.length; i++) {
      const result = event.results[i];
      const transcript = result[0].transcript;
      completeTranscript += transcript + ' ';
    }
    
    // Store the complete transcript - this includes both final and interim results
    transcriptRef.current = completeTranscript.trim();
    
    // Update the live display
    updateTranscriptWithScroll(completeTranscript.trim());
    
    console.log('Complete transcript:', completeTranscript.trim());
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
    console.log('Speech recognition ended');
    if (hasFinished.current) return;
    
    if (isTranscriptSimulationEnabled()) {
      console.log(DEV_MESSAGES.NOT_AUTO_FINISHING);
      return;
    }
    
    if (recognitionRef.current) {
      console.log('Restarting speech recognition...');
      recognitionRef.current.start();
    }
  };

  // Transcript simulation management
  const startTranscriptSimulation = useCallback(() => {
    if (!isTranscriptSimulationEnabled()) return;
    
    const config = getTranscriptSimulationConfig();
    const interval = TranscriptSimulationManager.createSimulation(
      config,
      transcriptRef,
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
      setMediaStream(null);
      
      let stream = null;
      
      // First try to get both video and audio
      try {
        console.log('Attempting to get video and audio...');
        stream = await MediaStreamUtils.getUserMedia({ 
          video: true, 
          audio: AUDIO_CONSTRAINTS
        });
        console.log('Successfully got video and audio stream:', stream);
        console.log('Video tracks:', stream.getVideoTracks());
        console.log('Audio tracks:', stream.getAudioTracks());
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
      setMediaStream(stream);
      
      // Check if we have video tracks and set state accordingly
      if (stream && stream.getVideoTracks().length > 0) {
        console.log('Video tracks found, setting hasVideo to true');
        setHasVideo(true);
        setIsAudioOnly(false);
      } else {
        console.log('No video tracks found, setting audio only mode');
        setHasVideo(false);
        setIsAudioOnly(true);
      }
      
      if (!isTranscriptSimulationEnabled()) {
        const recognition = SpeechRecognitionUtils.createRecognition();
        recognition.onresult = handleSpeechResult;
        recognition.onerror = handleSpeechError;
        recognition.onend = handleSpeechEnd;
        
        // Add essential event handlers for debugging
        recognition.onstart = () => {
          console.log('Speech recognition started');
        };
        
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
        setPermissionError('Camera/microphone access was denied. Please allow access and try again.');
      } else if (error.name === 'NotFoundError') {
        setPermissionError('No camera/microphone found. Please connect a device and try again.');
      } else if (error.name === 'NotReadableError') {
        setPermissionError('Camera/microphone is already in use by another application.');
      } else {
        setPermissionError('Failed to access camera/microphone. Please check your device and try again.');
      }
    }
  };

  // Retry permission request
  const retryPermissions = () => {
    resetComponentState();
    startCapture();
  };

  // Handle done interview functionality (same as old skip)
  const handleDoneInterview = () => {
    if (hasFinished.current) return;
    
    // Show confirmation dialog
    const confirmDone = window.confirm(UI_TEXT.SKIP_CONFIRMATION);
    if (!confirmDone) return;
    
    hasFinished.current = true;
    
    // Stop recognition if active
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    
    // Stop any media tracks
    if (mediaStream) {
      MediaStreamUtils.stopTracks(mediaStream);
    }
    
    // Clean up resources
    cleanupResources();
    
    // Process the interview with whatever transcript we have so far
    setTimeout(() => {
      handleInterviewCompletion();
    }, INTERVIEW_CONFIG.processingDelay);
  };

  // Handle end interview functionality (go back to question selection)
  const handleEndInterview = () => {
    if (hasFinished.current) return;
    
    // Show confirmation dialog
    const confirmEnd = window.confirm(UI_TEXT.END_CONFIRMATION);
    if (!confirmEnd) return;
    
    hasFinished.current = true;
    
    // Stop recognition if active
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    
    // Stop any media tracks
    if (mediaStream) {
      MediaStreamUtils.stopTracks(mediaStream);
    }
    
    // Clean up resources
    cleanupResources();
    
    // Go directly back to question selection without processing
    if (onEnd) {
      onEnd();
    }
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

  // New effect to handle video element setup when both hasVideo and mediaStream are ready
  useEffect(() => {
    if (hasVideo && mediaStream && mediaStream.getVideoTracks().length > 0) {
      console.log('Setting up video element with stream:', mediaStream);
      const success = MediaStreamUtils.setupVideoElement(videoRef, mediaStream);
      if (success) {
        console.log('Video element setup complete');
        // Wait a bit for video to load and log its state
        setTimeout(() => {
          if (videoRef.current) {
            console.log('Video element state:', {
              videoWidth: videoRef.current.videoWidth,
              videoHeight: videoRef.current.videoHeight,
              readyState: videoRef.current.readyState,
              paused: videoRef.current.paused,
              srcObject: videoRef.current.srcObject
            });
          }
        }, 1000);
      } else {
        console.error('Failed to setup video element');
      }
    }
  }, [hasVideo, mediaStream]);

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

  const renderVideoCard = () => {
    console.log('Rendering video card - hasVideo:', hasVideo, 'isAudioOnly:', isAudioOnly);
    
    return (
      <div className={`video-card ${isVideoCardExpanded ? 'video-card--expanded' : ''}`}>
        <div className="video-card__header">
          <span className="video-card__title">Camera Views</span>
          <button 
            className="video-card__toggle"
            onClick={toggleVideoCard}
            aria-label={isVideoCardExpanded ? 'Collapse video views' : 'Expand video views'}
          >
            <span className={`video-card__arrow ${isVideoCardExpanded ? 'video-card__arrow--down' : 'video-card__arrow--up'}`}>
              {isVideoCardExpanded ? '▼' : '▲'}
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
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onLoadedMetadata={() => console.log('Video element metadata loaded')}
                  onPlay={() => console.log('Video element started playing')}
                  onError={(e) => console.error('Video element error:', e)}
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
  };

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
      
      {/* Interview control buttons - bottom right */}
      <div className="interview-layout__button-container">
        <button 
          className="button interview-layout__end-button"
          onClick={handleEndInterview}
          aria-label="End interview and return to selection"
          title="End interview early"
        >
          <i className="fas fa-times" style={{ marginRight: '0.5rem' }}></i>
          {UI_TEXT.END_INTERVIEW}
        </button>
        <button 
          className="button interview-layout__done-button"
          onClick={handleDoneInterview}
          aria-label="Finish interview with current response"
          title="Finish interview with current response"
        >
          <i className="fas fa-check" style={{ marginRight: '0.5rem' }}></i>
          {UI_TEXT.SKIP_INTERVIEW}
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
