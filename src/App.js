/**
 * Mockly AI Interview Application
 * Main application component that manages interview flow and state
 * 
 * @author: David Chung
 * @creation-date: 6/22/2025
 */

import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import InterviewSession from './components/InterviewSession';
import VideoAudioProcessor from './components/VideoAudioProcessor';
import FeedbackReport from './components/FeedbackReport';
import { APP_STATES, UI_TEXT, DEFAULT_TIPS, DEV_MESSAGES } from './constants/interviewConstants';
import { CONFIG, isApiDisabled, getMockResponse, simulateApiDelay } from './config';
import { SCORE_THRESHOLDS, ErrorHandler } from './utils/interviewUtils';
import './theme.css';

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

function App() {
  const [interviewReport, setInterviewReport] = useState(null);
  const [currentState, setCurrentState] = useState(APP_STATES.INITIAL);
  const [selectedQuestion, setSelectedQuestion] = useState('');
  const apiService = new InterviewApiService(CONFIG);

  // Landing page scroll animations
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, observerOptions);

    // Small delay to ensure DOM is updated
    const timer = setTimeout(() => {
      document.querySelectorAll('.animate-on-scroll').forEach(el => {
        observer.observe(el);
        // If element is already in view, make it visible immediately
        const rect = el.getBoundingClientRect();
        if (rect.top >= 0 && rect.bottom <= window.innerHeight) {
          el.classList.add('visible');
        }
      });
    }, 100);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [currentState]); // Re-run when state changes to catch new elements

  const handleMockAnalysis = async (metrics, transcript) => {
    console.log(DEV_MESSAGES.API_DISABLED);
    console.log('📝 Mock transcript:', transcript);
    await simulateApiDelay();
    setInterviewReport(getMockResponse());
    setCurrentState(APP_STATES.FEEDBACK);
  };

  const handleComprehensiveAnalysis = async (metrics, transcript) => {
    if (isApiDisabled()) {
      return handleMockAnalysis(metrics, transcript);
    }

    try {
      const analysisData = await apiService.requestComprehensiveAnalysis(metrics, transcript);
      setInterviewReport(analysisData);
      setCurrentState(APP_STATES.FEEDBACK);
    } catch (error) {
      console.error('Error fetching comprehensive analysis:', error);
      await handleFallbackAnalysis(metrics, transcript);
    }
  };

  const handleFallbackAnalysis = async (metrics, transcript) => {
    if (isApiDisabled()) {
      console.log(DEV_MESSAGES.API_DISABLED);
      setInterviewReport(getMockResponse());
      setCurrentState(APP_STATES.FEEDBACK);
      return;
    }

    try {
      const analysisData = await apiService.requestScoreSession(metrics, transcript);
      setInterviewReport(analysisData);
      setCurrentState(APP_STATES.FEEDBACK);
    } catch (fallbackError) {
      console.error('Fallback analysis also failed:', fallbackError);
      const defaultResponse = createDefaultResponse(metrics, transcript);
      setInterviewReport(defaultResponse);
      setCurrentState(APP_STATES.FEEDBACK);
    }
  };

  const handleInterviewComplete = (metrics, transcript) => {
    setCurrentState(APP_STATES.PROCESSING);
    // Small delay to show processing screen before starting API call
    setTimeout(() => {
      handleComprehensiveAnalysis(metrics, transcript);
    }, 500);
  };

  const handleInterviewStart = (questionId) => {
    setSelectedQuestion(questionId);
    setCurrentState(APP_STATES.INTERVIEWING);
  };

  const handleInterviewProcessing = () => {
    setCurrentState(APP_STATES.PROCESSING);
  };

  const handleStartNewInterview = () => {
    setInterviewReport(null);
    setSelectedQuestion('');
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
        variantClass = 'card--interview card--fixed';
        break;
      case APP_STATES.PROCESSING:
        variantClass = 'card--processing card--dynamic';
        break;
      case APP_STATES.FEEDBACK:
        variantClass = 'card--feedback card--fixed';
        break;
      default:
        variantClass = 'card--dynamic';
    }

    return `${baseClass} ${variantClass} animate-on-scroll`;
  };

  const renderInitialScreen = () => (
    <div className="card__content">
      <h1 className="app__title">
        <i className="fas fa-brain" style={{ marginRight: '0.5rem', color: 'var(--color-primary)' }}></i>
        {UI_TEXT.INITIAL_TITLE}
      </h1>
      <InterviewSession onStart={handleInterviewStart} />
    </div>
  );

  const renderInterviewScreen = () => (
    <div className="card__content card__content--interview">
      <VideoAudioProcessor 
        onFinish={handleInterviewComplete} 
        onEnd={handleStartNewInterview}
        onProcessing={handleInterviewProcessing}
        selectedQuestion={selectedQuestion}
      />
    </div>
  );

  const renderProcessingScreen = () => (
    <div className="card__content">
      <div className="processing-screen">
        <div className="processing-screen__content">
          <h3 className="processing-screen__title">
            {UI_TEXT.PROCESSING_TITLE}
          </h3>
          <p className="processing-screen__message">{UI_TEXT.PROCESSING_MESSAGE}</p>
          <div className="processing-screen__spinner">
            <div className="processing-screen__spinner-element"></div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderFeedbackScreen = () => (
    <div className="card__content">
      <h1 className="app__title">
        <i className="fas fa-chart-line" style={{ marginRight: '0.5rem', color: 'var(--color-success)' }}></i>
        {UI_TEXT.FEEDBACK_TITLE}
      </h1>
      <FeedbackReport report={interviewReport} />
      <div className="card__footer">
        <button 
          className="button button--centered" 
          onClick={handleStartNewInterview}
        >
          <i className="fas fa-redo" style={{ marginRight: '0.5rem' }}></i>
          {UI_TEXT.START_NEW_INTERVIEW}
        </button>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (currentState) {
      case APP_STATES.INTERVIEWING:
        return renderInterviewScreen();
      case APP_STATES.PROCESSING:
        return renderProcessingScreen();
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
 