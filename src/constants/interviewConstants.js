/**
 * Interview Constants
 * Centralized configuration values for the interview system
 */

// Interview session configuration
export const INTERVIEW_CONFIG = {
  sessionDuration: 60000, // 60 seconds
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
  PROCESSING: 'processing',
  FEEDBACK: 'feedback'
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
  API_DISABLED: "DEV MODE: API calls disabled - using mock data",
  SIMULATION_ACTIVE: "DEV MODE: Transcript simulation active",
  SIMULATION_ENABLED: "Simulation enabled - waiting for transcript...",
  SKIPPING_SPEECH_RECOGNITION: "Skipping speech recognition in simulation mode",
  IGNORING_NO_SPEECH: "Ignoring no-speech error in simulation mode",
  NOT_AUTO_FINISHING: "In simulation mode, not auto-finishing on speech end"
};

// UI text constants
export const UI_TEXT = {
  APP_TITLE: "Mockly",
  FEEDBACK_TITLE: "Your Interview Feedback",
  INITIAL_TITLE: "Welcome to Mockly",
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
  NO_RESULT: "No result identified",
  SKIP_INTERVIEW: "Done",
  SKIP_CONFIRMATION: "Are you sure you want to finish the interview with your current response?",
  END_INTERVIEW: "End",
  END_CONFIRMATION: "Are you sure you want to end the interview early and return to question selection?",
  NAVIGATION_CONFIRMATION: "You're currently in an interview session. Navigating away will end your current interview. Are you sure you want to continue?"
};

// Default response messages
export const DEFAULT_TIPS = {
  content: "Unable to analyze content at this time.",
  voice: "Reduce pauses and maintain consistent pace.",
  face: "Improve eye contact and maintain confident posture."
};




// Predefined behavioral interview questions
export const INTERVIEW_QUESTIONS = [
  {
    id: 'leadership',
    text: 'Tell me about a time when you had to lead a team through a difficult situation.',
    category: 'Leadership'
  },
  {
    id: 'conflict',
    text: 'Describe a situation where you had to resolve a conflict with a colleague.',
    category: 'Conflict Resolution'
  },
  {
    id: 'challenge',
    text: 'Give me an example of a challenging project you worked on and how you overcame obstacles.',
    category: 'Problem Solving'
  },
  {
    id: 'failure',
    text: 'Tell me about a time when you failed at something and what you learned from it.',
    category: 'Learning & Growth'
  },
  {
    id: 'innovation',
    text: 'Describe a time when you had to think outside the box to solve a problem.',
    category: 'Innovation'
  },
  {
    id: 'teamwork',
    text: 'Tell me about a time when you had to work with a difficult team member.',
    category: 'Teamwork'
  },
  {
    id: 'deadline',
    text: 'Give me an example of a time when you had to meet a tight deadline.',
    category: 'Time Management'
  },
  {
    id: 'change',
    text: 'Describe a situation where you had to adapt to a significant change at work.',
    category: 'Adaptability'
  }
];

