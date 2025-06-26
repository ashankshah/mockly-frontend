import React from 'react';

function FeedbackReport({ report }) {
  return (
    <div>

      <p><strong>Content Score:</strong> {report.content_score}</p>
      <p><strong>Voice Score:</strong> {report.voice_score}</p>
      <p><strong>Face Score:</strong> {report.face_score}</p>

      <h3>Tips</h3>
      <ul>
        {Object.entries(report.tips).map(([key, tip]) => (
          <li key={key}><strong>{key}:</strong> {tip}</li>
        ))}
      </ul>

      {report.transcript_debug && (
        <>
          <h3>Transcript</h3>
          <p style={{ whiteSpace: 'pre-wrap' }}>{report.transcript_debug}</p>
        </>
      )}
    </div>
  );
}

export default FeedbackReport;
