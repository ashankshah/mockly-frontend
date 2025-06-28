import React, { useEffect, useRef, useState } from 'react';

function VideoAudioProcessor({ onFinish }) {
  const videoRef = useRef();
  const transcriptRef = useRef('');
  const transcriptParagraphRef = useRef();
  const [liveTranscript, setLiveTranscript] = useState('');
  const [listeningDots, setListeningDots] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const dotIntervalRef = useRef(null);
  const recognitionRef = useRef(null);
  const finalTranscriptBuffer = useRef('');
  const updateTimeoutRef = useRef(null);
  const hasFinished = useRef(false);
  const hasInitialized = useRef(false);
  const timeoutRef = useRef(null);
  const processingTimeoutRef = useRef(null);

  // Helper functions
  const getFinalTranscript = () => {
    return finalTranscriptBuffer.current.trim() || transcriptRef.current || "No speech detected.";
  };

  const getMockMetrics = () => {
    return { voice: { score: 3.5 }, face: { score: 4.2 } };
  };

  const stopStreamTracks = (stream) => {
    if (stream?.getTracks) {
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const cleanupTimeouts = () => {
    [timeoutRef, processingTimeoutRef, dotIntervalRef, updateTimeoutRef].forEach(ref => {
      if (ref.current) {
        clearTimeout(ref.current);
        clearInterval(ref.current);
        ref.current = null;
      }
    });
  };

  // Auto-scroll transcript to bottom
  const scrollToBottom = () => {
    if (transcriptParagraphRef.current) {
      transcriptParagraphRef.current.scrollTop = transcriptParagraphRef.current.scrollHeight;
    }
  };

  // Scroll to bottom whenever transcript updates
  useEffect(() => {
    scrollToBottom();
  }, [liveTranscript]);

  useEffect(() => {
    // Prevent multiple initializations
    if (hasInitialized.current) {
      return;
    }
    hasInitialized.current = true;

    // Listening dot animation
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
        
        // Check if video element still exists before setting srcObject
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.muted = true;
          videoRef.current.play();
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
          alert("Speech Recognition API not supported in this browser.");
          return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        recognition.maxAlternatives = 1;

        recognition.onresult = (event) => {
          if (hasFinished.current) return;
          
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

          const fullTranscript = finalTranscript + interimTranscript;
          transcriptRef.current = fullTranscript;
          
          // Debounce state updates
          if (updateTimeoutRef.current) {
            clearTimeout(updateTimeoutRef.current);
          }
          updateTimeoutRef.current = setTimeout(() => {
            setLiveTranscript(fullTranscript);
          }, 100);
        };

        recognition.onerror = (e) => {
          console.error("Speech recognition error:", e);
          if (hasFinished.current) {
            recognition.stop();
          }
        };

        recognition.onend = () => {
          if (isProcessing && !hasFinished.current) {
            hasFinished.current = true;
            setTimeout(() => {
              onFinish(getMockMetrics(), getFinalTranscript());
            }, 200);
          }
        };

        recognitionRef.current = recognition;
        recognition.start();

        // Set timeout for session end
        timeoutRef.current = setTimeout(() => {
          if (hasFinished.current) return;
          
          hasFinished.current = true;
          setIsProcessing(true);
          
          if (recognitionRef.current) {
            recognitionRef.current.stop();
          }
          
          stopStreamTracks(stream);
          
          // Fallback timeout
          processingTimeoutRef.current = setTimeout(() => {
            onFinish(getMockMetrics(), getFinalTranscript());
          }, 3000);
        }, 10000);
      } catch (error) {
        console.error("Error starting capture:", error);
        onFinish(getMockMetrics(), getFinalTranscript());
      }
    }

    startCapture();

    // Cleanup function
    return () => {
      hasFinished.current = true;
      cleanupTimeouts();
      
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  if (isProcessing) {
    return (
      <div className="processing-screen">
        <div className="processing-content">
          <h3>Processing Your Interview</h3>
          <p>Analyzing your response with AI-powered STAR method evaluation...</p>
          <div className="processing-spinner">
            <div className="spinner"></div>
          </div>
        </div>
      </div>
    );
  }

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
        <p ref={transcriptParagraphRef}>{liveTranscript || `Listening ${listeningDots}`}</p>
      </div>
    </div>
  );
}

export default VideoAudioProcessor;
