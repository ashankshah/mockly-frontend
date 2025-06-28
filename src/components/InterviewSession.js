import React from 'react';
import VideoAudioProcessor from './VideoAudioProcessor';

// Helper functions
const createDefaultResponse = (metrics, transcript) => ({
  content_score: 3.0,
  voice_score: metrics.voice?.score || 3.5,
  face_score: metrics.face?.score || 4.2,
  tips: {
    content: "Unable to analyze content at this time.",
    voice: "Reduce pauses and maintain consistent pace.",
    face: "Improve eye contact and maintain confident posture."
  },
  transcript_debug: transcript
});

const fetchConfig = {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
};

function InterviewSession({ onComplete, onStart }) {
  const [isRunning, setIsRunning] = React.useState(false);
  
  const handleStart = () => {
    setIsRunning(true);
    if (onStart) onStart();
  };
  
  const handleFinish = (metrics, transcript) => {
    const requestBody = JSON.stringify({ metrics, transcript });
    
    // Primary endpoint
    fetch('http://127.0.0.1:8000/comprehensive-analysis', {
      ...fetchConfig,
      body: requestBody
    })
    .then(res => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    })
    .then(data => {
      onComplete(data);
    })
    .catch(error => {
      console.error('Error fetching analysis:', error);
      
      // Fallback endpoint
      fetch('http://127.0.0.1:8000/score-session', {
        ...fetchConfig,
        body: requestBody
      })
      .then(res => res.json())
      .then(data => onComplete(data))
      .catch(fallbackError => {
        console.error('Fallback also failed:', fallbackError);
        onComplete(createDefaultResponse(metrics, transcript));
      });
    });
  };

  return (
    <div>
      {!isRunning ? (
        <>
          <p>When you're ready, click below to start your interview.</p>
          <button className="mockly-button" onClick={handleStart}>
            Start Interview
          </button>
        </>
      ) : (
        <VideoAudioProcessor onFinish={handleFinish} />
      )}
    </div>
  );
}

export default InterviewSession;
