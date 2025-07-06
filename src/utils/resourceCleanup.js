/**
 * Resource Cleanup Utility
 * Centralized cleanup for timeouts, intervals, media streams, and speech recognition
 */

import { DevHelpers } from '../config/devConfig';

export const ResourceCleanup = {
  /**
   * Clean up all timeouts
   */
  clearTimeouts: (...timeoutRefs) => {
    timeoutRefs.forEach(ref => {
      if (ref?.current) {
        clearTimeout(ref.current);
        ref.current = null;
      }
    });
  },

  /**
   * Clean up all intervals
   */
  clearIntervals: (...intervalRefs) => {
    intervalRefs.forEach(ref => {
      if (ref?.current) {
        clearInterval(ref.current);
        ref.current = null;
      }
    });
  },

  /**
   * Stop all media stream tracks
   */
  stopMediaTracks: (...streams) => {
    streams.forEach(stream => {
      if (stream?.getTracks) {
        stream.getTracks().forEach(track => {
          track.stop();
          DevHelpers.log('Media track stopped:', track.kind);
        });
      }
    });
  },

  /**
   * Stop speech recognition
   */
  stopSpeechRecognition: (...recognitionRefs) => {
    recognitionRefs.forEach(ref => {
      if (ref?.current) {
        try {
          ref.current.stop();
          DevHelpers.log('Speech recognition stopped');
        } catch (error) {
          DevHelpers.error('Error stopping speech recognition:', error);
        }
        ref.current = null;
      }
    });
  },

  /**
   * Comprehensive cleanup for all resources
   */
  cleanupAll: ({
    timeouts = [],
    intervals = [],
    mediaStreams = [],
    speechRecognition = []
  }) => {
    try {
      DevHelpers.log('Starting comprehensive resource cleanup...');
      
      // Clear timeouts
      if (timeouts.length > 0) {
        ResourceCleanup.clearTimeouts(...timeouts);
        DevHelpers.log(`Cleared ${timeouts.length} timeouts`);
      }
      
      // Clear intervals
      if (intervals.length > 0) {
        ResourceCleanup.clearIntervals(...intervals);
        DevHelpers.log(`Cleared ${intervals.length} intervals`);
      }
      
      // Stop media streams
      if (mediaStreams.length > 0) {
        ResourceCleanup.stopMediaTracks(...mediaStreams);
        DevHelpers.log(`Stopped ${mediaStreams.length} media streams`);
      }
      
      // Stop speech recognition
      if (speechRecognition.length > 0) {
        ResourceCleanup.stopSpeechRecognition(...speechRecognition);
        DevHelpers.log(`Stopped ${speechRecognition.length} speech recognition instances`);
      }
      
      DevHelpers.log('Resource cleanup completed successfully');
    } catch (error) {
      DevHelpers.error('Error during resource cleanup:', error);
    }
  }
}; 