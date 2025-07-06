/**
 * Video Card Component
 * Displays video feed or audio-only placeholder with expand/collapse functionality
 */

import React, { useEffect } from 'react';
import { DevHelpers } from '../config/devConfig';

const VideoCard = React.memo(({ 
  hasVideo, 
  isAudioOnly, 
  isExpanded, 
  onToggle, 
  videoRef,
  mediaStream
}) => {
  // Debug logging
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

  // Set up video element when stream is available
  useEffect(() => {
    if (mediaStream && videoRef?.current && hasVideo) {
      const videoElement = videoRef.current;
      
      DevHelpers.log('Setting up video element with stream:', {
        stream: mediaStream,
        videoTracks: mediaStream.getVideoTracks().length,
        audioTracks: mediaStream.getAudioTracks().length
      });
      
      try {
        videoElement.srcObject = mediaStream;
        videoElement.muted = true;
        videoElement.autoplay = true;
        videoElement.playsInline = true;
        
        // Add event listeners
        videoElement.onloadedmetadata = () => {
          DevHelpers.log('Video metadata loaded:', {
            videoWidth: videoElement.videoWidth,
            videoHeight: videoElement.videoHeight,
            duration: videoElement.duration
          });
        };
        
        videoElement.oncanplay = () => {
          DevHelpers.log('Video can play');
        };
        
        videoElement.onplaying = () => {
          DevHelpers.log('Video is playing');
        };
        
        videoElement.onerror = (error) => {
          DevHelpers.error('Video element error:', error);
        };
        
        // Start playing
        videoElement.play().catch(error => {
          DevHelpers.error('Error starting video playback:', error);
        });
        
        DevHelpers.log('Video element setup complete');
      } catch (error) {
        DevHelpers.error('Error setting up video element:', error);
      }
    }
  }, [mediaStream, videoRef, hasVideo]);

  // Monitor video element
  useEffect(() => {
    if (videoRef?.current) {
      const videoElement = videoRef.current;
      DevHelpers.log('Video element found:', {
        srcObject: videoElement.srcObject,
        videoWidth: videoElement.videoWidth,
        videoHeight: videoElement.videoHeight,
        readyState: videoElement.readyState
      });
      
      // Check if we have access to the media stream through the parent component
      if (videoElement.srcObject) {
        const stream = videoElement.srcObject;
        const videoTracks = stream.getVideoTracks();
        const audioTracks = stream.getAudioTracks();
        
        DevHelpers.log('Stream tracks:', {
          videoTracks: videoTracks.length,
          audioTracks: audioTracks.length,
          videoTrackState: videoTracks[0]?.readyState,
          videoTrackEnabled: videoTracks[0]?.enabled
        });
        
        // Check if video is actually playing
        setTimeout(() => {
          DevHelpers.log('Video playback status:', {
            paused: videoElement.paused,
            currentTime: videoElement.currentTime,
            duration: videoElement.duration,
            width: videoElement.videoWidth,
            height: videoElement.videoHeight
          });
        }, 1000);
      }
    }
  }, [videoRef, hasVideo]);

  // Test function to manually get camera stream
  const testVideoSetup = async () => {
    try {
      DevHelpers.log('Testing manual video setup...');
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      
      if (videoRef?.current) {
        const videoElement = videoRef.current;
        videoElement.srcObject = stream;
        videoElement.muted = true;
        videoElement.play();
        
        DevHelpers.log('Manual video setup successful');
      }
    } catch (error) {
      DevHelpers.error('Manual video setup failed:', error);
    }
  };

  const renderMainVideo = () => {
    DevHelpers.log('Rendering main video:', { hasVideo, isAudioOnly });
    
    if (hasVideo) {
      return (
        <div className="video-card__video-container">
          <div className="video-card__video-label">
            <i className="fas fa-video icon-sm"></i>
            Your Video
            <button 
              onClick={testVideoSetup}
              style={{ marginLeft: '10px', fontSize: '12px', padding: '2px 6px' }}
            >
              Test Video
            </button>
          </div>
          <div className="video-card__video-box">
            <video 
              ref={videoRef}
              className="video-card__video-element"
              autoPlay 
              playsInline 
              muted
              style={{ backgroundColor: '#000' }}
              onLoadedMetadata={() => DevHelpers.log('Video metadata loaded')}
              onCanPlay={() => DevHelpers.log('Video can play')}
              onPlaying={() => DevHelpers.log('Video is playing')}
              onError={(e) => DevHelpers.error('Video error:', e)}
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

  const renderAdditionalVideos = () => {
    if (!isExpanded) return null;
    
    return (
      <>
        {/* Additional video feed 1 */}
        <div className="video-card__video-container">
          <div className="video-card__video-label">
            <i className="fas fa-user icon-sm"></i>
            Interviewer View
          </div>
          <div className="video-card__video-box video-card__video-box--placeholder">
            <div className="video-card__placeholder">
              <i className="fas fa-user video-card__placeholder-icon"></i>
              <div className="video-card__placeholder-text">
                <span>Interviewer</span>
                <small>Simulated view</small>
              </div>
            </div>
          </div>
        </div>
        
        {/* Additional video feed 2 */}
        <div className="video-card__video-container">
          <div className="video-card__video-label">
            <i className="fas fa-desktop icon-sm"></i>
            Screen Share
          </div>
          <div className="video-card__video-box video-card__video-box--placeholder">
            <div className="video-card__placeholder">
              <i className="fas fa-desktop video-card__placeholder-icon"></i>
              <div className="video-card__placeholder-text">
                <span>Screen Share</span>
                <small>Not active</small>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };

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
        {/* Main video - always shown */}
        {renderMainVideo()}
        
        {/* Additional videos - only when expanded */}
        {renderAdditionalVideos()}
      </div>
    </div>
  );
});

VideoCard.displayName = 'VideoCard';

export default VideoCard; 