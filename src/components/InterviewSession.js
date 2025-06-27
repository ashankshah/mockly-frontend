import React from 'react';
import VideoAudioProcessor from './VideoAudioProcessor';

function InterviewSession({ onComplete }) {
  const [isRunning, setIsRunning] = React.useState(false);
  const handleStart = () => {
    setIsRunning(true);
    if (onStart) onStart();
  };
  const handleFinish = (metrics, transcript) => {
    fetch('http://127.0.0.1:8000/score-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ metrics, transcript }),
    })
    .then(res => res.json())
    .then(data => onComplete(data));
  };

  return (
    <div>
      {!isRunning ? (
        <>
          <p>When you're ready, click below to start your interview.</p>
          <button className="mockly-button" onClick={() => setIsRunning(true)}>
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
