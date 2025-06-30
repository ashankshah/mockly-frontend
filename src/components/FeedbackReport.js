/**
 * Feedback Report Component
 * Displays comprehensive interview feedback with STAR analysis
 */

import React from 'react';
import { ScoreEvaluator } from '../utils/interviewUtils';
import { STAR_COMPONENTS, UI_TEXT } from '../constants/interviewConstants';

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
    <div className="feedback-report__scores">
      <div className={`score score--${ScoreEvaluator.getScoreVariant(report.content_score)}`}>
        Content Score: {report.content_score}
      </div>
      <div className={`score score--${ScoreEvaluator.getScoreVariant(report.voice_score)}`}>
        Voice Score: {report.voice_score}
      </div>
      <div className={`score score--${ScoreEvaluator.getScoreVariant(report.face_score)}`}>
        Face Score: {report.face_score}
      </div>
    </div>
  );

  const renderTipsSection = () => (
    <div className="tips">
      <h3 className="tips__title">{UI_TEXT.TIPS_TITLE}</h3>
      <ul className="tips__list">
        {Object.entries(report.tips).map(([tipCategory, tipContent]) => (
          <li key={tipCategory} className="tips__item">
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
      <div key={key} className="star-analysis__line">
        <span className="star-analysis__label" style={{ color }}>
          {title}:
        </span>
        <span className="star-analysis__content">
          {componentData && componentData.length > 0 
            ? componentData.join('. ')
            : `No ${title.toLowerCase()} identified`
          }
        </span>
      </div>
    );
  };

  const renderStarSection = () => {
    if (!StarDataAccessor.hasStarData(report)) {
      return null;
    }

    return (
      <div className="star-analysis">
        <h3 className="star-analysis__title">{UI_TEXT.STAR_ANALYSIS_TITLE}</h3>
        <div className="star-analysis__content-wrapper">
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
      <div className="transcript">
        <h3 className="transcript__header">{UI_TEXT.TRANSCRIPT_TITLE_FEEDBACK}</h3>
        <div className="transcript__content">
          {report.transcript_debug}
        </div>
      </div>
    );
  };

  return (
    <div className="feedback-report">
      {renderScoreSection()}
      <div className="feedback-report__content">
        {renderStarSection()}
        {renderTipsSection()}
        {renderTranscriptSection()}
      </div>
    </div>
  );
}

export default FeedbackReport;
