/**
 * Application Configuration
 * Centralized settings for development and production
 */

export const CONFIG = {
  // Development Mode Settings
  dev: {
    // Set to true to disable all backend API calls
    disableApiCalls: process.env.REACT_APP_DISABLE_API === 'true' || false,
    
    // Set to true to simulate transcript filling during interview
    simulateTranscript: process.env.REACT_APP_SIMULATE_TRANSCRIPT === 'true' || false,
    
    // Mock data for testing when API calls are disabled
    mockResponse: {
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
    
    // Simulated API delay (in milliseconds)
    mockApiDelay: 1000,
    
    // Transcript simulation settings
    transcriptSimulation: {
      // Sample transcript sentences to cycle through
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
      // Interval between sentences (in milliseconds)
      interval: 2000,
      // Whether to show interim results (like real speech recognition)
      showInterim: true,
      // Interim text to show before finalizing each sentence
      interimText: "I was working on...",
      // How long to show interim text before finalizing
      interimDelay: 800
    }
  },

  // API Configuration
  api: {
    baseUrl: process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000',
    endpoints: {
      comprehensiveAnalysis: '/comprehensive-analysis',
      scoreSession: '/score-session'
    },
    headers: {
      'Content-Type': 'application/json'
    }
  }
};

// Helper function to check if API calls are disabled
export const isApiDisabled = () => CONFIG.dev.disableApiCalls;

// Helper function to check if transcript simulation is enabled
export const isTranscriptSimulationEnabled = () => CONFIG.dev.simulateTranscript;

// Helper function to get mock response
export const getMockResponse = () => CONFIG.dev.mockResponse;

// Helper function to simulate API delay
export const simulateApiDelay = () => 
  new Promise(resolve => setTimeout(resolve, CONFIG.dev.mockApiDelay));

// Helper function to get transcript simulation config
export const getTranscriptSimulationConfig = () => CONFIG.dev.transcriptSimulation;
