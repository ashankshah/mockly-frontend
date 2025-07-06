/**
 * Interview Utilities
 * Core utility functions for interview functionality
 */

import { DevHelpers } from '../config/devConfig';

// Score evaluation constants
export const SCORE_THRESHOLDS = {
  EXCELLENT: 4.0,
  GOOD: 3.0
};

// Default metrics for fallback scenarios
export const DEFAULT_METRICS = {
  voice: { score: 3.5 },
  face: { score: 4.2 }
};

// Score evaluation utility
export const ScoreEvaluator = {
  getScoreVariant(score) {
    if (score >= SCORE_THRESHOLDS.EXCELLENT) return "success";
    if (score >= SCORE_THRESHOLDS.GOOD) return "warning";
    return "error";
  },

  isExcellent(score) {
    return score >= SCORE_THRESHOLDS.EXCELLENT;
  },

  isGood(score) {
    return score >= SCORE_THRESHOLDS.GOOD;
  }
};

// Transcript validation utility
export const TranscriptValidator = {
  isValid(transcript) {
    if (!transcript) return false;
    const cleanTranscript = transcript.trim();
    return cleanTranscript.length > 0 && cleanTranscript !== "No speech detected.";
  },

  formatContent(transcript) {
    if (!transcript) return '';
    return transcript.trim().replace(/\s+/g, ' ');
  }
};

// Error handling utility
export const ErrorHandler = {
  handleApiError(error, context = 'API request') {
    DevHelpers.error(`Error in ${context}:`, error);
    return {
      success: false,
      error: error.message || 'Unknown error occurred'
    };
  },

  handleMediaError(error) {
    DevHelpers.error("Media capture error:", error);
    return {
      success: false,
      error: 'Failed to access camera/microphone. Please check permissions.'
    };
  }
};

// Timeout management utility
export const TimeoutManager = {
  createTimeout(callback, delay) {
    return setTimeout(callback, delay);
  },

  clearTimeout(timeoutRef) {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  },

  clearInterval(intervalRef) {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  },

  clearAllTimeouts(timeoutRefs) {
    timeoutRefs.forEach(ref => this.clearTimeout(ref));
  },

  clearAllIntervals(intervalRefs) {
    intervalRefs.forEach(ref => this.clearInterval(ref));
  }
};

// Media stream utility
export const MediaStreamUtils = {
  async getUserMedia(constraints = { video: true, audio: true }) {
    return navigator.mediaDevices.getUserMedia(constraints);
  },

  stopTracks(stream) {
    if (stream?.getTracks) {
      stream.getTracks().forEach(track => track.stop());
    }
  },

  setupVideoElement(videoRef, stream) {
    if (!videoRef.current) {
      DevHelpers.error('Video ref is null, cannot setup video element');
      return false;
    }

    if (!stream) {
      DevHelpers.error('Stream is null, cannot setup video element');
      return false;
    }

    try {
      DevHelpers.log('Setting up video element with stream');
      videoRef.current.srcObject = stream;
      videoRef.current.muted = true;
      
      // Add event listeners for debugging
      videoRef.current.onloadedmetadata = () => {
        DevHelpers.log('Video metadata loaded:', {
          videoWidth: videoRef.current.videoWidth,
          videoHeight: videoRef.current.videoHeight
        });
      };
      
      videoRef.current.oncanplay = () => {
        DevHelpers.log('Video can play');
      };
      
      videoRef.current.onerror = (error) => {
        DevHelpers.error('Video element error:', error);
      };
      
      // Play the video
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            DevHelpers.log('Video started playing successfully');
          })
          .catch(error => {
            DevHelpers.error('Error starting video playback:', error);
          });
      }
      
      return true;
    } catch (error) {
      DevHelpers.error('Error setting up video element:', error);
      return false;
    }
  }
};

// Speech recognition utility
export const SpeechRecognitionUtils = {
  createRecognition(config = {}) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      throw new Error("Speech Recognition API not supported in this browser.");
    }
    
    const recognition = new SpeechRecognition();
    const defaultConfig = {
      continuous: true,
      interimResults: true,
      language: 'en-US',
      maxAlternatives: 1
    };

    const finalConfig = { ...defaultConfig, ...config };
    Object.assign(recognition, finalConfig);
    
    return recognition;
  },

  processResults(event, finalBuffer, updateCallback) {
    let interimTranscript = '';
    let finalTranscript = finalBuffer;

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      
      if (event.results[i].isFinal) {
        finalTranscript += transcript + ' ';
      } else {
        interimTranscript += transcript;
      }
    }

    const fullTranscript = finalTranscript + interimTranscript;
    
    if (updateCallback) {
      updateCallback(fullTranscript);
    }

    return finalTranscript;
  }
}; 