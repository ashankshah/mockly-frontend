# Mockly Frontend

A React-based frontend for the Mockly AI Interview application that provides an interactive interview experience with real-time video processing and feedback.

## Features

### Interview Flow
- **Question Selection**: Users can choose from predefined behavioral interview questions
- **Video Recording**: Real-time video and audio capture during interviews
- **Live Transcript**: Speech-to-text conversion with live transcript display
- **AI Analysis**: Comprehensive feedback using STAR method evaluation
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices

### Question Display System
The application now includes a sophisticated question display system that shows the selected interview question throughout the interview process:

#### Components
- **SelectedQuestionDisplay**: Reusable component for displaying interview questions
- **Variants**: Three display variants for different contexts:
  - `preview`: Compact display for the question selection screen
  - `interview`: Prominent display during the interview with category information
  - `minimal`: Minimal display for space-constrained areas

#### Layout Design
- **Non-Interfering Design**: Question display positioned above the video feed, ensuring no obstruction
- **Responsive Layout**: Adapts to different screen sizes while maintaining video visibility
- **Flexbox Layout**: Uses modern CSS flexbox for optimal space utilization
- **Large Screen Optimization**: On screens ≥1024px, video and transcript display side-by-side

#### Accessibility Features
- **ARIA Labels**: Proper accessibility attributes for screen readers
- **Semantic HTML**: Uses appropriate heading levels and semantic structure
- **Keyboard Navigation**: Full keyboard accessibility support
- **High Contrast Support**: Enhanced visibility in high contrast mode

## Technical Implementation

### Component Architecture
```
App.js
├── InterviewSession.js
│   ├── SelectedQuestionDisplay.js (preview variant)
│   └── VideoAudioProcessor.js
│       └── SelectedQuestionDisplay.js (interview variant)
└── FeedbackReport.js
```

### CSS Architecture
- **Modular CSS**: Component-specific styles with BEM methodology
- **CSS Custom Properties**: Consistent design tokens for colors, spacing, and typography
- **Responsive Design**: Mobile-first approach with progressive enhancement
- **Performance Optimized**: Minimal CSS with efficient selectors

### Testing Strategy
- **Component Tests**: Unit tests for all question display variants
- **Integration Tests**: Tests for question display integration with video processor
- **Accessibility Tests**: Verification of ARIA attributes and semantic structure
- **Responsive Tests**: Layout testing across different screen sizes

## Development

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation
```bash
npm install
```

### Running the Application
```bash
npm start
```

### Running Tests
```bash
npm test
```

### Building for Production
```bash
npm run build
```

## Code Quality Standards

### Clean Code Principles
- **Single Responsibility**: Each component has a single, well-defined purpose
- **Reusability**: Components are designed for reuse across different contexts
- **Consistent Naming**: Follows established naming conventions throughout the codebase
- **Small Functions**: Functions are kept small and focused
- **Separation of Concerns**: Clear separation between UI and business logic

### Accessibility Standards
- **WCAG 2.1 AA Compliance**: Meets accessibility standards
- **Screen Reader Support**: Proper ARIA labels and semantic structure
- **Keyboard Navigation**: Full keyboard accessibility
- **Color Contrast**: Sufficient contrast ratios for text readability

### Performance Considerations
- **Lazy Loading**: Components load only when needed
- **Optimized Rendering**: Efficient React rendering patterns
- **CSS Optimization**: Minimal and efficient stylesheets
- **Bundle Size**: Optimized for fast loading times

## File Structure

```
src/
├── components/
│   ├── SelectedQuestionDisplay.js     # Reusable question display component
│   ├── InterviewSession.js           # Main interview flow component
│   ├── VideoAudioProcessor.js        # Video/audio processing component
│   ├── FeedbackReport.js             # Interview feedback display
│   └── __tests__/                    # Component test files
├── constants/
│   └── interviewConstants.js         # Interview configuration and text
├── utils/
│   └── interviewUtils.js             # Utility functions
├── config.js                         # Application configuration
├── theme.css                         # Global styles and design system
└── App.js                           # Main application component
```

## Contributing

When contributing to this project, please ensure:

1. **Follow Existing Patterns**: Maintain consistency with established code patterns
2. **Write Tests**: Include tests for new functionality
3. **Update Documentation**: Keep README and comments up to date
4. **Accessibility**: Ensure new features meet accessibility standards
5. **Responsive Design**: Test across different screen sizes
6. **Performance**: Consider performance implications of changes

## License

This project is part of the Mockly AI Interview application.

## Features

- 🎥 Real-time video and audio capture
- 🗣️ Live speech recognition with transcript generation
- 🤖 AI-powered STAR method analysis
- 📊 Comprehensive scoring and feedback
- 🎨 Modern, professional UI with glass morphism design
- ⚡ 10-second interview sessions with automatic processing

## Quick Start

