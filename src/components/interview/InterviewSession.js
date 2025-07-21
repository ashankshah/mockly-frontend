/**
 * Interview Session Component
 * Handles initial question selection and interview start
 */

import React, { useState } from 'react';
import SelectedQuestionDisplay from './SelectedQuestionDisplay';
import { DevHelpers } from '../../config/devConfig';
import { UI_TEXT, DEV_MESSAGES, INTERVIEW_QUESTIONS } from '../../constants/interviewConstants';

const InterviewSession = React.memo(({ onStart }) => {
  const [selectedQuestion, setSelectedQuestion] = useState('');
  const [validationError, setValidationError] = useState('');

  const handleInterviewStart = () => {
    if (!selectedQuestion) {
      setValidationError('Please select a question before starting the interview.');
      return;
    }
    setValidationError('');
    if (onStart) onStart(selectedQuestion);
  };

  const handleQuestionChange = (event) => {
    setSelectedQuestion(event.target.value);
    setValidationError(''); // Clear validation error when user selects a question
  };

  const renderDevModeWarning = () => (
    <div className="interview-session__dev-warning">
      {DEV_MESSAGES.API_DISABLED}
    </div>
  );

  const renderValidationError = () => (
    validationError && (
      <div className="interview-session__validation-error">
        <i className="fas fa-exclamation-triangle icon-sm icon-error"></i>
        {validationError}
      </div>
    )
  );

  const renderQuestionSelector = () => (
    <div className="question-selector">
      <label htmlFor="question-select" className="question-selector__label">
        <i className="fas fa-question-circle icon-sm icon-primary"></i>
        Choose your question:
      </label>
      <select
        id="question-select"
        className={`question-selector__dropdown ${validationError ? 'question-selector__dropdown--error' : ''}`}
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
      {renderValidationError()}
    </div>
  );

  const renderSelectedQuestion = () => (
    <div>
      <SelectedQuestionDisplay 
        questionId={selectedQuestion} 
        variant="preview" 
      />
    </div>
  );

  return (
    <div className="interview-session">
      <p className="interview-session__message">{UI_TEXT.READY_MESSAGE}</p>
      <div className="interview-session__question-group">
        {renderQuestionSelector()}
        {renderSelectedQuestion()}
      </div>
      {DevHelpers.isApiDisabled() && renderDevModeWarning()}
      <button 
        className={`button ${!selectedQuestion ? 'button--disabled' : ''}`}
        onClick={handleInterviewStart}
        disabled={!selectedQuestion}
      >
        <i className="fas fa-play icon-sm"></i>
        {UI_TEXT.START_INTERVIEW}
      </button>
    </div>
  );
});

InterviewSession.displayName = 'InterviewSession';

export default InterviewSession;
