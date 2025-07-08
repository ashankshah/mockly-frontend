/**
 * Mockly AI Interview Application
 * Main application component that manages interview flow and state
 * 
 * @author: David Chung
 * @creation-date: 6/22/2025
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Header from './components/Header';
import InterviewSession from './components/InterviewSession';
import VideoAudioProcessor from './components/VideoAudioProcessor';
import FeedbackReport from './components/FeedbackReport';
import UserProfile from './components/UserProfile';
import AuthModal from './components/AuthModal';
import { AuthProvider } from './contexts/AuthContext';
import { APP_STATES, UI_TEXT, DEFAULT_TIPS, DEV_MESSAGES } from './constants/interviewConstants';
import { CONFIG } from './config';
import { DevHelpers } from './config/devConfig';
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

const AppContent = React.memo(() => {
  const [interviewReport, setInterviewReport] = useState(null);
  const [currentState, setCurrentState] = useState(APP_STATES.INITIAL);
  const [selectedQuestion, setSelectedQuestion] = useState('');
  const [currentView, setCurrentView] = useState('interview'); // 'interview' | 'profile'
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true); // Track if this is the first load
  
  // Memoize apiService to prevent re-instantiation on every render
  const apiService = useMemo(() => new InterviewApiService(CONFIG), []);

  // Memoize class name calculations
  const containerClassName = useMemo(() => {
    const isExpanded = currentState !== APP_STATES.INITIAL;
    return isExpanded ? 'app app--expanded' : 'app';
  }, [currentState]);

  const cardClassName = useMemo(() => {
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

    // Only add animation class on initial load, not during navigation
    const shouldAnimate = isInitialLoad && (currentState === APP_STATES.INITIAL || currentState === APP_STATES.FEEDBACK);
    const animationClass = shouldAnimate ? 'animate-on-scroll' : '';

    return `${baseClass} ${variantClass} ${animationClass}`.trim();
  }, [currentState, isInitialLoad]);

  // Shared analysis logic to avoid duplication
  const processAnalysisResult = useCallback((analysisData) => {
    setInterviewReport(analysisData);
    setCurrentState(APP_STATES.FEEDBACK);
  }, []);

  const handleAnalysisError = useCallback((error, metrics, transcript) => {
    DevHelpers.error('Analysis error:', error);
    const defaultResponse = createDefaultResponse(metrics, transcript);
    setInterviewReport(defaultResponse);
    setCurrentState(APP_STATES.FEEDBACK);
  }, []);

  // Consolidated analysis handler
  const handleAnalysisRequest = useCallback(async (
    primaryEndpoint, 
    fallbackEndpoint, 
    metrics, 
    transcript
  ) => {
    if (DevHelpers.isApiDisabled()) {
      DevHelpers.log(DEV_MESSAGES.API_DISABLED);
      await DevHelpers.simulateApiDelay();
      processAnalysisResult(DevHelpers.getMockResponse());
      return;
    }

    try {
      const analysisData = await apiService[primaryEndpoint](metrics, transcript);
      processAnalysisResult(analysisData);
    } catch (error) {
      if (fallbackEndpoint) {
        try {
          const fallbackData = await apiService[fallbackEndpoint](metrics, transcript);
          processAnalysisResult(fallbackData);
        } catch (fallbackError) {
          handleAnalysisError(fallbackError, metrics, transcript);
        }
      } else {
        handleAnalysisError(error, metrics, transcript);
      }
    }
  }, [apiService, processAnalysisResult, handleAnalysisError]);

  // Event handlers
  const handleInterviewComplete = useCallback((metrics, transcript) => {
    setCurrentState(APP_STATES.PROCESSING);
    // Small delay to show processing screen before starting API call
    setTimeout(() => {
      handleAnalysisRequest(
        'requestComprehensiveAnalysis',
        'requestScoreSession',
        metrics,
        transcript
      );
    }, 500);
  }, [handleAnalysisRequest]);

  const handleInterviewStart = useCallback((questionId) => {
    setSelectedQuestion(questionId);
    setCurrentState(APP_STATES.INTERVIEWING);
    setIsInitialLoad(false); // Mark as no longer initial load
  }, []);

  const handleStartNewInterview = useCallback(() => {
    setInterviewReport(null);
    setSelectedQuestion('');
    setCurrentState(APP_STATES.INITIAL);
    setCurrentView('interview');
  }, []);

  const handleInterviewCleanup = useCallback(() => {
    setInterviewReport(null);
    setSelectedQuestion('');
    setCurrentState(APP_STATES.INITIAL);
    setIsInitialLoad(false);
  }, []);

  const handleNavigateToProfile = useCallback(() => {
    // Check if user is in an active interview session
    if (currentState === APP_STATES.INTERVIEWING) {
      const confirmEndInterview = window.confirm(UI_TEXT.NAVIGATION_CONFIRMATION);
      if (!confirmEndInterview) {
        return; // Cancel navigation
      }
      
      // Clean up interview state before navigating
      handleInterviewCleanup();
    } else {
      // If not in interview, just reset state normally
      setCurrentState(APP_STATES.INITIAL);
      setIsInitialLoad(false);
    }
    
    setCurrentView('profile');
  }, [currentState, handleInterviewCleanup]);

  const handleNavigateToInterview = useCallback(() => {
    // Check if user is in an active interview session
    if (currentState === APP_STATES.INTERVIEWING) {
      const confirmEndInterview = window.confirm(UI_TEXT.NAVIGATION_CONFIRMATION);
      if (!confirmEndInterview) {
        return; // Cancel navigation
      }
      
      // Clean up interview state before navigating
      handleInterviewCleanup();
    } else {
      // If not in interview, just reset state normally
      setCurrentState(APP_STATES.INITIAL);
      setIsInitialLoad(false);
    }
    
    setCurrentView('interview');
    setInterviewReport(null); // Clear any previous report
    setSelectedQuestion(''); // Clear selected question
  }, [currentState, handleInterviewCleanup]);

  const handleShowAuthModal = useCallback(() => {
    setShowAuthModal(true);
  }, []);

  const handleCloseAuthModal = useCallback(() => {
    setShowAuthModal(false);
  }, []);

  // Memoized render functions
  const renderInitialScreen = useCallback(() => (
    <div className="card__content">
      <h1 className="app__title">
        <i className="fas fa-brain icon-sm icon-primary"></i>
        {UI_TEXT.INITIAL_TITLE}
      </h1>
      <InterviewSession onStart={handleInterviewStart} />
    </div>
  ), [handleInterviewStart]);

  const renderInterviewScreen = useCallback(() => (
    <div className="card__content card__content--interview">
      <VideoAudioProcessor 
        onFinish={handleInterviewComplete} 
        onEnd={handleStartNewInterview}
        selectedQuestion={selectedQuestion}
      />
    </div>
  ), [handleInterviewComplete, handleStartNewInterview, selectedQuestion]);

  const renderProcessingScreen = useCallback(() => (
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
  ), []);

  const renderFeedbackScreen = useCallback(() => (
    <div className="card__content">
      <h1 className="app__title">
        <i className="fas fa-chart-line icon-sm icon-success"></i>
        {UI_TEXT.FEEDBACK_TITLE}
      </h1>
      <FeedbackReport report={interviewReport} />
      <div className="card__footer">
        <button 
          className="button button--centered" 
          onClick={handleStartNewInterview}
        >
          <i className="fas fa-redo icon-sm"></i>
          {UI_TEXT.START_NEW_INTERVIEW}
        </button>
      </div>
    </div>
  ), [interviewReport, handleStartNewInterview]);

  // Memoized content renderer
  const renderContent = useCallback(() => {
    switch (currentState) {
      case APP_STATES.INITIAL:
        return renderInitialScreen();
      case APP_STATES.INTERVIEWING:
        return renderInterviewScreen();
      case APP_STATES.PROCESSING:
        return renderProcessingScreen();
      case APP_STATES.FEEDBACK:
        return renderFeedbackScreen();
      default:
        return renderInitialScreen();
    }
  }, [currentState, renderInitialScreen, renderInterviewScreen, renderProcessingScreen, renderFeedbackScreen]);

  // Optimized scroll animation effect - only run when new content is added
  useEffect(() => {
    // Only run for states that have new animatable content
    if (currentState === APP_STATES.INITIAL || currentState === APP_STATES.FEEDBACK) {
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
    }
  }, [currentState]);

  // Render different views based on current navigation
  const renderMainContent = () => {
    if (currentView === 'profile') {
      return <UserProfile onNavigateToInterview={handleNavigateToInterview} />;
    }

    // Interview application views
    return (
      <div className={cardClassName}>
        {renderContent()}
      </div>
    );
  };

  return (
    <div className={containerClassName}>
      <Header 
        currentView={currentView}
        onNavigateToProfile={handleNavigateToProfile}
        onNavigateToInterview={handleNavigateToInterview}
        onShowAuthModal={handleShowAuthModal}
      />
      <main className="app__main">
        <div className="app__container">
          {renderMainContent()}
        </div>
      </main>
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={handleCloseAuthModal}
      />
    </div>
  );
});

// Main App component with AuthProvider
const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

App.displayName = 'App';

export default App;
 