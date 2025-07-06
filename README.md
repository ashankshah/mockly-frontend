# Mockly Frontend

A React-based frontend for the Mockly AI Interview application that provides an interactive interview experience with real-time video processing, live transcription, and comprehensive feedback analysis.

## 🎯 Overview

The Mockly frontend delivers a modern, accessible interview practice experience with real-time video capture, speech recognition, and AI-powered feedback. The application features a professional UI with natural layout flow and responsive design.

## ✨ Key Features

### 🎬 Interview Experience
- **Live Video & Audio**: Real-time media capture with camera/audio-only modes
- **Speech Recognition**: Live speech-to-text with scrolling transcript
- **Smart Layout**: Natural flow layout with expandable video sidebar
- **Question Selection**: Curated behavioral interview questions by category
- **Skip Functionality**: Option to skip and end interviews early

### 🎨 Modern UI Design
- **Natural Layout**: Components flow directly in the app without restrictive containers
- **Video Sidebar**: Expandable camera views with "You", "Interviewer", and "Screen Share" placeholders
- **Main Transcript**: Large, primary content area for live transcription
- **Professional Styling**: Clean design with glass morphism effects and consistent spacing

### 📱 Responsive Design
- **Desktop**: Side-by-side video sidebar (280px) and main transcript area
- **Mobile**: Stacked layout with video card on bottom, transcript on top
- **Adaptive**: Smooth transitions between layouts with proper touch targets

### ♿ Accessibility
- **WCAG 2.1 AA Compliant**: Full accessibility support
- **Keyboard Navigation**: Complete keyboard accessibility
- **Screen Reader Support**: Proper ARIA labels and semantic structure
- **High Contrast**: Enhanced visibility in high contrast mode

## 🏗️ Architecture

### Component Structure
```
App.js
├── Header.js
├── InterviewSession.js
│   ├── SelectedQuestionDisplay.js (preview variant)
│   └── VideoAudioProcessor.js
│       ├── SelectedQuestionDisplay.js (interview variant)
│       └── VideoCard (expandable sidebar)
└── FeedbackReport.js
```

### Layout System
- **Natural Flow**: Components lie directly in the app without container constraints
- **Flexbox-based**: Modern CSS layout with proper responsive behavior
- **Card Containers**: Initial, processing, and feedback screens use contained layouts
- **Interview Screen**: Open layout with sidebar and main content areas

## 🎮 Interview Flow

### 1. Question Selection
- **Question Group**: Visual grouping of question selector and selected question
- **Category Display**: Questions organized by behavioral interview categories
- **Preview Mode**: Compact question display for selection screen

### 2. Interview Session
- **Question Display**: Prominent question presentation at top
- **Video Sidebar**: Expandable video card with camera controls
  - **Collapsed**: Shows "You" video with up arrow (▲)
  - **Expanded**: Shows "You", "Interviewer", and "Screen Share" with down arrow (▼)
- **Main Transcript**: Large, scrollable live transcript area
- **Controls**: Fixed skip button (bottom-right corner)

### 3. Processing & Feedback
- **Processing Screen**: Loading animation with contained layout
- **Feedback Report**: Comprehensive STAR analysis with scoring
- **Performance Metrics**: Detailed breakdown with improvement tips

## 🛠️ Technical Implementation

### CSS Architecture
```css
/* Natural Interview Layout */
.interview-content-wrapper {
  display: flex;
  gap: var(--spacing-md);
  min-height: 500px;
}

.interview-sidebar {
  width: 280px;
  flex-shrink: 0;
}

.interview-main {
  flex: 1;
}
```

### Video Card System
- **Expandable Interface**: Toggle between 1 and 3 video views
- **State Management**: React state for expansion control
- **Responsive Design**: Adapts to mobile with stacked layout
- **Accessibility**: Proper ARIA labels and keyboard navigation

### Responsive Breakpoints
- **Mobile**: `@media (max-width: 640px)` - Stacked layout
- **Tablet**: `@media (max-width: 768px)` - Optimized spacing
- **Desktop**: `@media (min-width: 1024px)` - Full sidebar layout

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v14 or higher)
- **npm** or **yarn**
- **Modern Browser** with Web Speech API support

