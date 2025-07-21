/**
 * Main App Component
 * Handles interview flow and state management
 * WITH DEBUGGING FOR EYE TRACKING DATA FLOW
 */

import React, { useState, useCallback, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import Header from '../components/layout/Header';
import AuthModal from '../components/auth/AuthModal';
import UserProfile from '../components/profile/UserProfile';
import InterviewSession from '../components/interview/InterviewSession';
import VideoAudioProcessor from '../components/analysis/VideoAudioProcessor';
import FeedbackReport from '../components/feedback/FeedbackReport';
import ProcessingScreen from '../components/feedback/ProcessingScreen';
import OAuthCallback from '../components/auth/OAuthCallback';
import { DevHelpers } from '../config/devConfig';
import '../styles/theme.css';

const App = () => {
  // App state
  const [currentView, setCurrentView] = useState('interview'); // 'interview', 'processing', 'feedback', 'profile'
  const [selectedQuestion, setSelectedQuestion] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedbackReport, setFeedbackReport] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Get authentication state
  const { isAuthenticated, loading } = useAuth();

  // Monitor authentication state and redirect if needed
  useEffect(() => {
    if (!loading && !isAuthenticated && currentView === 'profile') {
      // Redirect to home page if user is not authenticated and on profile page
      setCurrentView('interview');
    }
  }, [isAuthenticated, loading, currentView]);

  // Enhanced interview finish handler with debugging
  const handleInterviewFinish = useCallback((metrics, transcript) => {
    console.log('🎯 STEP 4 - Parent component (App) received onFinish callback');
    console.log('📊 Received metrics:', metrics);
    console.log('📝 Received transcript:', transcript);
    console.log('🔍 Metrics JSON:', JSON.stringify(metrics, null, 2));
    console.log('🔍 Metrics keys:', Object.keys(metrics || {}));
    
    // Check if eye tracking data is still present
    if (metrics.eyeTracking || metrics.eye_tracking) {
      console.log('✅ Eye tracking data is present in parent component');
      console.log('👁️ Eye tracking data:', metrics.eyeTracking || metrics.eye_tracking);
    } else {
      console.log('❌ Eye tracking data is MISSING in parent component');
    }

    // Check individual fields
    console.log('👁️ Individual eye tracking fields:', {
      eyeContactPercentage: metrics.eyeContactPercentage,
      smilePercentage: metrics.smilePercentage,
      sessionDuration: metrics.sessionDuration
    });
    
    setIsProcessing(true);
    setCurrentView('processing');

    // Simulate processing or make API call
    if (DevHelpers.isApiDisabled()) {
      // Mock processing for development
      console.log('🔧 STEP 5 - Mock processing (Dev mode)');
      handleMockProcessing(metrics, transcript);
    } else {
      // Real API call
      console.log('🌐 STEP 5 - Real API processing');
      handleRealProcessing(metrics, transcript);
    }
  }, []);

  // Mock processing function with debugging
  const handleMockProcessing = useCallback((metrics, transcript) => {
    console.log('🔧 STEP 5A - Mock processing started');
    console.log('📤 Input metrics to mock processing:', metrics);
    console.log('📝 Input transcript to mock processing:', transcript);
    
    // Simulate processing delay
    setTimeout(() => {
      const mockResponse = {
        content_score: 4.2,
        voice_score: 3.8,
        face_score: 4,
        star_analysis: {
          situation: ['I was working as a software engineer at a tech startup'],
          task: ['I needed to implement a new feature within a tight deadline'],
          action: ['I broke down the problem, created a detailed plan, and collaborated with the team'],
          result: ['We delivered the feature on time and received positive feedback from users']
        },
        tips: {
          content: 'Excellent STAR method usage. Consider adding more specific metrics.',
          voice: 'Good pace and clarity. Work on reducing filler words.',
          face: 'Strong eye contact and confident posture. Great job!'
        },
        transcript_debug: transcript,
        // IMPORTANT: Include the eye tracking data in the mock response
        eyeTracking: metrics.eyeTracking,
        eye_tracking: metrics.eye_tracking,
        eyeContactPercentage: metrics.eyeContactPercentage,
        smilePercentage: metrics.smilePercentage,
        sessionDuration: metrics.sessionDuration,
        // Also add to metrics object for compatibility
        metrics: {
          eyeTracking: metrics.eyeTracking,
          eye_tracking: metrics.eye_tracking
        }
      };
      
      console.log('📥 STEP 5B - Mock response created:', mockResponse);
      console.log('🔍 Mock response JSON:', JSON.stringify(mockResponse, null, 2));
      
      // Check if eye tracking data is preserved
      if (mockResponse.eyeTracking || mockResponse.eye_tracking) {
        console.log('✅ Eye tracking data preserved in mock response');
        console.log('👁️ Eye tracking in mock response:', mockResponse.eyeTracking || mockResponse.eye_tracking);
      } else {
        console.log('❌ Eye tracking data LOST in mock response');
      }
      
      setFeedbackReport(mockResponse);
      setIsProcessing(false);
      setCurrentView('feedback');
    }, 2000); // 2 second delay
  }, []);

  // Real API processing function with debugging
  const handleRealProcessing = useCallback(async (metrics, transcript) => {
    console.log('🌐 STEP 5A - Real API processing started');
    console.log('📤 Input metrics to API:', metrics);
    console.log('📝 Input transcript to API:', transcript);
    
    const requestPayload = {
      transcript,
      metrics,
      // Include eye tracking data explicitly in the payload
      eyeContactPercentage: metrics.eyeContactPercentage,
      smilePercentage: metrics.smilePercentage,
      sessionDuration: metrics.sessionDuration,
      eyeTracking: metrics.eyeTracking,
      eye_tracking: metrics.eye_tracking,
      selectedQuestion: selectedQuestion
    };
    
    console.log('📤 STEP 5B - Final API request payload:', requestPayload);
    console.log('🔍 Payload JSON:', JSON.stringify(requestPayload, null, 2));
    
    try {
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
      
      const response = await fetch(`${API_BASE_URL}/api/analyze-interview`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add any auth headers you need
        },
        body: JSON.stringify(requestPayload)
      });
      
      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }
      
      const responseData = await response.json();
      
      console.log('📥 STEP 5C - API response received:', responseData);
      console.log('🔍 Response JSON:', JSON.stringify(responseData, null, 2));
      console.log('📊 Response keys:', Object.keys(responseData || {}));
      
      // Check if eye tracking data is in the response
      if (responseData.eyeTracking || responseData.eye_tracking) {
        console.log('✅ Eye tracking data preserved in API response');
        console.log('👁️ Eye tracking in response:', responseData.eyeTracking || responseData.eye_tracking);
      } else {
        console.log('❌ Eye tracking data LOST in API response');
        console.log('🔍 Available fields in response:', Object.keys(responseData));
        
        // Try to restore eye tracking data if it's missing
        responseData.eyeTracking = metrics.eyeTracking;
        responseData.eye_tracking = metrics.eye_tracking;
        responseData.eyeContactPercentage = metrics.eyeContactPercentage;
        responseData.smilePercentage = metrics.smilePercentage;
        responseData.sessionDuration = metrics.sessionDuration;
        
        console.log('🔧 Restored eye tracking data to response:', responseData);
      }
      
      setFeedbackReport(responseData);
      setIsProcessing(false);
      setCurrentView('feedback');
      
    } catch (error) {
      console.error('❌ API error:', error);
      
      // Fallback to mock data if API fails
      console.log('🔧 API failed, falling back to mock processing');
      handleMockProcessing(metrics, transcript);
    }
  }, [selectedQuestion, handleMockProcessing]);

  // Handle interview start
  const handleInterviewStart = useCallback((questionId) => {
    console.log('🎬 Starting interview with question:', questionId);
    setSelectedQuestion(questionId);
    setCurrentView('interview');
    setFeedbackReport(null);
  }, []);

  // Handle interview end (back to question selection)
  const handleInterviewEnd = useCallback(() => {
    console.log('🛑 Interview ended, returning to question selection');
    setCurrentView('interview');
    setSelectedQuestion('');
    setFeedbackReport(null);
    setIsProcessing(false);
  }, []);

  // Handle start new interview from feedback
  const handleStartNewInterview = useCallback(() => {
    console.log('🔄 Starting new interview from feedback');
    setCurrentView('interview');
    setSelectedQuestion('');
    setFeedbackReport(null);
    setIsProcessing(false);
  }, []);

  // Navigation handlers
  const handleNavigateToProfile = useCallback(() => {
    setCurrentView('profile');
  }, []);

  const handleNavigateToInterview = useCallback(() => {
    setCurrentView('interview');
    setSelectedQuestion('');
    setFeedbackReport(null);
  }, []);

  const handleShowAuthModal = useCallback(() => {
    setShowAuthModal(true);
  }, []);

  const handleCloseAuthModal = useCallback(() => {
    setShowAuthModal(false);
  }, []);

  // Render current view
  const renderCurrentView = () => {
    switch (currentView) {
      case 'profile':
        return (
          <UserProfile onNavigateToInterview={handleNavigateToInterview} />
        );
        
      case 'processing':
        return (
          <div className="app__main">
            <div className="app__container">
              <ProcessingScreen />
            </div>
          </div>
        );
        
      case 'feedback':
        return (
          <div className="app__main">
            <div className="app__container">
              <div className="card card--feedback">
                <div className="card__content">
                  <FeedbackReport report={feedbackReport} />
                  <div className="card__footer">
                    <button 
                      className="button button--full-width"
                      onClick={handleStartNewInterview}
                    >
                      <i className="fas fa-plus icon-sm"></i>
                      Start New Interview
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'interview':
      default:
        if (selectedQuestion) {
          return (
            <div className="app__main">
              <div className="app__container">
                <div className="card card--interview">
                  <div className="card__content card__content--interview">
                    <VideoAudioProcessor
                      onFinish={handleInterviewFinish}
                      onEnd={handleInterviewEnd}
                      selectedQuestion={selectedQuestion}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        } else {
          return (
            <div className="app__main">
              <div className="app__container">
                <div className="card card--dynamic">
                  <div className="card__content">
                    <h1 className="app__title">Practice Interview</h1>
                    <InterviewSession onStart={handleInterviewStart} />
                  </div>
                </div>
              </div>
            </div>
          );
        }
    }
  };

  return (
    <div className="app">
      <Header
        currentView={currentView}
        onNavigateToProfile={handleNavigateToProfile}
        onNavigateToInterview={handleNavigateToInterview}
        onShowAuthModal={handleShowAuthModal}
      />
      
      {renderCurrentView()}
      
      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={handleCloseAuthModal}
        />
      )}
    </div>
  );
};

// Main App component with AuthProvider and Router
const AppWithProviders = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/auth/google/callback" element={<OAuthCallback />} />
          <Route path="/auth/linkedin/callback" element={<OAuthCallback />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default AppWithProviders;