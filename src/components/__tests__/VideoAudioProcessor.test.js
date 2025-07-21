/**
 * VideoAudioProcessor Component Tests
 * Tests for the video processor with question display integration
 * 
 * @author: David Chung
 * @creation-date: 6/22/2025
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import VideoAudioProcessor from '../analysis/VideoAudioProcessor';
import SelectedQuestionDisplay from '../interview/SelectedQuestionDisplay';

// Mock the SelectedQuestionDisplay component
jest.mock('../interview/SelectedQuestionDisplay', () => {
  return function MockSelectedQuestionDisplay({ questionId, variant }) {
    return (
      <div data-testid="selected-question-display" data-question-id={questionId} data-variant={variant}>
        Mock Question Display
      </div>
    );
  };
});

// Mock the config and utils
jest.mock('../../config', () => ({
  isTranscriptSimulationEnabled: () => false,
  getTranscriptSimulationConfig: () => ({})
}));

jest.mock('../../utils/interviewUtils', () => ({
  DEFAULT_METRICS: {},
  TranscriptValidator: {
    getFinalTranscript: jest.fn(),
    isValid: jest.fn(),
    formatContent: jest.fn()
  },
  MediaStreamUtils: {
    getUserMedia: jest.fn(),
    setupVideoElement: jest.fn(),
    stopTracks: jest.fn()
  },
  SpeechRecognitionUtils: {
    createRecognition: jest.fn(),
    processResults: jest.fn()
  },
  TimeoutManager: {
    createTimeout: jest.fn(),
    clearAllTimeouts: jest.fn(),
    clearAllIntervals: jest.fn()
  },
  ErrorHandler: {
    handleApiError: jest.fn(),
    handleMediaError: jest.fn()
  }
}));

jest.mock('../../constants/interviewConstants', () => ({
  INTERVIEW_CONFIG: {},
  AUDIO_CONSTRAINTS: {},
  UI_TEXT: {
    TRANSCRIPT_TITLE: 'Transcript',
    LISTENING: 'Listening',
    PROCESSING_TITLE: 'Processing',
    PROCESSING_MESSAGE: 'Processing message'
  },
  ERROR_MESSAGES: {},
  DEV_MESSAGES: {}
}));

describe('VideoAudioProcessor', () => {
  const mockOnFinish = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Question Display Integration', () => {
    test('renders question display when selectedQuestion is provided', () => {
      render(
        <VideoAudioProcessor 
          onFinish={mockOnFinish} 
          selectedQuestion="leadership" 
        />
      );
      
      const questionDisplay = screen.getByTestId('selected-question-display');
      expect(questionDisplay).toBeInTheDocument();
      expect(questionDisplay).toHaveAttribute('data-question-id', 'leadership');
      expect(questionDisplay).toHaveAttribute('data-variant', 'interview');
    });

    test('does not render question display when selectedQuestion is not provided', () => {
      render(<VideoAudioProcessor onFinish={mockOnFinish} />);
      
      const questionDisplay = screen.queryByTestId('selected-question-display');
      expect(questionDisplay).not.toBeInTheDocument();
    });

    test('renders question display with correct variant for interview', () => {
      render(
        <VideoAudioProcessor 
          onFinish={mockOnFinish} 
          selectedQuestion="conflict" 
        />
      );
      
      const questionDisplay = screen.getByTestId('selected-question-display');
      expect(questionDisplay).toHaveAttribute('data-variant', 'interview');
    });
  });

  describe('Layout Structure', () => {
    test('renders question section when question is provided', () => {
      render(
        <VideoAudioProcessor 
          onFinish={mockOnFinish} 
          selectedQuestion="leadership" 
        />
      );
      
      // Check that the question section exists
      const questionSection = screen.getByTestId('selected-question-display').closest('.video-processor__question-section');
      expect(questionSection).toBeInTheDocument();
    });

    test('renders content section with video and transcript', () => {
      render(
        <VideoAudioProcessor 
          onFinish={mockOnFinish} 
          selectedQuestion="leadership" 
        />
      );
      
      // Check that the content section exists
      const contentSection = screen.getByTestId('selected-question-display').parentElement?.nextElementSibling;
      expect(contentSection).toHaveClass('video-processor__content-section');
    });
  });
}); 