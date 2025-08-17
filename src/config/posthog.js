import posthog from 'posthog-js';

// PostHog configuration for Mockly analytics
const POSTHOG_CONFIG = {
  // You'll need to get these from PostHog dashboard
  apiKey: process.env.REACT_APP_POSTHOG_KEY || 'phc_test_key_replace_me',
  apiHost: process.env.REACT_APP_POSTHOG_HOST || 'https://app.posthog.com',
  
  // Configuration options
  options: {
    // Capture pageviews automatically
    capture_pageview: true,
    
    // Capture performance metrics
    capture_performance: true,
    
    // Session recording (useful for UX analysis)
    session_recording: {
      maskAllInputs: true,
      maskInputOptions: {
        password: true,
        email: false,
        textarea: false,
      }
    },
    
    // Automatically capture clicks and form submissions
    autocapture: true,
    
    // enable posthog for all envs
    disabled: false,
    
    // Cross-domain tracking
    cross_subdomain_cookie: false,
    
    // Bootstrap feature flags
    bootstrap: {
      featureFlags: {},
    },
  }
};

// Initialize PostHog
export const initializePostHog = () => {
  if (typeof window !== 'undefined' && !POSTHOG_CONFIG.options.disabled) {
    posthog.init(POSTHOG_CONFIG.apiKey, {
      api_host: POSTHOG_CONFIG.apiHost,
      ...POSTHOG_CONFIG.options,
    });
    
    console.log('📊 PostHog initialized for analytics tracking');
  }
};

// Track custom events for Mockly
export const trackEvent = (eventName, properties = {}) => {
  if (typeof window !== 'undefined' && !POSTHOG_CONFIG.options.disabled) {
    posthog.capture(eventName, {
      ...properties,
      timestamp: new Date().toISOString(),
      app_version: process.env.REACT_APP_VERSION || '1.0.0',
    });
  }
};

// Identify users for better tracking
export const identifyUser = (userId, userProperties = {}) => {
  if (typeof window !== 'undefined' && !POSTHOG_CONFIG.options.disabled) {
    posthog.identify(userId, {
      ...userProperties,
      platform: 'web',
      app: 'mockly',
    });
  }
};

// Track user properties updates
export const setUserProperties = (properties) => {
  if (typeof window !== 'undefined' && !POSTHOG_CONFIG.options.disabled) {
    posthog.people.set(properties);
  }
};

// Group users (useful for cohort analysis)
export const setUserGroup = (groupType, groupKey, groupProperties = {}) => {
  if (typeof window !== 'undefined' && !POSTHOG_CONFIG.options.disabled) {
    posthog.group(groupType, groupKey, groupProperties);
  }
};

// Reset user (for logout)
export const resetUser = () => {
  if (typeof window !== 'undefined' && !POSTHOG_CONFIG.options.disabled) {
    posthog.reset();
  }
};

// Lean Startup Specific Events
export const trackLearnStartupEvents = {
  // User activation events
  userSignedUp: (method, userInfo) => trackEvent('user_signed_up', {
    signup_method: method,
    user_type: userInfo.userType || 'free',
    acquisition_source: userInfo.source || 'direct',
  }),

  // Interview engagement events  
  interviewStarted: (questionType, questionId) => trackEvent('interview_started', {
    question_type: questionType,
    question_id: questionId,
    session_id: Date.now().toString(),
  }),

  interviewCompleted: (metrics) => trackEvent('interview_completed', {
    content_score: metrics.contentScore,
    voice_score: metrics.voiceScore, 
    face_score: metrics.faceScore,
    overall_score: metrics.overallScore,
    session_duration: metrics.sessionDuration,
    question_type: metrics.questionType,
    session_id: metrics.sessionId,
  }),

  // Feature adoption events
  featureUsed: (featureName, context) => trackEvent('feature_used', {
    feature_name: featureName,
    context: context,
    user_session: Date.now().toString(),
  }),

  // Retention events
  userReturned: (daysSinceLastVisit) => trackEvent('user_returned', {
    days_since_last_visit: daysSinceLastVisit,
    return_type: daysSinceLastVisit <= 1 ? 'daily' : daysSinceLastVisit <= 7 ? 'weekly' : 'monthly',
  }),

  // Progress tracking
  progressMilestone: (milestone, metrics) => trackEvent('progress_milestone', {
    milestone_type: milestone,
    ...metrics,
  }),
};

export default posthog;
