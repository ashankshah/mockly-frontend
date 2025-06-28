import React, { useEffect, useRef, useState } from 'react';

function VideoAudioProcessor({ onFinish }) {
  const videoRef = useRef();
  const transcriptRef = useRef('');
  const [liveTranscript, setLiveTranscript] = useState('');
  const [listeningDots, setListeningDots] = useState('');
  const dotIntervalRef = useRef(null);
  const recognitionRef = useRef(null);
  const finalTranscriptBuffer = useRef('');
  const updateTimeoutRef = useRef(null);
  const isProcessingFinal = useRef(false);

  useEffect(() => {
    //listening dot animation
    dotIntervalRef.current = setInterval(() => {
      setListeningDots(prev => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);

    async function startCapture() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        });
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
        recognition.interimResults = true; // Enable interim results for real-time feedback
        recognition.lang = 'en-US';
        recognition.maxAlternatives = 1; // Reduce processing time by limiting alternatives

        recognition.onresult = (event) => {
          let interimTranscript = '';
          let finalTranscript = finalTranscriptBuffer.current;

          // Process all results
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript + ' ';
              finalTranscriptBuffer.current = finalTranscript;
            } else {
              interimTranscript += transcript;
            }
          }

          // Combine final and interim results for display
          const fullTranscript = finalTranscript + interimTranscript;
          
          // Update state immediately for responsive UI
          transcriptRef.current = fullTranscript;
          
          // Debounce state updates to prevent excessive re-renders
          if (updateTimeoutRef.current) {
            clearTimeout(updateTimeoutRef.current);
          }
          updateTimeoutRef.current = setTimeout(() => {
            setLiveTranscript(fullTranscript);
          }, 100);
          
          console.log("Final transcript:", finalTranscript);
          console.log("Interim transcript:", interimTranscript);
          console.log("Full transcript:", fullTranscript);
          console.log("Final transcript buffer:", finalTranscriptBuffer.current);
        };

        recognition.onerror = (e) => {
          console.error("Speech recognition error:", e);
          // Don't stop on errors, let it continue
        };

        recognition.onend = () => {
          console.log("Speech recognition ended");
          // If we're processing final results, wait a bit more for any pending results
          if (isProcessingFinal.current) {
            setTimeout(() => {
              console.log("Final processing complete. Final transcript buffer:", finalTranscriptBuffer.current);
              const mockMetrics = { voice: { score: 3.5 }, face: { score: 4.2 } };
              const finalTranscript = finalTranscriptBuffer.current.trim() || transcriptRef.current || "No speech detected.";
              console.log("Final transcript being sent to onFinish:", finalTranscript);
              console.log("Final transcript length:", finalTranscript.length);
              onFinish(mockMetrics, finalTranscript);
            }, 500); // Wait 500ms for any final processing
          }
        };

        recognition.onstart = () => {
          console.log("Speech recognition started");
        };

        recognitionRef.current = recognition;
        recognition.start();
        console.log("Speech recognition started");

        setTimeout(() => {
          console.log("=== SESSION TIMEOUT REACHED ===");
          console.log("Final transcript buffer:", finalTranscriptBuffer.current);
          console.log("Transcript ref:", transcriptRef.current);
          console.log("Live transcript state:", liveTranscript);
          
          isProcessingFinal.current = true;
          recognition.stop();
          stream.getTracks().forEach(track => track.stop());
          
          // Don't call onFinish here - let the onend handler do it after processing
        }, 10000);
      } catch (error) {
        console.error("Error starting capture:", error);
        onFinish({ voice: { score: 3.5 }, face: { score: 4.2 } }, "Error starting capture: " + error.message);
      }
    }

    startCapture();
    return () => {
      clearInterval(dotIntervalRef.current);
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
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
