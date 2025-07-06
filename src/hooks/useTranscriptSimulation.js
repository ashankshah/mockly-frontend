/**
 * Transcript Simulation Hook
 * Handles transcript simulation for development and testing
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { DevHelpers } from '../config/devConfig';

export const useTranscriptSimulation = () => {
  const [simulatedTranscript, setSimulatedTranscript] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);
  
  const simulationIntervalRef = useRef(null);
  const transcriptRef = useRef('');
  const currentIndexRef = useRef(0);

  const showInterimText = useCallback((config, currentIndex) => {
    const interimText = config.interimText;
    const newTranscript = transcriptRef.current + (transcriptRef.current ? ' ' : '') + interimText;
    setSimulatedTranscript(newTranscript);
    
    setTimeout(() => {
      if (!isSimulating) return;
      
      const finalSentence = config.sentences[currentIndex];
      transcriptRef.current += finalSentence + ' ';
      setSimulatedTranscript(transcriptRef.current);
    }, config.interimDelay);
  }, [isSimulating]);

  const showFinalSentence = useCallback((config, currentIndex) => {
    const finalSentence = config.sentences[currentIndex];
    transcriptRef.current += finalSentence + ' ';
    setSimulatedTranscript(transcriptRef.current);
  }, []);

  const startSimulation = useCallback(() => {
    if (!DevHelpers.isTranscriptSimulationEnabled()) {
      DevHelpers.log('Transcript simulation is disabled');
      return;
    }

    const config = DevHelpers.getTranscriptSimulationConfig();
    DevHelpers.log('Starting transcript simulation', config);
    
    setIsSimulating(true);
    currentIndexRef.current = 0;
    transcriptRef.current = '';
    setSimulatedTranscript('');
    
    simulationIntervalRef.current = setInterval(() => {
      if (currentIndexRef.current >= config.sentences.length) {
        stopSimulation();
        return;
      }
      
      if (config.showInterim) {
        showInterimText(config, currentIndexRef.current);
      } else {
        showFinalSentence(config, currentIndexRef.current);
      }
      
      currentIndexRef.current++;
    }, config.interval);
  }, [showInterimText, showFinalSentence]);

  const stopSimulation = useCallback(() => {
    if (simulationIntervalRef.current) {
      clearInterval(simulationIntervalRef.current);
      simulationIntervalRef.current = null;
    }
    setIsSimulating(false);
    DevHelpers.log('Transcript simulation stopped');
  }, []);

  const resetSimulation = useCallback(() => {
    stopSimulation();
    setSimulatedTranscript('');
    transcriptRef.current = '';
    currentIndexRef.current = 0;
  }, [stopSimulation]);

  const getFinalTranscript = useCallback(() => {
    return transcriptRef.current || simulatedTranscript || '';
  }, [simulatedTranscript]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopSimulation();
    };
  }, [stopSimulation]);

  return {
    // State
    simulatedTranscript,
    isSimulating,
    
    // Actions
    startSimulation,
    stopSimulation,
    resetSimulation,
    getFinalTranscript
  };
}; 