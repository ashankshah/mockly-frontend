/**
 * Speech Recognition Hook
 * Handles speech recognition and transcript processing
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { DevHelpers } from '../config/devConfig';
import { SpeechRecognitionUtils, TranscriptValidator } from '../utils/interviewUtils';
import { SPEECH_CONFIG, ERROR_MESSAGES } from '../constants/interviewConstants';

export const useSpeechRecognition = () => {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const recognitionRef = useRef(null);
  const finalTranscriptRef = useRef('');

  const handleResult = useCallback((event) => {
    if (!recognitionRef.current) return;
    
    let interimTranscript = '';
    let finalTranscript = finalTranscriptRef.current;

    // Process all results
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      
      if (event.results[i].isFinal) {
        finalTranscript += transcript + ' ';
      } else {
        interimTranscript += transcript;
      }
    }

    // Update refs and state
    finalTranscriptRef.current = finalTranscript;
    const completeTranscript = finalTranscript + interimTranscript;
    setTranscript(completeTranscript);
    
    DevHelpers.log('Speech result:', {
      final: finalTranscript,
      interim: interimTranscript,
      complete: completeTranscript
    });
  }, []);

  const handleError = useCallback((error) => {
    DevHelpers.error('Speech recognition error:', error);
    
    // Don't treat 'no-speech' as a real error in dev mode
    if (error.error === 'no-speech' && DevHelpers.isTranscriptSimulationEnabled()) {
      DevHelpers.log('Ignoring no-speech error in simulation mode');
      return;
    }
    
    setHasError(true);
    setErrorMessage(error.error || ERROR_MESSAGES.UNKNOWN_ERROR);
  }, []);

  const handleEnd = useCallback(() => {
    DevHelpers.log('Speech recognition ended');
    setIsListening(false);
    
    // Don't auto-restart in simulation mode
    if (DevHelpers.isTranscriptSimulationEnabled()) {
      DevHelpers.log('Not auto-restarting in simulation mode');
      return;
    }
    
    // Don't auto-restart if there's an error
    if (hasError || !recognitionRef.current) {
      DevHelpers.log('Not auto-restarting - error state or no recognition');
      return;
    }
    
    // Auto-restart if no error and we should be listening
    try {
      // Small delay to prevent rapid restart cycles
      setTimeout(() => {
        if (recognitionRef.current && !hasError) {
          recognitionRef.current.start();
          setIsListening(true);
          DevHelpers.log('Speech recognition restarted');
        }
      }, 100);
    } catch (error) {
      DevHelpers.error('Failed to restart speech recognition:', error);
      setHasError(true);
      setErrorMessage(error.message);
    }
  }, [hasError]);

  const startListening = useCallback(() => {
    try {
      if (DevHelpers.isTranscriptSimulationEnabled()) {
        DevHelpers.log('Skipping speech recognition in simulation mode');
        return;
      }

      if (!recognitionRef.current) {
        DevHelpers.error('Speech recognition not initialized');
        return;
      }

      // Check if already listening to prevent the error
      if (isListening) {
        DevHelpers.log('Speech recognition already listening, skipping start');
        return;
      }

      recognitionRef.current.start();
      setIsListening(true);
      setHasError(false);
      setErrorMessage('');
      DevHelpers.log('Speech recognition started');
    } catch (error) {
      DevHelpers.error('Failed to start speech recognition:', error);
      setHasError(true);
      setErrorMessage(error.message);
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      DevHelpers.log('Speech recognition stopped');
    }
  }, [isListening]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    finalTranscriptRef.current = '';
    setHasError(false);
    setErrorMessage('');
  }, []);

  const getFinalTranscript = useCallback(() => {
    return finalTranscriptRef.current || transcript || '';
  }, [transcript]);

  // Initialize speech recognition
  useEffect(() => {
    try {
      const recognition = SpeechRecognitionUtils.createRecognition(SPEECH_CONFIG);
      
      recognition.onresult = handleResult;
      recognition.onerror = handleError;
      recognition.onend = handleEnd;
      recognition.onstart = () => {
        DevHelpers.log('Speech recognition started');
        setIsListening(true);
      };
      
      recognitionRef.current = recognition;
      DevHelpers.log('Speech recognition initialized');
    } catch (error) {
      DevHelpers.error('Failed to initialize speech recognition:', error);
      setHasError(true);
      setErrorMessage(ERROR_MESSAGES.SPEECH_RECOGNITION_NOT_SUPPORTED);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
    };
  }, [handleResult, handleError, handleEnd]);

  return {
    // State
    transcript,
    isListening,
    hasError,
    errorMessage,
    
    // Actions
    startListening,
    stopListening,
    resetTranscript,
    getFinalTranscript
  };
}; 