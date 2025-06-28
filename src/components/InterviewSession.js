import React from 'react';
import VideoAudioProcessor from './VideoAudioProcessor';

function InterviewSession({ onComplete, onStart }) {
  const [isRunning, setIsRunning] = React.useState(false);
  
  const handleStart = () => {
    setIsRunning(true);
    if (onStart) onStart();
  };
  
  const handleFinish = (metrics, transcript) => {
    console.log('=== INTERVIEW SESSION FINISHED ===');
    console.log('Metrics received:', metrics);
    console.log('Transcript received:', transcript);
    console.log('Transcript length:', transcript.length);
    console.log('Transcript content (first 100 chars):', transcript.substring(0, 100));
    console.log('Transcript content (last 100 chars):', transcript.substring(Math.max(0, transcript.length - 100)));
    console.log('Sending to backend:', { metrics, transcript });
    
    // Use the comprehensive analysis endpoint to get both scoring and STAR analysis
    fetch('http://127.0.0.1:8000/comprehensive-analysis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ metrics, transcript }),
    })
    .then(res => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    })
    .then(data => {
      console.log('=== BACKEND RESPONSE ===');
      console.log('Comprehensive analysis response:', data);
      console.log('STAR analysis data:', data.star_analysis);
      console.log('Backend received transcript:', data.transcript_debug);
      console.log('Backend transcript length:', data.transcript_debug?.length);
      onComplete(data);
    })
    .catch(error => {
      console.error('Error fetching analysis:', error);
      // Fallback to basic scoring if comprehensive analysis fails
      fetch('http://127.0.0.1:8000/score-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metrics, transcript }),
      })
      .then(res => res.json())
      .then(data => onComplete(data))
      .catch(fallbackError => {
        console.error('Fallback also failed:', fallbackError);
        // Provide a basic response if both endpoints fail
        onComplete({
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