// Comprehensive behavioral interview questions organized by categories
export const BEHAVIORAL_QUESTIONS = {
  leadership: {
    id: 'leadership',
    name: 'Leadership & Management',
    icon: 'fas fa-users',
    description: 'Leading teams, managing projects, and taking initiative',
    questions: [
      {
        id: 'leadership',
        text: 'Tell me about a time when you had to lead a team through a difficult situation.',
        difficulty: 'Medium',
        category: 'Leadership'
      },
      {
        id: 'leadership-motivate',
        text: 'Describe a situation where you had to motivate an unmotivated team member.',
        difficulty: 'Hard',
        category: 'Leadership'
      },
      {
        id: 'leadership-decision',
        text: 'Give me an example of a time when you had to make a difficult decision as a leader.',
        difficulty: 'Medium',
        category: 'Leadership'
      },
      {
        id: 'leadership-delegate',
        text: 'Tell me about a time when you had to delegate tasks to team members.',
        difficulty: 'Easy',
        category: 'Leadership'
      },
      {
        id: 'leadership-priorities',
        text: 'Describe a situation where you had to manage conflicting priorities.',
        difficulty: 'Medium',
        category: 'Leadership'
      },
      {
        id: 'leadership-project',
        text: 'Tell me about a time when you had to lead a project from start to finish.',
        difficulty: 'Hard',
        category: 'Leadership'
      },
      {
        id: 'leadership-underperforming',
        text: 'Give me an example of how you handle underperforming team members.',
        difficulty: 'Hard',
        category: 'Leadership'
      },
      {
        id: 'leadership-authority',
        text: 'Tell me about a time when you had to lead without formal authority.',
        difficulty: 'Medium',
        category: 'Leadership'
      },
      {
        id: 'leadership-stakeholders',
        text: 'Describe a situation where you had to manage stakeholder expectations.',
        difficulty: 'Medium',
        category: 'Leadership'
      },
      {
        id: 'leadership-change',
        text: 'Tell me about a time when you had to lead a team through organizational change.',
        difficulty: 'Hard',
        category: 'Leadership'
      },
      {
        id: 'leadership-develop',
        text: 'Give me an example of how you develop leadership skills in others.',
        difficulty: 'Medium',
        category: 'Leadership'
      },
      {
        id: 'leadership-cross-functional',
        text: 'Tell me about a time when you had to lead a cross-functional team.',
        difficulty: 'Hard',
        category: 'Leadership'
      }
    ]
  },
  conflict: {
    id: 'conflict',
    name: 'Conflict Resolution',
    icon: 'fas fa-handshake',
    description: 'Handling disagreements, difficult conversations, and team dynamics',
    questions: [
      {
        id: 'conflict',
        text: 'Describe a situation where you had to resolve a conflict with a colleague.',
        difficulty: 'Medium',
        category: 'Conflict Resolution'
      },
      {
        id: 'conflict-mediate',
        text: 'Tell me about a time when you had to mediate a conflict between team members.',
        difficulty: 'Hard',
        category: 'Conflict Resolution'
      },
      {
        id: 'conflict-disagree',
        text: 'Give me an example of a time when you disagreed with your manager.',
        difficulty: 'Medium',
        category: 'Conflict Resolution'
      },
      {
        id: 'conflict-customer',
        text: 'Describe a situation where you had to handle a difficult customer or client.',
        difficulty: 'Medium',
        category: 'Conflict Resolution'
      },
      {
        id: 'conflict-performance',
        text: 'Tell me about a time when you had to address a performance issue.',
        difficulty: 'Hard',
        category: 'Conflict Resolution'
      },
      {
        id: 'conflict-criticism',
        text: 'Give me an example of how you handle criticism or negative feedback.',
        difficulty: 'Easy',
        category: 'Conflict Resolution'
      },
      {
        id: 'conflict-difficult-person',
        text: 'Describe a situation where you had to work with someone you didn\'t get along with.',
        difficulty: 'Medium',
        category: 'Conflict Resolution'
      },
      {
        id: 'conflict-stakeholder',
        text: 'Tell me about a time when you had to resolve a conflict with a stakeholder.',
        difficulty: 'Hard',
        category: 'Conflict Resolution'
      }
    ]
  },
  problem_solving: {
    id: 'problem_solving',
    name: 'Problem Solving',
    icon: 'fas fa-lightbulb',
    description: 'Analytical thinking, creative solutions, and decision making',
    questions: [
      {
        id: 'challenge',
        text: 'Give me an example of a challenging project you worked on and how you overcame obstacles.',
        difficulty: 'Medium',
        category: 'Problem Solving'
      },
      {
        id: 'innovation',
        text: 'Describe a situation where you had to think outside the box to solve a problem.',
        difficulty: 'Medium',
        category: 'Problem Solving'
      },
      {
        id: 'problem-solving-resources',
        text: 'Tell me about a time when you had to solve a complex problem with limited resources.',
        difficulty: 'Hard',
        category: 'Problem Solving'
      },
      {
        id: 'problem-solving-incomplete',
        text: 'Give me an example of a time when you had to make a decision with incomplete information.',
        difficulty: 'Hard',
        category: 'Problem Solving'
      },
      {
        id: 'problem-solving-troubleshoot',
        text: 'Tell me about a time when you had to troubleshoot a technical issue.',
        difficulty: 'Easy',
        category: 'Problem Solving'
      },
      {
        id: 'problem-solving-prioritize',
        text: 'Describe a situation where you had to prioritize multiple problems.',
        difficulty: 'Medium',
        category: 'Problem Solving'
      },
      {
        id: 'problem-solving-learn',
        text: 'Give me an example of a time when you had to learn something new quickly.',
        difficulty: 'Medium',
        category: 'Problem Solving'
      },
      {
        id: 'problem-solving-adapt',
        text: 'Tell me about a time when you had to adapt your approach to solve a problem.',
        difficulty: 'Medium',
        category: 'Problem Solving'
      },
      {
        id: 'problem-solving-constraints',
        text: 'Describe a situation where you had to work with constraints to solve a problem.',
        difficulty: 'Hard',
        category: 'Problem Solving'
      },
      {
        id: 'problem-solving-explain',
        text: 'Give me an example of a time when you had to explain a complex problem to someone.',
        difficulty: 'Easy',
        category: 'Problem Solving'
      }
    ]
  },
  communication: {
    id: 'communication',
    name: 'Communication',
    icon: 'fas fa-comments',
    description: 'Clear communication, presentations, and stakeholder management',
    questions: [
      {
        id: 'communication-complex',
        text: 'Tell me about a time when you had to explain a complex topic to a non-technical audience.',
        difficulty: 'Medium',
        category: 'Communication'
      },
      {
        id: 'communication-presentation',
        text: 'Describe a situation where you had to give a presentation to senior leadership.',
        difficulty: 'Hard',
        category: 'Communication'
      },
      {
        id: 'communication-bad-news',
        text: 'Give me an example of a time when you had to communicate bad news.',
        difficulty: 'Medium',
        category: 'Communication'
      },
      {
        id: 'communication-persuade',
        text: 'Tell me about a time when you had to persuade someone to see your point of view.',
        difficulty: 'Medium',
        category: 'Communication'
      },
      {
        id: 'communication-timezones',
        text: 'Describe a situation where you had to communicate across different time zones.',
        difficulty: 'Easy',
        category: 'Communication'
      },
      {
        id: 'communication-document',
        text: 'Give me an example of a time when you had to write a technical document.',
        difficulty: 'Medium',
        category: 'Communication'
      },
      {
        id: 'communication-facilitate',
        text: 'Tell me about a time when you had to facilitate a meeting.',
        difficulty: 'Easy',
        category: 'Communication'
      },
      {
        id: 'communication-stakeholders',
        text: 'Describe a situation where you had to communicate with stakeholders with different priorities.',
        difficulty: 'Hard',
        category: 'Communication'
      },
      {
        id: 'communication-feedback',
        text: 'Give me an example of a time when you had to provide constructive feedback.',
        difficulty: 'Medium',
        category: 'Communication'
      }
    ]
  },
  adaptability: {
    id: 'adaptability',
    name: 'Adaptability & Change',
    icon: 'fas fa-sync-alt',
    description: 'Handling change, learning new skills, and flexibility',
    questions: [
      {
        id: 'change',
        text: 'Describe a situation where you had to adapt to a significant change at work.',
        difficulty: 'Medium',
        category: 'Adaptability'
      },
      {
        id: 'adaptability-technology',
        text: 'Tell me about a time when you had to learn a new technology quickly.',
        difficulty: 'Medium',
        category: 'Adaptability'
      },
      {
        id: 'adaptability-uncertainty',
        text: 'Give me an example of a time when you had to work in an uncertain environment.',
        difficulty: 'Hard',
        category: 'Adaptability'
      },
      {
        id: 'adaptability-approach',
        text: 'Describe a situation where you had to change your approach mid-project.',
        difficulty: 'Medium',
        category: 'Adaptability'
      },
      {
        id: 'adaptability-new-team',
        text: 'Tell me about a time when you had to work with a new team or department.',
        difficulty: 'Easy',
        category: 'Adaptability'
      },
      {
        id: 'adaptability-manager',
        text: 'Give me an example of a time when you had to adjust to a new manager or leadership style.',
        difficulty: 'Medium',
        category: 'Adaptability'
      },
      {
        id: 'adaptability-resources',
        text: 'Describe a situation where you had to work with limited resources or budget.',
        difficulty: 'Hard',
        category: 'Adaptability'
      }
    ]
  },
  teamwork: {
    id: 'teamwork',
    name: 'Teamwork & Collaboration',
    icon: 'fas fa-hands-helping',
    description: 'Working with others, collaboration, and team success',
    questions: [
      {
        id: 'teamwork',
        text: 'Tell me about a time when you had to work with a difficult team member.',
        difficulty: 'Medium',
        category: 'Teamwork'
      },
      {
        id: 'teamwork-departments',
        text: 'Describe a situation where you had to collaborate with people from different departments.',
        difficulty: 'Medium',
        category: 'Teamwork'
      },
      {
        id: 'teamwork-credit',
        text: 'Give me an example of a time when you had to share credit for a project.',
        difficulty: 'Easy',
        category: 'Teamwork'
      },
      {
        id: 'teamwork-help',
        text: 'Tell me about a time when you had to help a struggling colleague.',
        difficulty: 'Medium',
        category: 'Teamwork'
      },
      {
        id: 'teamwork-remote',
        text: 'Describe a situation where you had to work with a remote team.',
        difficulty: 'Medium',
        category: 'Teamwork'
      },
      {
        id: 'teamwork-compromise',
        text: 'Give me an example of a time when you had to compromise to reach a team goal.',
        difficulty: 'Medium',
        category: 'Teamwork'
      },
      {
        id: 'teamwork-mentor',
        text: 'Tell me about a time when you had to mentor or train someone.',
        difficulty: 'Medium',
        category: 'Teamwork'
      },
      {
        id: 'teamwork-work-style',
        text: 'Describe a situation where you had to work with a team member who had a different work style.',
        difficulty: 'Easy',
        category: 'Teamwork'
      },
      {
        id: 'teamwork-consensus',
        text: 'Give me an example of a time when you had to build consensus within a team.',
        difficulty: 'Hard',
        category: 'Teamwork'
      },
      {
        id: 'teamwork-experienced',
        text: 'Tell me about a time when you had to work with a team member who was more experienced than you.',
        difficulty: 'Easy',
        category: 'Teamwork'
      },
      {
        id: 'teamwork-less-experienced',
        text: 'Describe a situation where you had to work with a team member who was less experienced than you.',
        difficulty: 'Medium',
        category: 'Teamwork'
      }
    ]
  },
  time_management: {
    id: 'time_management',
    name: 'Time Management',
    icon: 'fas fa-clock',
    description: 'Prioritization, deadlines, and productivity',
    questions: [
      {
        id: 'deadline',
        text: 'Give me an example of a time when you had to meet a tight deadline.',
        difficulty: 'Medium',
        category: 'Time Management'
      },
      {
        id: 'time-management-prioritize',
        text: 'Tell me about a time when you had to prioritize multiple tasks.',
        difficulty: 'Medium',
        category: 'Time Management'
      },
      {
        id: 'time-management-competing',
        text: 'Describe a situation where you had to manage competing deadlines.',
        difficulty: 'Hard',
        category: 'Time Management'
      },
      {
        id: 'time-management-estimate',
        text: 'Give me an example of a time when you had to estimate how long a project would take.',
        difficulty: 'Medium',
        category: 'Time Management'
      },
      {
        id: 'time-management-pressure',
        text: 'Tell me about a time when you had to work under pressure.',
        difficulty: 'Medium',
        category: 'Time Management'
      },
      {
        id: 'time-management-balance',
        text: 'Describe a situation where you had to balance work and personal commitments.',
        difficulty: 'Easy',
        category: 'Time Management'
      }
    ]
  },
  growth: {
    id: 'growth',
    name: 'Learning & Growth',
    icon: 'fas fa-graduation-cap',
    description: 'Continuous learning, feedback, and personal development',
    questions: [
      {
        id: 'failure',
        text: 'Tell me about a time when you failed at something and what you learned from it.',
        difficulty: 'Medium',
        category: 'Learning & Growth'
      },
      {
        id: 'growth-feedback',
        text: 'Describe a situation where you had to learn from feedback.',
        difficulty: 'Easy',
        category: 'Learning & Growth'
      },
      {
        id: 'growth-comfort-zone',
        text: 'Give me an example of a time when you had to step outside your comfort zone.',
        difficulty: 'Medium',
        category: 'Learning & Growth'
      },
      {
        id: 'growth-skill',
        text: 'Tell me about a time when you had to improve a skill quickly.',
        difficulty: 'Medium',
        category: 'Learning & Growth'
      },
      {
        id: 'growth-weakness',
        text: 'Describe a situation where you had to overcome a weakness.',
        difficulty: 'Hard',
        category: 'Learning & Growth'
      },
      {
        id: 'growth-mistake',
        text: 'Give me an example of a time when you had to learn from a mistake.',
        difficulty: 'Easy',
        category: 'Learning & Growth'
      },
      {
        id: 'growth-role',
        text: 'Tell me about a time when you had to adapt to a new role or responsibility.',
        difficulty: 'Medium',
        category: 'Learning & Growth'
      },
      {
        id: 'growth-help-others',
        text: 'Describe a situation where you had to help others learn or grow.',
        difficulty: 'Medium',
        category: 'Learning & Growth'
      }
    ]
  }
};

// Helper function to get all questions as a flat array
export const getAllQuestions = () => {
  return Object.values(BEHAVIORAL_QUESTIONS).flatMap(category => category.questions);
};

// Helper function to get a question by ID
export const getQuestionById = (questionId) => {
  return getAllQuestions().find(question => question.id === questionId);
};

// Helper function to get questions by category
export const getQuestionsByCategory = (categoryId) => {
  return BEHAVIORAL_QUESTIONS[categoryId]?.questions || [];
};

// Helper function to get category info
export const getCategoryInfo = (categoryId) => {
  const category = BEHAVIORAL_QUESTIONS[categoryId];
  if (!category) return null;
  
  return {
    id: category.id,
    name: category.name,
    icon: category.icon,
    description: category.description,
    totalQuestions: category.questions.length
  };
}; 
