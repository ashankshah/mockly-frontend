/**
 * Browser Test Component
 * Simple test to debug speech recognition browser support
 */

import React, { useState, useEffect } from 'react';

const BrowserTest = () => {
  const [browserInfo, setBrowserInfo] = useState({});

  useEffect(() => {
    // Test different ways of checking for speech recognition
    const tests = {
      // Method 1: Direct property access
      directSpeechRecognition: !!window.SpeechRecognition,
      directWebkitSpeechRecognition: !!window.webkitSpeechRecognition,
      
      // Method 2: Using 'in' operator
      inSpeechRecognition: 'SpeechRecognition' in window,
      inWebkitSpeechRecognition: 'webkitSpeechRecognition' in window,
      
      // Method 3: Try-catch approach
      tryCatchSpeechRecognition: (() => {
        try {
          return !!window.SpeechRecognition;
        } catch {
          return false;
        }
      })(),
      tryCatchWebkitSpeechRecognition: (() => {
        try {
          return !!window.webkitSpeechRecognition;
        } catch {
          return false;
        }
      })(),
      
      // Method 4: typeof check
      typeofSpeechRecognition: typeof window.SpeechRecognition !== 'undefined',
      typeofWebkitSpeechRecognition: typeof window.webkitSpeechRecognition !== 'undefined',
      
      // Browser info
      userAgent: navigator.userAgent,
      vendor: navigator.vendor,
      platform: navigator.platform
    };

    setBrowserInfo(tests);
    console.log('🔍 Browser Support Tests:', tests);
  }, []);

  const testSpeechRecognition = () => {
    try {
      // Test the exact same logic as the hook
      const hasSpeechRecognition = 'SpeechRecognition' in window;
      const hasWebkitSpeechRecognition = 'webkitSpeechRecognition' in window;
      const isSupported = hasSpeechRecognition || hasWebkitSpeechRecognition;
      
      console.log('🎯 Hook Logic Test:', {
        hasSpeechRecognition,
        hasWebkitSpeechRecognition,
        isSupported
      });
      
      if (isSupported) {
        console.log('✅ Speech recognition should work!');
        
        // Try to create an instance
        let SpeechRecognition;
        if (hasSpeechRecognition) {
          SpeechRecognition = window.SpeechRecognition;
        } else if (hasWebkitSpeechRecognition) {
          SpeechRecognition = window.webkitSpeechRecognition;
        }
        
        const recognition = new SpeechRecognition();
        console.log('✅ Successfully created SpeechRecognition instance:', recognition);
        
        // Test basic configuration
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        
        console.log('✅ Successfully configured SpeechRecognition');
        return 'SUCCESS: Speech recognition should work!';
      } else {
        console.log('❌ Speech recognition not supported');
        return 'FAILED: Speech recognition not supported';
      }
    } catch (error) {
      console.error('❌ Error testing speech recognition:', error);
      return `ERROR: ${error.message}`;
    }
  };

  return (
    <div style={{ 
      padding: '20px', 
      maxWidth: '800px', 
      margin: '20px auto',
      border: '2px solid #007bff',
      borderRadius: '10px',
      backgroundColor: '#f8f9fa'
    }}>
      <h2 style={{ color: '#007bff', marginBottom: '20px' }}>
        🔍 Browser Support Debug Test
      </h2>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={testSpeechRecognition}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Test Speech Recognition
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Browser Information:</h3>
        <pre style={{ 
          backgroundColor: 'white', 
          padding: '15px', 
          border: '1px solid #dee2e6', 
          borderRadius: '5px',
          overflow: 'auto',
          fontSize: '12px'
        }}>
          {JSON.stringify(browserInfo, null, 2)}
        </pre>
      </div>

      <div style={{ fontSize: '14px', color: '#6c757d' }}>
        <p><strong>Instructions:</strong></p>
        <ol>
          <li>Click "Test Speech Recognition" to run the same logic as the hook</li>
          <li>Check the console for detailed logs</li>
          <li>Look for any errors or unexpected results</li>
          <li>Compare the results with what you see in the main app</li>
        </ol>
        
        <p style={{ marginTop: '15px', padding: '10px', backgroundColor: '#fff3cd', borderRadius: '5px' }}>
          <strong>💡 Note:</strong> This test uses the exact same logic as the useSpeechRecognition hook. If this works but the main app doesn't, there's a different issue.
        </p>
      </div>
    </div>
  );
};

export default BrowserTest; 