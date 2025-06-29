/**
 * Mockly AI Interview Application
 * Main application component that manages interview flow and state
 * 
 * @author: David Chung
 * @creation-date: 6/22/2025
 */

import React, { useState } from 'react';
import InterviewSession from './components/InterviewSession';
import FeedbackReport from './components/FeedbackReport';
import { APP_STATES, CSS_CLASSES, UI_TEXT } from './constants/interviewConstants';
import './theme.css';

function App() {
  const [interviewReport, setInterviewReport] = useState(null);
  const [currentState, setCurrentState] = useState(APP_STATES.INITIAL);

  const handleInterviewComplete = (report) => {
    setInterviewReport(report);
    setCurrentState(APP_STATES.FEEDBACK);
  };

  const handleInterviewStart = () => {
    setCurrentState(APP_STATES.INTERVIEWING);
  };

  const handleStartNewInterview = () => {
    setInterviewReport(null);
    setCurrentState(APP_STATES.INITIAL);
  };

  const getContainerClassName = () => {
    const isExpanded = currentState !== APP_STATES.INITIAL;
    return isExpanded ? CSS_CLASSES.CONTAINER_EXPANDED : CSS_CLASSES.CONTAINER;
  };

  const getCardClassName = () => {
    const isInitialState = currentState === APP_STATES.INITIAL;
    return isInitialState ? CSS_CLASSES.CARD_SMALL : CSS_CLASSES.CARD_LARGE;
  };

  const renderInitialScreen = () => (
    <>
      <h1 className="mockly-title">{UI_TEXT.APP_TITLE}</h1>
      <InterviewSession 
        onComplete={handleInterviewComplete} 
        onStart={handleInterviewStart} 
      />
    </>
  );

  const renderFeedbackScreen = () => (
    <>
      <h1 className="mockly-title">{UI_TEXT.FEEDBACK_TITLE}</h1>
      <FeedbackReport report={interviewReport} />
      <button 
        className={CSS_CLASSES.BUTTON} 
        style={{ marginTop: 'var(--spacing-lg)', display: 'block', margin: 'var(--spacing-lg) auto 0' }}
        onClick={handleStartNewInterview}
      >
        {UI_TEXT.START_NEW_INTERVIEW}
      </button>
    </>
  );

  const renderContent = () => {
    switch (currentState) {
      case APP_STATES.FEEDBACK:
        return renderFeedbackScreen();
      default:
        return renderInitialScreen();
    }
  };

  return (
    <div className={getContainerClassName()}>
      <div className={getCardClassName()}>
        {renderContent()}
      </div>
    </div>
  );
}

export default App;
 