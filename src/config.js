/**
 * Application Configuration
 * Core settings for production and development
 */

import { DevHelpers } from './config/devConfig';

export const CONFIG = {
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

// Simplified dev config interface
export const DevConfig = {
  isApiDisabled: DevHelpers.isApiDisabled,
  isTranscriptSimulationEnabled: DevHelpers.isTranscriptSimulationEnabled,
  getMockResponse: DevHelpers.getMockResponse,
  simulateApiDelay: DevHelpers.simulateApiDelay,
  getTranscriptSimulationConfig: DevHelpers.getTranscriptSimulationConfig
};
