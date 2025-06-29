/**
 * Interview Constants
 * Centralized configuration values for the interview system
 */

// Interview session configuration
export const INTERVIEW_CONFIG = {
  sessionDuration: 10000, // 10 seconds
  processingDelay: 200,
  fallbackTimeout: 3000,
  dotAnimationInterval: 500,
  transcriptUpdateDelay: 100,
  maxDots: 3
};

// Audio constraints for better quality
export const AUDIO_CONSTRAINTS = {
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true
};

// Speech recognition configuration
export const SPEECH_CONFIG = {
  continuous: true,
  interimResults: true,
  language: 'en-US',
  maxAlternatives: 1
};

// STAR component configuration
export const STAR_COMPONENTS = [
  { key: 'situation', title: 'Situation', color: '#3BA676' },
  { key: 'task', title: 'Task', color: '#FACC15' },
  { key: 'action', title: 'Action', color: '#EF4444' },
  { key: 'result', title: 'Result', color: '#8B5CF6' }
];

// Application states
export const APP_STATES = {
  INITIAL: 'initial',
  INTERVIEWING: 'interviewing',
  FEEDBACK: 'feedback'
};

// CSS class names - Updated to match refactored CSS
export const CSS_CLASSES = {
  // Layout Components
  CONTAINER: 'mockly-container',
  CONTAINER_EXPANDED: 'mockly-container expanded',
  CARD: 'mockly-card',
  CARD_SMALL: 'mockly-card mockly-card--small',
  CARD_LARGE: 'mockly-card mockly-card--large',
  
  // Interactive Elements
  BUTTON: 'mockly-button',
  
  // Processing Screen
  PROCESSING_SCREEN: 'processing-screen',
  PROCESSING_CONTENT: 'processing-content',
  PROCESSING_SPINNER: 'processing-spinner',
  SPINNER: 'spinner',
  
  // Media Components
  VIDEO_CONTAINER: 'video-transcript-container',
  VIDEO_BOX: 'video-box',
  VIDEO_ELEMENT: 'video-element',
  TRANSCRIPT_CONTAINER: 'transcript-container',
  TRANSCRIPT_BOX: 'transcript-box',
  TRANSCRIPT_SCROLLABLE: 'transcript-scrollable',
  
  // Feedback Components
  SCORE_TAG: 'score-tag',
  SCORE_GREEN: 'score-tag score-green',
  SCORE_YELLOW: 'score-tag score-yellow',
  SCORE_RED: 'score-tag score-red',
  TIP_SECTION: 'tip-section',
  
  // STAR Analysis Components
  STAR_ANALYSIS_SECTION: 'star-analysis-section',
  STAR_GRID: 'star-grid',
  STAR_COMPONENT: 'star-component',
  STAR_CONTENT: 'star-content',
  NO_CONTENT: 'no-content',
  
  // Utility Classes
  VIDEO_SECTION: 'video-section',
  STAR_SECTION: 'star-section'
};

// Error messages
export const ERROR_MESSAGES = {
  NO_SPEECH_DETECTED: "No speech was detected during the interview. Please try again and speak clearly.",
  SPEECH_RECOGNITION_NOT_SUPPORTED: "Speech Recognition API not supported in this browser.",
  MEDIA_ACCESS_FAILED: "Failed to access camera/microphone. Please check permissions.",
  API_REQUEST_FAILED: "API request failed. Please try again.",
  UNKNOWN_ERROR: "Unknown error occurred"
};

// Success messages
export const SUCCESS_MESSAGES = {
  INTERVIEW_COMPLETED: "Interview completed successfully",
  ANALYSIS_COMPLETE: "Analysis completed successfully"
};

// Development mode messages
export const DEV_MESSAGES = {
  API_DISABLED: "🔧 DEV MODE: API calls disabled - using mock data",
  SIMULATION_ACTIVE: "🔧 DEV MODE: Transcript simulation active",
  SIMULATION_ENABLED: "Simulation enabled - waiting for transcript...",
  SKIPPING_SPEECH_RECOGNITION: "🔧 Skipping speech recognition in simulation mode",
  IGNORING_NO_SPEECH: "Ignoring no-speech error in simulation mode",
  NOT_AUTO_FINISHING: "In simulation mode, not auto-finishing on speech end"
};

// UI text constants
export const UI_TEXT = {
  APP_TITLE: "Mockly AI Interview",
  FEEDBACK_TITLE: "Your Interview Feedback",
  START_INTERVIEW: "Start Interview",
  START_NEW_INTERVIEW: "Start New Interview",
  READY_MESSAGE: "When you're ready, click below to start your interview.",
  PROCESSING_TITLE: "Processing Your Interview",
  PROCESSING_MESSAGE: "Analyzing your response with AI-powered STAR method evaluation...",
  TRANSCRIPT_TITLE: "Transcript (live)",
  STAR_ANALYSIS_TITLE: "STAR Method Analysis",
  TIPS_TITLE: "Tips",
  TRANSCRIPT_TITLE_FEEDBACK: "Transcript",
  LISTENING: "Listening",
  NO_SITUATION: "No situation identified",
  NO_TASK: "No task identified",
  NO_ACTION: "No action identified",
  NO_RESULT: "No result identified"
};

// Default response messages
export const DEFAULT_TIPS = {
  content: "Unable to analyze content at this time.",
  voice: "Reduce pauses and maintain consistent pace.",
  face: "Improve eye contact and maintain confident posture."
}; 