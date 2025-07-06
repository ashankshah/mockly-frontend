/**
 * Interview Session Component
 * Handles initial question selection and interview start
 */

import React, { useState } from 'react';
import SelectedQuestionDisplay from './SelectedQuestionDisplay';
import { isApiDisabled } from '../config';
import { UI_TEXT, DEV_MESSAGES, INTERVIEW_QUESTIONS } from '../constants/interviewConstants';

function InterviewSession({ onStart }) {
  const [selectedQuestion, setSelectedQuestion] = useState('');

  const handleInterviewStart = () => {
    if (!selectedQuestion) {
      alert('Please select a question before starting the interview.');
      return;
    }
    if (onStart) onStart(selectedQuestion);
  };

  const handleQuestionChange = (event) => {
    setSelectedQuestion(event.target.value);
    // Remove focus from dropdown after selection
    event.target.blur();
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

  const renderSelectedQuestion = () => (
    <SelectedQuestionDisplay 
      questionId={selectedQuestion} 
      variant="preview" 
    />
  );

  return (
    <div className="interview-session">
      <p className="interview-session__message">{UI_TEXT.READY_MESSAGE}</p>
      <div className="interview-session__question-group">
        {renderQuestionSelector()}
        {renderSelectedQuestion()}
      </div>
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
}

export default InterviewSession;
