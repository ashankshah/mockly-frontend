import React, { useEffect, useRef, useState } from 'react';

function VideoAudioProcessor({ onFinish }) {
  const videoRef = useRef();
  const transcriptRef = useRef('');
  const [liveTranscript, setLiveTranscript] = useState('');

  useEffect(() => {
    async function startCapture() {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      videoRef.current.srcObject = stream;
      videoRef.current.muted = true; // 🔇 prevent echo
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
        console.log("Recognized speech:", result); // ✅ debugging line
        transcriptRef.current = result;
        setLiveTranscript(result);
      };
  
      recognition.onerror = (e) => {
        console.error("Speech recognition error:", e);
      };
  
      recognition.start();
      console.log("Audio speech recognition started");
  
      setTimeout(() => {
        recognition.stop();
        stream.getTracks().forEach(track => track.stop());
        const mockMetrics = { voice: { score: 3.5 }, face: { score: 4.2 } };
        onFinish(mockMetrics, transcriptRef.current || "No speech detected.");
      }, 5000);
    }
  
    startCapture();
  }, [onFinish]);
  

  return (
    <div>
      <video ref={videoRef} width="400" height="300" />
      <p><strong>Transcript (live):</strong> {liveTranscript}</p>
    </div>
  );
}

export default VideoAudioProcessor;