### Installation
```bash
cd mockly-frontend
npm install
```

### Development
```bash
npm start
```
Opens at `http://localhost:3000`

### Production Build
```bash
npm run build
```

### Testing
```bash
npm test
```

## 🔧 Configuration

### Environment Variables
```bash
# Disable API calls for frontend-only testing
REACT_APP_DISABLE_API=true
```

### Config Options (`src/config.js`)
```javascript
export const isApiDisabled = () => {
  return process.env.REACT_APP_DISABLE_API === 'true' || false;
};
```

## 🧪 Development Mode

### API Mocking
When `REACT_APP_DISABLE_API=true`:
- ✅ **Visual Indicator**: Yellow "DEV MODE" banner
- ✅ **Mock Data**: Realistic STAR analysis and scoring
- ✅ **Simulated Delays**: 1-second delay to mimic API calls
- ✅ **Console Logging**: Shows when mock data is used
- ✅ **Offline Operation**: Works without backend

### Transcript Simulation
- **Live Simulation**: Realistic typing simulation for development
- **Configurable**: Adjustable speed and content
- **Dev Indicators**: Clear visual feedback for development mode

## 📁 File Structure

```
src/
├── components/
│   ├── SelectedQuestionDisplay.js     # Reusable question display
│   ├── InterviewSession.js           # Question selection flow
│   ├── VideoAudioProcessor.js        # Interview recording & transcription
│   ├── FeedbackReport.js             # AI feedback display
│   ├── Header.js                     # Application header
│   └── __tests__/                    # Component tests
├── constants/
│   └── interviewConstants.js         # Questions, UI text, configuration
├── utils/
│   └── interviewUtils.js             # Utility functions
├── config.js                         # App configuration
├── theme.css                         # Global styles & design system
├── index.js                          # App entry point
└── App.js                           # Main application component
```

## 🎨 Design System

### CSS Custom Properties
```css
:root {
  --color-primary: #3BA676;
  --color-primary-light: #E8F5E8;
  --color-primary-medium: #B8E6CA;
  --color-primary-dark: #2D8A5A;
  --spacing-md: 1.5rem;
  --border-radius-md: 12px;
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.1);
}
```

### Component Variants
- **Cards**: `card--interview`, `card--processing`, `card--feedback`
- **Questions**: `preview`, `interview`, `minimal` variants
- **Buttons**: `button--disabled`, `button--full-width`

## 🧪 Testing

### Test Coverage
- **Component Tests**: All major components tested
- **Integration Tests**: Full interview flow testing
- **Accessibility Tests**: ARIA and keyboard navigation
- **Responsive Tests**: Layout across different screen sizes

### Running Tests
```bash
npm test                    # Run all tests
npm test -- --watch        # Watch mode
npm test -- --coverage     # Coverage report
```

## 🔄 Recent Updates

### Layout Improvements
- ✅ **Natural Flow**: Removed restrictive containers for interview screen
- ✅ **Video Card**: New expandable sidebar with camera view controls
- ✅ **Arrow Logic**: Intuitive arrow direction (up for expand, down for collapse)
- ✅ **Responsive**: Full mobile optimization with stacked layout

### Performance Optimizations
- ✅ **Lazy Loading**: Components load only when needed
- ✅ **Efficient Rendering**: Optimized React patterns
- ✅ **CSS Optimization**: Minimal, efficient stylesheets
- ✅ **Bundle Size**: Optimized for fast loading

## 🤝 Contributing

### Development Guidelines
1. **Follow Existing Patterns**: Maintain consistency with established code patterns
2. **Component Reusability**: Design components for multiple contexts
3. **Accessibility First**: Ensure all features meet WCAG 2.1 AA standards
4. **Responsive Design**: Test across all device sizes
5. **Performance**: Consider performance implications of changes

### Code Standards
- **ESLint**: Follow established linting rules
- **Prettier**: Consistent code formatting
- **BEM CSS**: Block Element Modifier methodology
- **Semantic HTML**: Use appropriate HTML elements

## 📄 License

This project is part of the Mockly AI Interview application.

---

**Built with React ⚛️ for modern interview practice**