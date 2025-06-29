/**
 * Feedback Report Component
 * Displays comprehensive interview feedback with STAR analysis
 */

import React from 'react';
import { ScoreEvaluator } from '../utils/interviewUtils';
import { STAR_COMPONENTS, CSS_CLASSES, UI_TEXT } from '../constants/interviewConstants';

// STAR data accessor for better data handling
const StarDataAccessor = {
  getStarData(report) {
    return report.star_analysis || report.starAnalysis;
  },

  hasStarData(report) {
    return !!this.getStarData(report);
  },

  hasTranscript(report) {
    return !!report.transcript_debug;
  }
};

function FeedbackReport({ report }) {
  const renderScoreSection = () => (
    <>
      <div className={ScoreEvaluator.getScoreClass(report.content_score)}>
        Content Score: {report.content_score}
      </div>
      <div className={ScoreEvaluator.getScoreClass(report.voice_score)}>
        Voice Score: {report.voice_score}
      </div>
      <div className={ScoreEvaluator.getScoreClass(report.face_score)}>
        Face Score: {report.face_score}
      </div>
    </>
  );

  const renderTipsSection = () => (
    <div className={CSS_CLASSES.TIP_SECTION}>
      <h3>{UI_TEXT.TIPS_TITLE}</h3>
      <ul>
        {Object.entries(report.tips).map(([tipCategory, tipContent]) => (
          <li key={tipCategory}>
            <strong>{tipCategory}:</strong> {tipContent}
          </li>
        ))}
      </ul>
    </div>
  );

  const renderStarComponent = ({ key, title, color }) => {
    const starData = StarDataAccessor.getStarData(report);
    const componentData = starData?.[key];
    
    return (
      <div key={key} className={CSS_CLASSES.STAR_COMPONENT}>
        <h4 style={{ color }}>{title}</h4>
        <div className={CSS_CLASSES.STAR_CONTENT}>
          {componentData && componentData.length > 0 ? (
            <ul>
              {componentData.map((sentence, index) => (
                <li key={index}>{sentence}</li>
              ))}
            </ul>
          ) : (
            <p className={CSS_CLASSES.NO_CONTENT}>No {title.toLowerCase()} identified</p>
          )}
        </div>
      </div>
    );
  };

  const renderStarSection = () => {
    if (!StarDataAccessor.hasStarData(report)) {
      return null;
    }

    return (
      <div className={CSS_CLASSES.STAR_ANALYSIS_SECTION}>
        <h3>{UI_TEXT.STAR_ANALYSIS_TITLE}</h3>
        <div className={CSS_CLASSES.STAR_GRID}>
          {STAR_COMPONENTS.map(renderStarComponent)}
        </div>
      </div>
    );
  };

  const renderTranscriptSection = () => {
    if (!StarDataAccessor.hasTranscript(report)) {
      return null;
    }

    return (
      <div className={CSS_CLASSES.TRANSCRIPT_BOX}>
        <h3>{UI_TEXT.TRANSCRIPT_TITLE_FEEDBACK}</h3>
        <p>{report.transcript_debug}</p>
      </div>
    );
  };

  return (
    <div>
      {renderScoreSection()}
      {renderTipsSection()}
      {renderStarSection()}
      {renderTranscriptSection()}
    </div>
  );
}

export default FeedbackReport;
