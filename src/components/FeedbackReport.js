import React from 'react';

function FeedbackReport({ report }) {
  // Debug logging to see what data we're receiving
  console.log('FeedbackReport received report:', report);
  console.log('STAR analysis data:', report.star_analysis || report.starAnalysis);

  const getTagClass = (score) => {
    if (score >= 4) return "score-tag score-green";
    if (score >= 3) return "score-tag score-yellow";
    return "score-tag score-red";
  };

  const renderSTARSection = () => {
    // Check if STAR analysis exists in the report
    const starData = report.star_analysis || report.starAnalysis;
    
    console.log('STAR data being processed:', starData);
    
    if (!starData) {
      console.log('No STAR data found in report');
      return null;
    }

    const starComponents = [
      { key: 'situation', title: 'Situation', color: '#3BA676' },
      { key: 'task', title: 'Task', color: '#FACC15' },
      { key: 'action', title: 'Action', color: '#EF4444' },
      { key: 'result', title: 'Result', color: '#8B5CF6' }
    ];

    return (
      <div className="star-analysis-section">
        <h3>STAR Method Analysis</h3>
        <div className="star-grid">
          {starComponents.map(({ key, title, color }) => {
            const componentData = starData[key];
            console.log(`STAR component ${key}:`, componentData);
            
            return (
              <div key={key} className="star-component">
                <h4 style={{ color }}>{title}</h4>
                <div className="star-content">
                  {componentData && componentData.length > 0 ? (
                    <ul>
                      {componentData.map((sentence, index) => (
                        <li key={index}>{sentence}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="no-content">No {title.toLowerCase()} identified</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
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

      {renderSTARSection()}

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
