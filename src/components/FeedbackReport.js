import React from 'react';

function FeedbackReport({ report }) {
  const getTagClass = (score) => {
    if (score >= 4) return "score-tag score-green";
    if (score >= 3) return "score-tag score-yellow";
    return "score-tag score-red";
  };

  return (
    <div>
      <div className={getTagClass(report.content_score)}>
        Content Score: {report.content_score}
      </div>
      <div className={getTagClass(report.voice_score)}>
        Voice Score: {report.voice_score}
      </div>
      <div className={getTagClass(report.face_score)}>
        Face Score: {report.face_score}
      </div>

      <div className="tip-section">
        <h3>Tips</h3>
        <ul>
          {Object.entries(report.tips).map(([key, tip]) => (
            <li key={key}><strong>{key}:</strong> {tip}</li>
          ))}
        </ul>
      </div>

      {report.transcript_debug && (
        <div className="transcript-box">
          <h3>Transcript</h3>
          <p>{report.transcript_debug}</p>
        </div>
      )}
    </div>
  );
}

export default FeedbackReport;
