/**
 * Interview Session Component
 * Manages the interview flow and API communication
 */

import React, { useState } from 'react';
import VideoAudioProcessor from './VideoAudioProcessor';
import { CONFIG, isApiDisabled, getMockResponse, simulateApiDelay } from '../config';
import { SCORE_THRESHOLDS, ErrorHandler } from '../utils/interviewUtils';
import { UI_TEXT, DEFAULT_TIPS, DEV_MESSAGES, INTERVIEW_QUESTIONS } from '../constants/interviewConstants';

// Default response for fallback scenarios
const createDefaultResponse = (metrics, transcript) => ({
  content_score: SCORE_THRESHOLDS.GOOD,
  voice_score: metrics.voice?.score || 3.5,
  face_score: metrics.face?.score || 4.2,
  tips: DEFAULT_TIPS,
  transcript_debug: transcript
});

// API service class for better separation of concerns
class InterviewApiService {
  constructor(config) {
    this.config = config;
  }

  async makeRequest(endpoint, requestBody) {
    try {
      const response = await fetch(`${this.config.api.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: this.config.api.headers,
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      throw ErrorHandler.handleApiError(error, `API request to ${endpoint}`);
    }
  }

  async requestComprehensiveAnalysis(metrics, transcript) {
    return this.makeRequest(
      this.config.api.endpoints.comprehensiveAnalysis, 
      { metrics, transcript }
    );
  }

  async requestScoreSession(metrics, transcript) {
    return this.makeRequest(
      this.config.api.endpoints.scoreSession, 
      { metrics, transcript }
    );
  }
}

function InterviewSession({ onComplete, onStart }) {
  const [isInterviewRunning, setIsInterviewRunning] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState('');
  const apiService = new InterviewApiService(CONFIG);

  const handleInterviewStart = () => {
    if (!selectedQuestion) {
      alert('Please select a question before starting the interview.');
      return;
    }
    setIsInterviewRunning(true);
    if (onStart) onStart();
  };

  const handleQuestionChange = (event) => {
    setSelectedQuestion(event.target.value);
    // Remove focus from dropdown after selection
    event.target.blur();
  };

  const handleMockAnalysis = async (metrics, transcript) => {
    console.log(DEV_MESSAGES.API_DISABLED);
    console.log('📝 Mock transcript:', transcript);
    await simulateApiDelay();
    onComplete(getMockResponse());
  };

  const handleComprehensiveAnalysis = async (metrics, transcript) => {
    if (isApiDisabled()) {
      return handleMockAnalysis(metrics, transcript);
    }

    try {
      const analysisData = await apiService.requestComprehensiveAnalysis(metrics, transcript);
      onComplete(analysisData);
    } catch (error) {
      console.error('Error fetching comprehensive analysis:', error);
      await handleFallbackAnalysis(metrics, transcript);
    }
  };

  const handleFallbackAnalysis = async (metrics, transcript) => {
    if (isApiDisabled()) {
      console.log(DEV_MESSAGES.API_DISABLED);
      onComplete(getMockResponse());
      return;
    }

    try {
      const analysisData = await apiService.requestScoreSession(metrics, transcript);
      onComplete(analysisData);
    } catch (fallbackError) {
      console.error('Fallback analysis also failed:', fallbackError);
      const defaultResponse = createDefaultResponse(metrics, transcript);
      onComplete(defaultResponse);
    }
  };

  const handleInterviewFinish = (metrics, transcript) => {
    handleComprehensiveAnalysis(metrics, transcript);
  };

  const renderDevModeWarning = () => (
    <div className="interview-session__dev-warning">
      {DEV_MESSAGES.API_DISABLED}
    </div>
  );

  const renderQuestionSelector = () => (
    <div className="question-selector">
      <label htmlFor="question-select" className="question-selector__label">
        Choose your question:
      </label>
      <select
        id="question-select"
        className="question-selector__dropdown"
        value={selectedQuestion}
        onChange={handleQuestionChange}
        required
      >
        <option value="">Select a behavioral question...</option>
        {INTERVIEW_QUESTIONS.map((question) => (
          <option key={question.id} value={question.id}>
            {question.text}
          </option>
        ))}
      </select>
    </div>
  );

  const renderSelectedQuestion = () => {
    if (!selectedQuestion) return null;
    
    const question = INTERVIEW_QUESTIONS.find(q => q.id === selectedQuestion);
    if (!question) return null;

    return (
      <div className="selected-question">
        <h4 className="selected-question__title">Your Question:</h4>
        <p className="selected-question__text">{question.text}</p>
      </div>
    );
  };

  const renderStartButton = () => (
    <div className="interview-session">
      <p className="interview-session__message">{UI_TEXT.READY_MESSAGE}</p>
      {renderQuestionSelector()}
      {renderSelectedQuestion()}
      {isApiDisabled() && renderDevModeWarning()}
      <button 
        className={`button ${!selectedQuestion ? 'button--disabled' : ''}`}
        onClick={handleInterviewStart}
        disabled={!selectedQuestion}
      >
        {UI_TEXT.START_INTERVIEW}
      </button>
    </div>
  );

  const renderVideoProcessor = () => (
    <VideoAudioProcessor onFinish={handleInterviewFinish} />
  );

  return (
    <div>
      {!isInterviewRunning ? renderStartButton() : renderVideoProcessor()}
    </div>
  );
}

export default InterviewSession;
