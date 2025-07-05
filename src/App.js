/**
 * Mockly AI Interview Application
 * Main application component that manages interview flow and state
 * 
 * @author: David Chung
 * @creation-date: 6/22/2025
 */

import React, { useState } from 'react';
import Header from './components/Header';
import InterviewSession from './components/InterviewSession';
import VideoAudioProcessor from './components/VideoAudioProcessor';
import FeedbackReport from './components/FeedbackReport';
import { APP_STATES, UI_TEXT } from './constants/interviewConstants';
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
    return isExpanded ? 'app app--expanded' : 'app';
  };

  const getCardClassName = () => {
    const baseClass = 'card';
    let variantClass = '';

    switch (currentState) {
      case APP_STATES.INITIAL:
        variantClass = 'card--dynamic';
        break;
      case APP_STATES.INTERVIEWING:
        variantClass = 'card--large card--fixed';
        break;
      case APP_STATES.FEEDBACK:
        variantClass = 'card--large card--fixed';
        break;
      default:
        variantClass = 'card--dynamic';
    }

    return `${baseClass} ${variantClass}`;
  };

  const renderInitialScreen = () => (
    <div className="card__content">
      <h1 className="app__title">{UI_TEXT.INITIAL_TITLE}</h1>
      <InterviewSession 
        onComplete={handleInterviewComplete} 
        onStart={handleInterviewStart} 
      />
    </div>
  );

  const renderFeedbackScreen = () => (
    <div className="card__content">
      <h1 className="app__title">{UI_TEXT.FEEDBACK_TITLE}</h1>
      <FeedbackReport report={interviewReport} />
      <div className="card__footer">
        <button 
          className="button button--centered" 
          onClick={handleStartNewInterview}
        >
          {UI_TEXT.START_NEW_INTERVIEW}
        </button>
      </div>
    </div>
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
    <div className="app">
      <Header />
      <main className="app__main">
        <div className="app__container">
          <div className={getContainerClassName()}>
            <div className={getCardClassName()}>
              {renderContent()}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
 