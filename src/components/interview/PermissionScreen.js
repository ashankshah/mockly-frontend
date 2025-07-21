/**
 * Permission Screen Component
 * Displays camera/microphone permission request and error handling
 */

import React from 'react';
import { DevHelpers } from '../../config/devConfig';
import { ERROR_MESSAGES } from '../../constants/interviewConstants';

const PermissionScreen = React.memo(({ 
  permissionState, 
  permissionError, 
  onRetry 
}) => {
  const renderPermissionContent = () => {
    switch (permissionState) {
      case 'requesting':
        return (
          <>
            <div className="permission-screen__spinner">
              <div className="permission-screen__spinner-element"></div>
            </div>
            <h3 className="permission-screen__title">
              Requesting Camera & Microphone Access
            </h3>
            <p className="permission-screen__message">
              Please allow access to your camera and microphone to start the interview.
            </p>
          </>
        );
        
      case 'denied':
        return (
          <>
            <h3 className="permission-screen__title">
              Permission Required
            </h3>
            <p className="permission-screen__message">
              We need access to your camera and microphone to conduct the interview.
            </p>
            {permissionError && (
              <div className="permission-screen__error">
                <strong>Error:</strong> {permissionError}
              </div>
            )}
            <div className="permission-screen__instructions">
              <h4>To enable camera and microphone access:</h4>
              <ol>
                <li>Look for the camera/microphone icon in your browser's address bar</li>
                <li>Click on the icon and select "Allow"</li>
                <li>If you don't see the icon, refresh the page and try again</li>
                <li>Make sure your camera and microphone are not being used by other applications</li>
              </ol>
            </div>
            <button 
              className="permission-screen__retry-button"
              onClick={onRetry}
            >
              <i className="fas fa-redo" style={{ marginRight: '0.5rem' }}></i>
              Try Again
            </button>
          </>
        );
        
      default:
        return null;
    }
  };

  if (permissionState === 'granted') {
    return null;
  }

  return (
    <div className="permission-screen">
      <div className="card card--processing">
        <div className="permission-screen__content">
          {renderPermissionContent()}
        </div>
      </div>
    </div>
  );
});

PermissionScreen.displayName = 'PermissionScreen';

export default PermissionScreen; 