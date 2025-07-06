/**
 * Development Configuration
 * Centralized dev-mode settings and mocks
 */

export const DEV_CONFIG = {
  // Environment flags
  DEBUG: process.env.NODE_ENV === 'development',
  DISABLE_API: process.env.REACT_APP_DISABLE_API === 'true' || false,
  SIMULATE_TRANSCRIPT: process.env.REACT_APP_SIMULATE_TRANSCRIPT === 'true' || false,
  
  // Mock API settings
  MOCK_API_DELAY: 1000,
  
  // Mock response for testing
  MOCK_RESPONSE: {
    content_score: 4.2,
    voice_score: 3.8,
    face_score: 4.0,
    tips: {
      content: "Excellent STAR method usage. Consider adding more specific metrics.",
      voice: "Good pace and clarity. Work on reducing filler words.",
      face: "Strong eye contact and confident posture. Great job!"
    },
    transcript_debug: "Mock transcript for testing purposes",
    star_analysis: {
      situation: ["I was working as a software engineer at a tech startup"],
      task: ["I needed to implement a new feature within a tight deadline"],
      action: ["I broke down the problem, created a detailed plan, and collaborated with the team"],
      result: ["We delivered the feature on time and received positive feedback from users"]
    }
  },
  
  // Transcript simulation settings
  TRANSCRIPT_SIMULATION: {
    sentences: [
      "I was working as a software engineer at a tech startup when we faced a critical challenge.",
      "Our team needed to implement a new feature within a very tight deadline of two weeks.",
      "The feature was essential for our user experience and had to be completed before our next release.",
      "I took the initiative to break down the problem into smaller, manageable components.",
      "First, I analyzed the requirements and created a detailed implementation plan.",
      "Then I collaborated with our product manager to ensure we were aligned on the scope.",
      "I also worked closely with our designer to make sure the UI was intuitive and user-friendly.",
      "During development, I encountered several technical challenges that required creative solutions.",
      "I implemented a caching mechanism to improve performance and reduce server load.",
      "I also added comprehensive error handling to ensure the feature was robust and reliable.",
      "Throughout the process, I maintained regular communication with stakeholders about our progress.",
      "We completed the feature on time and it was well-received by our users.",
      "The implementation resulted in a 30% improvement in user engagement metrics.",
      "Our customer satisfaction scores increased significantly after the release.",
      "The success of this project led to me being promoted to senior engineer."
    ],
    interval: 2000,
    showInterim: true,
    interimText: "I was working on...",
    interimDelay: 800
  }
};

// Helper functions
export const DevHelpers = {
  log: (message, ...args) => {
    if (DEV_CONFIG.DEBUG) {
      console.log(`[DEV] ${message}`, ...args);
    }
  },
  
  warn: (message, ...args) => {
    if (DEV_CONFIG.DEBUG) {
      console.warn(`[DEV] ${message}`, ...args);
    }
  },
  
  error: (message, ...args) => {
    if (DEV_CONFIG.DEBUG) {
      console.error(`[DEV] ${message}`, ...args);
    }
  },
  
  isApiDisabled: () => DEV_CONFIG.DISABLE_API,
  isTranscriptSimulationEnabled: () => DEV_CONFIG.SIMULATE_TRANSCRIPT,
  getMockResponse: () => DEV_CONFIG.MOCK_RESPONSE,
  getTranscriptSimulationConfig: () => DEV_CONFIG.TRANSCRIPT_SIMULATION,
  
  simulateApiDelay: () => 
    new Promise(resolve => setTimeout(resolve, DEV_CONFIG.MOCK_API_DELAY))
}; 