/**
 * Transcript Display Component
 * Displays live transcript with auto-scrolling and development indicators
 */

import React from 'react';
import { DevHelpers } from '../../config/devConfig';
import { UI_TEXT, DEV_MESSAGES } from '../../constants/interviewConstants';

const TranscriptDisplay = React.memo(({ 
  transcript, 
  isListening, 
  listeningDots, 
  scrollableRef 
}) => {
  const renderTranscriptContent = () => {
    if (!transcript) {
      return (
        <div className="transcript-main__content">
          <div className="transcript-main__text">
            {DevHelpers.isTranscriptSimulationEnabled() 
              ? DEV_MESSAGES.SIMULATION_ENABLED 
              : `${UI_TEXT.LISTENING}${listeningDots}`
            }
          </div>
        </div>
      );
    }

    return (
      <div 
        className="transcript-main__content"
        ref={scrollableRef}
      >
        <div className="transcript-main__text">
          {transcript}
        </div>
      </div>
    );
  };

  const renderDevIndicator = () => {
    if (!DevHelpers.isTranscriptSimulationEnabled()) {
      return null;
    }

    return (
      <div className="transcript-main__dev-indicator">
        <small>{DEV_MESSAGES.SIMULATION_ACTIVE}</small>
      </div>
    );
  };

  return (
    <div className="transcript-main">
      <div className="transcript-main__header">
        <h3 className="transcript-main__title">
          <i className="fas fa-file-alt icon-sm"></i>
          {UI_TEXT.TRANSCRIPT_TITLE}
        </h3>
      </div>
      {renderTranscriptContent()}
      {renderDevIndicator()}
    </div>
  );
});

TranscriptDisplay.displayName = 'TranscriptDisplay';

export default TranscriptDisplay; 