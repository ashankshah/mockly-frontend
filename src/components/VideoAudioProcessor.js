/**
 * Video Audio Processor Component
 * Handles video/audio capture, speech recognition, and transcript processing
 * Refactored to use custom hooks and presentational components
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import SelectedQuestionDisplay from './SelectedQuestionDisplay';
import PermissionScreen from './PermissionScreen';
import VideoCard from './VideoCard';
import TranscriptDisplay from './TranscriptDisplay';
import { useMediaStream } from '../hooks/useMediaStream';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useTranscriptSimulation } from '../hooks/useTranscriptSimulation';
import { DevHelpers } from '../config/devConfig';
import { ResourceCleanup } from '../utils/resourceCleanup';
import { DEFAULT_METRICS, TranscriptValidator } from '../utils/interviewUtils';
import { INTERVIEW_CONFIG, UI_TEXT, ERROR_MESSAGES } from '../constants/interviewConstants';

const VideoAudioProcessor = React.memo(({ onFinish, onEnd, selectedQuestion }) => {
  // UI state
  const [listeningDots, setListeningDots] = useState('');
  const [isVideoCardExpanded, setIsVideoCardExpanded] = useState(true);
  const [isFinished, setIsFinished] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Refs for cleanup and scrolling
  const transcriptScrollableRef = useRef();
  const dotIntervalRef = useRef();
  const timeoutRef = useRef();

  // Custom hooks
  const mediaStream = useMediaStream();
  const speechRecognition = useSpeechRecognition();
  const transcriptSimulation = useTranscriptSimulation();

  // Get the current transcript from appropriate source
  const getCurrentTranscript = useCallback(() => {
    if (DevHelpers.isTranscriptSimulationEnabled()) {
      return transcriptSimulation.getFinalTranscript();
    }
    return speechRecognition.getFinalTranscript();
  }, [transcriptSimulation, speechRecognition]);

  // Get the live transcript for display
  const getLiveTranscript = useCallback(() => {
    if (DevHelpers.isTranscriptSimulationEnabled()) {
      return transcriptSimulation.simulatedTranscript;
    }
    return speechRecognition.transcript;
  }, [transcriptSimulation.simulatedTranscript, speechRecognition.transcript]);

  // Listening dots animation
  const setupDotAnimation = useCallback(() => {
    if (dotIntervalRef.current) {
      clearInterval(dotIntervalRef.current);
    }
    dotIntervalRef.current = setInterval(() => {
      setListeningDots(prev => (prev.length >= INTERVIEW_CONFIG.maxDots ? '' : prev + '.'));
    }, INTERVIEW_CONFIG.dotAnimationInterval);
  }, []);

  // Session timeout
  const setupSessionTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      if (isFinished) return;
      
      DevHelpers.log('Session timeout reached, finishing interview');
      handleInterviewCompletion();
    }, INTERVIEW_CONFIG.sessionDuration);
  }, [isFinished]);

  // Auto-scroll transcript
  const scrollToBottom = useCallback(() => {
    if (transcriptScrollableRef.current) {
      transcriptScrollableRef.current.scrollTop = transcriptScrollableRef.current.scrollHeight;
    }
  }, []);

  // Handle interview completion
  const handleInterviewCompletion = useCallback(() => {
    if (isFinished) return;
    
    setIsFinished(true);
    const completeTranscript = getCurrentTranscript();
    
    DevHelpers.log('Interview completion:', { transcript: completeTranscript });
    
    if (TranscriptValidator.isValid(completeTranscript)) {
      onFinish(DEFAULT_METRICS, completeTranscript);
    } else {
      // Replace alert with better UX - could be a modal in the future
      DevHelpers.error(ERROR_MESSAGES.NO_SPEECH_DETECTED);
      // For now, still proceed with empty transcript
      onFinish(DEFAULT_METRICS, '');
    }
  }, [isFinished, getCurrentTranscript, onFinish]);

  // Handle done interview (user wants to finish with current response)
  const handleDoneInterview = useCallback(() => {
    if (isFinished) return;
    
    // TODO: Replace with custom modal component
    const confirmDone = window.confirm(UI_TEXT.SKIP_CONFIRMATION);
    if (!confirmDone) return;
    
    handleInterviewCompletion();
  }, [isFinished, handleInterviewCompletion]);

  // Handle end interview (user wants to go back to question selection)
  const handleEndInterview = useCallback(() => {
    if (isFinished) return;
    
    // TODO: Replace with custom modal component
    const confirmEnd = window.confirm(UI_TEXT.END_CONFIRMATION);
    if (!confirmEnd) return;
    
    setIsFinished(true);
    if (onEnd) onEnd();
  }, [isFinished, onEnd]);

  // Toggle video card expansion
  const toggleVideoCard = useCallback(() => {
    setIsVideoCardExpanded(prev => !prev);
  }, []);

  // Initialize everything
  const initializeInterview = useCallback(async () => {
    if (isInitialized) return;
    
    try {
      setIsInitialized(true);
      setupDotAnimation();
      
      // Start media capture
      const stream = await mediaStream.startCapture();
      
      // Start speech recognition or simulation
      if (DevHelpers.isTranscriptSimulationEnabled()) {
        transcriptSimulation.startSimulation();
      } else {
        speechRecognition.startListening();
      }
      
      // Setup session timeout
      setupSessionTimeout();
      
      DevHelpers.log('Interview initialized successfully');
    } catch (error) {
      DevHelpers.error('Failed to initialize interview:', error);
      setIsInitialized(false);
    }
  }, [isInitialized, mediaStream, speechRecognition, transcriptSimulation, setupDotAnimation, setupSessionTimeout]);

  // Cleanup all resources
  const cleanupAll = useCallback(() => {
    ResourceCleanup.cleanupAll({
      timeouts: [timeoutRef],
      intervals: [dotIntervalRef],
      mediaStreams: [mediaStream.mediaStream],
      speechRecognition: []
    });
    
    mediaStream.stopCapture();
    speechRecognition.stopListening();
    transcriptSimulation.stopSimulation();
  }, [mediaStream, speechRecognition, transcriptSimulation]);

  // Auto-scroll effect
  useEffect(() => {
    scrollToBottom();
  }, [getLiveTranscript(), scrollToBottom]);

  // Initialize on mount - only run once
  useEffect(() => {
    if (!isInitialized) {
      initializeInterview();
    }
    
    return () => {
      setIsFinished(true);
      cleanupAll();
    };
  }, []); // Empty dependency array to run only once

  // Handle permission retry
  const handleRetry = useCallback(() => {
    setIsInitialized(false);
    mediaStream.retryCapture();
  }, [mediaStream]);

  // Show permission screen if needed
  if (mediaStream.permissionState !== 'granted') {
    return (
      <PermissionScreen
        permissionState={mediaStream.permissionState}
        permissionError={mediaStream.permissionError}
        onRetry={handleRetry}
      />
    );
  }

  // Main interview interface
  return (
    <div className="video-processor">
      {/* Question display */}
      <div className="video-processor__question-section">
        <SelectedQuestionDisplay 
          questionId={selectedQuestion} 
          variant="interview" 
        />
      </div>
      
      {/* Main content */}
      <div className="interview-content-wrapper">
        {/* Video sidebar */}
        <div className="interview-sidebar">
          <VideoCard
            hasVideo={mediaStream.hasVideo}
            isAudioOnly={mediaStream.isAudioOnly}
            isExpanded={isVideoCardExpanded}
            onToggle={toggleVideoCard}
            videoRef={mediaStream.videoRef}
            mediaStream={mediaStream.mediaStream}
          />
        </div>
        
        {/* Transcript main area */}
        <div className="interview-main">
          <div className="transcript-main">
            <div className="transcript-main__header">
              <h3 className="transcript-main__title">Live Transcript</h3>
            </div>
            <div className="transcript-main__content" ref={transcriptScrollableRef}>
              <p className="transcript-main__text">
                {getLiveTranscript() || `${speechRecognition.isListening ? 'Listening' : 'Ready to listen'}${listeningDots}`}
              </p>
              {DevHelpers.isTranscriptSimulationEnabled() && (
                <div className="transcript-main__dev-indicator">
                  [DEV] Transcript simulation active
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Control buttons */}
      <div className="interview-layout__button-container">
        <button 
          className="button interview-layout__end-button"
          onClick={handleEndInterview}
          aria-label="End interview and return to selection"
        >
          <i className="fas fa-times icon-sm"></i>
          {UI_TEXT.END_INTERVIEW}
        </button>
        <button 
          className="button interview-layout__done-button"
          onClick={handleDoneInterview}
          aria-label="Finish interview with current response"
        >
          <i className="fas fa-check icon-sm"></i>
          {UI_TEXT.SKIP_INTERVIEW}
        </button>
      </div>
    </div>
  );
});

VideoAudioProcessor.displayName = 'VideoAudioProcessor';

export default VideoAudioProcessor;
