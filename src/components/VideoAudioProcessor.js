import React, { useEffect, useRef, useState } from 'react';

function VideoAudioProcessor({ onFinish }) {
  const videoRef = useRef();
  const transcriptRef = useRef('');
  const [liveTranscript, setLiveTranscript] = useState('');
  const [listeningDots, setListeningDots] = useState('');
  const dotIntervalRef = useRef(null);

  useEffect(() => {
    //listening dot animation
    dotIntervalRef.current = setInterval(() => {
      setListeningDots(prev => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);

    async function startCapture() {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      videoRef.current.srcObject = stream;
      videoRef.current.muted = true;
      videoRef.current.play();

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        alert("Speech Recognition API not supported in this browser.");
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        const result = Array.from(event.results)
          .map(r => r[0].transcript)
          .join(' ');
        console.log("Recognized speech:", result);
        transcriptRef.current = result;
        setLiveTranscript(result);
      };

      recognition.onerror = (e) => {
        console.error("Speech recognition error:", e);
      };

      recognition.start();
      console.log("Speech recognition started");

      setTimeout(() => {
        recognition.stop();
        stream.getTracks().forEach(track => track.stop());
        const mockMetrics = { voice: { score: 3.5 }, face: { score: 4.2 } };
        onFinish(mockMetrics, transcriptRef.current || "No speech detected.");
      }, 5000);
    }

    startCapture();
    return () => {
      clearInterval(dotIntervalRef.current); // ✅ FIXED: now accessible
    };
  }, [onFinish]);

  return (
    <div>
      <div className="video-box">
        <video
          ref={videoRef}
          className="video-element"
          autoPlay
          muted
          playsInline
        />
      </div>
  
      <div className="transcript-box">
        <h4>Transcript (live)</h4>
        <p>{liveTranscript || `Listening ${listeningDots}`}</p>
      </div>
    </div>
  );
  
}

export default VideoAudioProcessor;
