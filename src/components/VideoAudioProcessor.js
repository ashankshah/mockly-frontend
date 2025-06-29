/**
 * Video Audio Processor Component
 * Handles video/audio capture, speech recognition, and transcript processing
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
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

function VideoAudioProcessor({ onFinish }) {
  // Refs for DOM elements and state management
  const videoRef = useRef();
  const transcriptScrollableRef = useRef();
  
  // State management
  const [liveTranscript, setLiveTranscript] = useState('');
  const [listeningDots, setListeningDots] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [simulationInterval, setSimulationInterval] = useState(null);
  
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
    setIsProcessing(false);
    setLiveTranscript('');
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
      setIsProcessing(true);
      
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
    if (isTranscriptSimulationEnabled()) {
      console.log(DEV_MESSAGES.NOT_AUTO_FINISHING);
      return;
    }
    
    if (isProcessing && !hasFinished.current) {
      hasFinished.current = true;
      setTimeout(handleInterviewCompletion, INTERVIEW_CONFIG.processingDelay);
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

  // Media capture initialization
  const startCapture = async () => {
    try {
      const stream = await MediaStreamUtils.getUserMedia({ 
        video: true, 
        audio: AUDIO_CONSTRAINTS
      });
      
      MediaStreamUtils.setupVideoElement(videoRef, stream);
      
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
      const errorResult = ErrorHandler.handleMediaError(error);
      console.error(errorResult.error);
      handleInterviewCompletion();
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

  // Render functions
  const renderProcessingScreen = () => (
    <div className={CSS_CLASSES.PROCESSING_SCREEN}>
      <div className={CSS_CLASSES.PROCESSING_CONTENT}>
        <h3>{UI_TEXT.PROCESSING_TITLE}</h3>
        <p>{UI_TEXT.PROCESSING_MESSAGE}</p>
        <div className={CSS_CLASSES.PROCESSING_SPINNER}>
          <div className={CSS_CLASSES.SPINNER}></div>
        </div>
      </div>
    </div>
  );

  const renderDevModeIndicator = () => (
    <div style={{
      fontSize: '12px',
      color: '#666',
      marginTop: '8px',
      fontStyle: 'italic',
      padding: '0 var(--spacing-sm) var(--spacing-sm)',
      flexShrink: 0
    }}>
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

  const renderVideoScreen = () => (
    <div className={CSS_CLASSES.VIDEO_CONTAINER}>
      <div className="video-container">
        <div className={CSS_CLASSES.VIDEO_BOX}>
          <video
            ref={videoRef}
            className={CSS_CLASSES.VIDEO_ELEMENT}
            autoPlay
            muted
            playsInline
          />
        </div>
      </div>
      <div className={CSS_CLASSES.TRANSCRIPT_CONTAINER}>
        <div className={CSS_CLASSES.TRANSCRIPT_BOX}>
          <h4>{UI_TEXT.TRANSCRIPT_TITLE}</h4>
          <div className={CSS_CLASSES.TRANSCRIPT_SCROLLABLE} ref={transcriptScrollableRef}>
            <p
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
  );

  if (isProcessing) {
    return renderProcessingScreen();
  }

  return renderVideoScreen();
}

export default VideoAudioProcessor;
