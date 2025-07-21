# Mockly Frontend Testing - Source Code Structure

This document outlines the modular, production-grade architecture of the Mockly frontend testing application.

## 📁 Directory Structure

```
src/
├── components/           # React components organized by feature
│   ├── auth/            # Authentication components
│   ├── interview/       # Interview session components
│   ├── analysis/        # Analysis and tracking components
│   ├── feedback/        # Feedback and reporting components
│   ├── layout/          # Layout and navigation components
│   └── profile/         # User profile components
├── pages/               # Page-level components
├── hooks/               # Custom React hooks
├── contexts/            # React contexts for state management
├── utils/               # Utility functions and helpers
├── constants/           # Application constants
├── config/              # Configuration files
├── styles/              # Global styles and themes
└── assets/              # Static assets (icons, images, etc.)
public/                  # Public files served at root
└── index.html           # Main HTML template
```

## 🧩 Component Organization

### Authentication (`components/auth/`)
- **AuthModal**: Main authentication modal for login/signup
- **OAuthCallback**: Handles OAuth callback flow

### Interview (`components/interview/`)
- **InterviewSession**: Main interview session component
- **SelectedQuestionDisplay**: Displays selected interview questions
- **TranscriptDisplay**: Shows real-time transcript
- **PermissionScreen**: Handles camera/microphone permissions

### Analysis (`components/analysis/`)
- **EyeTrackingAnalyzer**: Analyzes eye movement patterns
- **HandTrackingAnalyzer**: Tracks hand gestures and movements
- **PitchAnalyzer**: Analyzes voice pitch and tone
- **VideoAudioProcessor**: Processes video and audio streams

### Feedback (`components/feedback/`)
- **FeedbackReport**: Comprehensive feedback display component
- **ProcessingScreen**: Loading screen during analysis processing

### Layout (`components/layout/`)
- **Header**: Main application header/navigation
- **VideoCard**: Video display component

### Profile (`components/profile/`)
- **UserProfile**: User profile management component

## 🎣 Custom Hooks (`hooks/`)
- **useMediaStream**: Manages media stream access
- **useSpeechRecognition**: Handles speech recognition
- **useTranscriptSimulation**: Simulates transcript generation

## 🔧 Utilities (`utils/`)
- **interviewUtils**: Interview-related utility functions
- **resourceCleanup**: Resource cleanup and management utilities

## 📋 Constants (`constants/`)
- **interviewConstants**: Interview-related constants and configurations

## ⚙️ Configuration (`config/`)
- **devConfig**: Development environment configuration

## 🎨 Styles (`styles/`)
- **theme.css**: Global application theme and styles

## 📦 Assets (`assets/`)
- **icons/**: SVG icons (Google, LinkedIn)

## 📄 Public Files (`public/`)
- **index.html**: Main HTML template (served at root)

## 🚀 Getting Started

### Importing Components
```javascript
// Import specific components
import { AuthModal, InterviewSession } from './components';

// Import from specific feature
import { AuthModal } from './components/auth';
import { VideoAudioProcessor } from './components/analysis';

// Import utilities
import { interviewUtils } from './utils';

// Import hooks
import { useMediaStream } from './hooks';
```

### Adding New Components
1. Create the component in the appropriate feature directory
2. Add it to the feature's `index.js` file
3. Update this README if needed

## 🏗️ Architecture Principles

1. **Feature-based Organization**: Components are grouped by feature/domain
2. **Single Responsibility**: Each component has a clear, single purpose
3. **Clean Imports**: Index files enable clean, organized imports
4. **Modularity**: Each module is self-contained and reusable
5. **Documentation**: Each module includes clear documentation

## 📝 Development Guidelines

- Keep components small and focused
- Use descriptive naming conventions
- Add JSDoc comments for complex functions
- Follow the established import/export patterns
- Update index files when adding new components

This structure enables new engineers to understand the codebase within 30 minutes by providing clear organization and documentation. 