### Prerequisites
- Node.js and npm installed
- Modern browser with Web Speech API support
- Backend server running on port 8000

### Installation
```bash
cd mockly-frontend
npm install
npm start
```

The app will open at `http://localhost:3000`

## Development

### Disabling API Calls for Testing

To disable backend API calls during development and use mock data instead:

**Option 1: Environment Variable (Recommended)**
```bash
# Create a .env file in the frontend directory
echo "REACT_APP_DISABLE_API=true" > .env

# Or set it temporarily
REACT_APP_DISABLE_API=true npm start
```

**Option 2: Modify config.js**
```javascript
// In src/config.js, change:
disableApiCalls: true  // instead of false
```

**Option 3: Quick Toggle**
```javascript
// In src/config.js, temporarily change:
disableApiCalls: process.env.REACT_APP_DISABLE_API === 'true' || true,
```

### Development Mode Features

When API calls are disabled:
- ✅ **Visual indicator** - Yellow banner shows "DEV MODE"
- ✅ **Mock data** - Realistic STAR analysis and scoring
- ✅ **Simulated delay** - 1-second delay to mimic real API calls
- ✅ **Console logging** - Shows when mock data is being used
- ✅ **No backend required** - Works completely offline

### Re-enabling API Calls

Simply set the environment variable to false or remove it:
```bash
# Remove the .env file or set to false
echo "REACT_APP_DISABLE_API=false" > .env
# Or just delete the .env file
rm .env
```

## Technology Stack

- **React 18** - Modern React with hooks
- **Web Speech API** - Real-time speech recognition
- **MediaDevices API** - Camera and microphone access
- **CSS3** - Custom styling with modern design patterns
- **Fetch API** - Backend communication

## Project Structure

```
src/
├── App.js                    # Main application component
├── index.js                  # React entry point
├── config.js                 # Configuration and dev settings
├── components/               # React components
│   ├── InterviewSession.js   # Interview flow management
│   ├── VideoAudioProcessor.js # Video/audio capture & processing
│   └── FeedbackReport.js     # Results display with STAR analysis
└── theme.css                 # Styling and design system
```

## API Integration

The frontend communicates with a FastAPI backend running on port 8000:

- **Primary Endpoint**: `POST /comprehensive-analysis` - Combined scoring and STAR analysis
- **Fallback Endpoint**: `POST /score-session` - Basic scoring if primary fails
- **Data Format**: JSON with metrics and transcript

## Production Ready

- ✅ Clean console logging (only essential error reporting)
- ✅ Proper resource cleanup
- ✅ Error handling with fallback mechanisms
- ✅ Optimized performance
- ✅ Ready for mainline deployment

## Browser Support

Requires modern browsers with support for:
- Web Speech API
- MediaDevices API
- CSS Grid
- ES6+ features

## Development

For detailed development information, see `meta_data_frontend` in the project root.

## Development Configuration

### Environment Variables

Create a `.env` file in the `mockly-frontend` directory:

```bash
# Disable backend API calls for testing (optional)
REACT_APP_DISABLE_API=true

# Enable transcript simulation for UI testing (optional)
REACT_APP_SIMULATE_TRANSCRIPT=true
```

### API Call Control

To disable backend API calls during development:

1. Set `REACT_APP_DISABLE_API=true` in your `.env` file
2. The app will use mock data instead of making actual API calls
3. Useful for frontend development without backend dependencies

### Transcript Simulation

To simulate transcript filling during interviews:

1. Set `REACT_APP_SIMULATE_TRANSCRIPT=true` in your `.env` file
2. The transcript box will automatically fill with sample STAR method responses
3. Includes interim results simulation for realistic UI testing
4. No need to speak during interviews - perfect for UI development

**Simulation Features:**
- Automatically adds sentences every 2 seconds
- Shows interim text before finalizing each sentence
- Simulates realistic speech recognition behavior
- Uses sample STAR method responses

**Configuration Options:**
- Adjust timing in `src/config.js`
- Modify sample sentences for different scenarios
- Toggle interim results simulation

## Browser Compatibility

- Chrome/Chromium (recommended for speech recognition)
- Firefox
- Safari
- Edge

**Note**: Speech recognition works best in Chrome-based browsers.

## Development Tips

1. **Use transcript simulation** for UI testing without speaking
2. **Disable API calls** for frontend-only development
3. **Check browser console** for speech recognition errors
4. **Test on different screen sizes** for responsive design
5. **Use Chrome DevTools** for media stream debugging

## Troubleshooting

### Speech Recognition Issues
- Ensure microphone permissions are granted
- Use Chrome browser for best compatibility
- Check console for error messages

### Video/Audio Problems
- Verify camera and microphone permissions
- Check browser security settings
- Try refreshing the page

### API Connection Issues
- Verify backend is running on `http://127.0.0.1:8000`
- Check CORS settings in backend
- Use mock data mode for frontend-only development