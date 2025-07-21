/**
 * Video Card Component
 * Displays video feed with user video only (interviewer view and screen share removed)
 */

import React, { useEffect, useRef } from 'react';
import { DevHelpers } from '../../config/devConfig';

const VideoCard = React.memo(({ 
  hasVideo, 
  isAudioOnly, 
  isExpanded, 
  onToggle, 
  videoRef,
  mediaStream
}) => {

  useEffect(() => {
    DevHelpers.log('VideoCard props:', {
      hasVideo,
      isAudioOnly,
      isExpanded,
      videoRef: videoRef?.current,
      videoRefExists: !!videoRef?.current,
      mediaStream: !!mediaStream
    });
  }, [hasVideo, isAudioOnly, isExpanded, videoRef, mediaStream]);

  useEffect(() => {
    if (mediaStream && hasVideo) {
      if (videoRef?.current) {
        const videoElement = videoRef.current;
        try {
          videoElement.srcObject = mediaStream;
          videoElement.muted = true;
          videoElement.autoplay = true;
          videoElement.playsInline = true;
          videoElement.onloadedmetadata = () => {
            DevHelpers.log('Main video metadata loaded');
          };
          videoElement.play().catch(error => {
            DevHelpers.error('Error starting main video playback:', error);
          });
        } catch (error) {
          DevHelpers.error('Error setting up main video element:', error);
        }
      }


    }
  }, [mediaStream, videoRef, hasVideo]);

  // Canvas-related effects removed - no longer needed without interviewer view

  const renderMainVideo = () => {
    if (hasVideo) {
      return (
        <div className="video-card__video-container">
          <div className="video-card__video-label">
            <i className="fas fa-video icon-sm"></i>
            Your Video
          </div>
          <div className="video-card__video-box">
            <video 
              ref={videoRef}
              className="video-card__video-element"
              autoPlay 
              playsInline 
              muted
              style={{ backgroundColor: '#000' }}
            />
          </div>
        </div>
      );
    }
    if (isAudioOnly) {
      return (
        <div className="video-card__video-container">
          <div className="video-card__video-label">
            <i className="fas fa-microphone icon-sm"></i>
            Audio Only
          </div>
          <div className="video-card__video-box video-card__video-box--placeholder">
            <div className="video-card__audio-only-placeholder">
              <i className="fas fa-microphone video-card__audio-only-icon"></i>
              <div className="video-card__audio-only-text">
                <h4>Audio Only Mode</h4>
                <p>Your microphone is active</p>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className="video-card__video-container">
        <div className="video-card__video-label">
          <i className="fas fa-video icon-sm"></i>
          Video
        </div>
        <div className="video-card__video-box video-card__video-box--placeholder">
          <div className="video-card__placeholder">
            <i className="fas fa-video video-card__placeholder-icon"></i>
            <div className="video-card__placeholder-text">
              <span>No video feed</span>
              <small>Setting up camera...</small>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Interviewer view and screen share removed - only main video is shown

  return (
    <div className={`video-card ${isExpanded ? 'video-card--expanded' : ''}`}>
      <div className="video-card__header">
        <h3 className="video-card__title">
          <i className="fas fa-video icon-sm"></i>
          Video Feed
        </h3>
        <button 
          className="video-card__toggle"
          onClick={onToggle}
          aria-label={isExpanded ? 'Collapse video' : 'Expand video'}
        >
          <i className={`fas ${isExpanded ? 'fa-chevron-up' : 'fa-chevron-down'} video-card__arrow`}></i>
        </button>
      </div>
      <div className="video-card__content">
        {renderMainVideo()}
      </div>
    </div>
  );
});

VideoCard.displayName = 'VideoCard';

export default VideoCard;