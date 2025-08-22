/**
 * Clean Feedback Report - Production Ready
 * Displays voice analysis data cleanly without excessive debug
 */

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ScoreEvaluator } from '../../utils/interviewUtils';
import { STAR_COMPONENTS, UI_TEXT } from '../../constants/interviewConstants';
import './FeedbackReport.css';

import Speedometer from './Speedometer';

import CountUp from 'react-countup';

function getPercentScore(value, {
  min = 0,
  max = 300,
  idealMin = 120,
  idealMax = 200,
  idealCenter = null
} = {}) {
  if (value <= min || value >= max) return 0;

  const center = idealCenter ?? (idealMin + idealMax) / 2;

  if (value < idealMin) {
    return Math.max(0, ((value - min) / (center - min)) * 100);
  } else if (value <= idealMax) {
    const distance = Math.abs(value - center);
    const maxDistance = Math.max(center - idealMin, idealMax - center);
    return 100 - (distance / maxDistance) * 100;
  } else {
    return Math.max(0, ((max - value) / (max - center)) * 100);
  }
}



const FeedbackReport = React.memo(({ report }) => {
  const { isAuthenticated } = useAuth();
  console.log('📝 FeedbackReport received:', report);
  
  // Extract voice data from report
  const getVoiceData = () => {
    const voiceMetrics = report?.voiceAnalysis 
    if (voiceMetrics) {
      return{
        averageVolume: voiceMetrics.averageVolume || 0,
        volumeVariation: voiceMetrics.volumeVariation || 0,
        pitchVariation: voiceMetrics.pitchVariation || 0,
        speechRate: voiceMetrics.speechRate || 0,
        clarity: voiceMetrics.clarity || 0,
        totalSamples: voiceMetrics.totalSamples || 0,
        hasData: true
      }
    } else {
      return {
        averageVolume: [],
        volumeVariation: [],
        pitchVariation: [],
        speechRate: [],
        clarity: [],
        totalSamples: [],
        hasData: false
      };
    }
  };

  // Extract eye tracking data
  const getEyeData = () => {
    return {
      eyeContactPercentage: report?.eyeContactPercentage ?? 0,
      smilePercentage: report?.smilePercentage ?? 0,
      sessionDuration: report?.sessionDuration ?? '00:00'
    };
  };

  // Extract hand tracking data
  const getHandData = () => {
    const handMetrics = report?.handMetrics || [];
    
    // Safely get hand data with fallbacks
    const hand0 = handMetrics[0] || {};
    const hand1 = handMetrics[1] || {};
    
    const speed0 = hand0.averageSpeed || 0;
    const speed1 = hand1.averageSpeed || 0;
    const erratic0 = hand0.averageErraticness || 0;
    const erratic1 = hand1.averageErraticness || 0;
    const visible0 = hand0.totalVisibleTime || 0;
    const visible1 = hand1.totalVisibleTime || 0;
    
    return {
      handMetrics: handMetrics,
      averageSpeedBothHands: handMetrics.length >= 2 ? (speed0 + speed1) / 2 : (speed0 || 0),
      averageErraticnessBothHands: handMetrics.length >= 2 ? (erratic0 + erratic1) / 2 : (erratic0 || 0),
      averageHandsVisibleTime: handMetrics.length >= 2 ? (visible0 + visible1) / 2 : (visible0 || 0),
      hasData: handMetrics.length > 0
    };
  };

  const voiceData = getVoiceData();
  const eyeData = getEyeData();
  const handData = getHandData();
  
  // Check if we have meaningful data
  const hasVoiceData = voiceData.averageVolume > 0 || voiceData.totalSamples > 0;
  const hasEyeData = eyeData.eyeContactPercentage > 0 || eyeData.smilePercentage > 0 || eyeData.sessionDuration !== '00:00';

  console.log('🎙️ Voice data:', voiceData, 'Has data:', hasVoiceData);
  console.log('👁️ Eye data:', eyeData, 'Has data:', hasEyeData);
  console.log('🤲 Hand data:', handData, 'Has data:', handData.hasData);

  const renderProgressSavedIndicator = () => {
    if (!isAuthenticated) return null;
    
    return (
      <div className="progress-saved-indicator">
        <i className="fas fa-check-circle icon-sm icon-success"></i>
        <span>Your progress has been saved to your profile</span>
      </div>
    );
  };


  const MetricCard = ({ icon, label, value, color = '#374151' }) => (
    <div className="metric-card">
      <div className="metric-card__icon">
        <i className={icon}></i>
      </div>
      <div className="metric-card__content">
        <div className="metric-card__value" style={{ color }}>
          {value}
        </div>
        <div className="metric-card__label">{label}</div>
      </div>
    </div>
  );

  const SuccessBanner = ({ text, detail }) => (
    <div className="success-banner">
      <i className="fas fa-check-circle" style={{ marginRight: '8px' }}></i>
      <strong>{text}</strong>
      <div style={{ marginTop: '4px', fontSize: '12px' }}>{detail}</div>
    </div>
  );

  const WarningBanner = ({ text, detail }) => (
    <div className="warning-banner">
      <i className="fas fa-exclamation-triangle" style={{ marginRight: '8px' }}></i>
      <strong>{text}</strong>
      <div style={{ marginTop: '4px', fontSize: '12px', whiteSpace: 'pre-line' }}>{detail}</div>
    </div>
  );

    // Shared section wrapper for uniform styling
  const SectionWrapper = ({ title, iconClass, children, className }) => (
    <section className={`feedback-section ${className || ''}`.trim()} style = {{marginTop: '24px'}}>
      <h3 className="feedback-section__title" style={{ paddingBottom: '0px'}}>
        <i className={`${iconClass} icon-sm icon-primary`}></i>
        {title}
      </h3>
      <div style={{ marginBottom: '24px' }}> 
        {children}
      </div>
    </section>
  );

  
  const DummyBar = ({ label, value }) => {
    const [width, setWidth] = React.useState(0);

    React.useEffect(() => {
      const timeout = setTimeout(() => setWidth(value), 50);
      return () => clearTimeout(timeout);
    }, [value]);

    return (
      <div className="score-bar">
        <span className="score-bar__label">{label}</span>
        <div className="score-bar__track" style={{ position: 'relative' }}>
          <div
            style={{
              width: `${width}%`,
              height: '100%',
              backgroundColor: '#10b981',
              borderRadius: '9999px',
              transition: 'width 2s ease-in-out',
            }}
          />
        </div>
        <span className="score-bar__value">{value}%</span>
      </div>
    );
  };

  const renderComprehensiveScoreSection = () => {

    let starData = report?.star_analysis || report?.starAnalysis;

    const starComponents = ['situation', 'task', 'action', 'result'];
    const presentCount = starComponents.reduce((count, key) => {
      return count + (Array.isArray(starData[key]) && starData[key].length > 0 ? 1 : 0);
    }, 0);

    //content score
    const bonus = (presentCount / 4) * 25;
    const baseScore = typeof starData.score === 'number' ? starData.score : 0;
    const contentScore = Math.round(baseScore + bonus);

    //pitch score
    const pitchScore = Math.round((voiceData.pitchVariation + voiceData.clarity)/2);
    
    //nonverbal score
    const handVisibilityComponent = Math.round((handData.averageHandsVisibleTime / (parseInt(eyeData.sessionDuration.split(':')[0]) * 60 + parseInt(eyeData.sessionDuration.split(':')[1]))) * 100);
    const averageSpeedComponent = Math.round(getPercentScore(handData.averageSpeedBothHands), {
      min: 0,
      max: 300,
      idealMin: 120,
      idealMax: 200,
      idealCenter: 160
    })
    const erraticnessComponent = Math.round((getPercentScore(handData.averageErraticnessBothHands,{
      min: 0,
      max: 10,
      idealMin: 0,
      idealMax: 6,
      idealCenter: 3
    })))

    const smileComponent = Math.round((getPercentScore(eyeData.smilePercentage, {
      min: 0,
      max: 100,
      idealMin: 20,
      idealMax: 60,
      idealCenter: 40
    })
    ))

    const nonverbalScore = Math.round((handVisibilityComponent + averageSpeedComponent + erraticnessComponent + eyeData.eyeContactPercentage + smileComponent) / 5);
    console.log('Nonverbal score:', nonverbalScore);

    const scores = [
      { label: 'Content', value: contentScore },
      { label: 'Pitch', value: pitchScore },
      { label: 'Nonverbal', value: nonverbalScore || 0 }
    ];

    const overallScore = scores.reduce((sum, score) => sum + score.value, 0) / scores.length;

    return (
      <div style={{ marginTop: '40px' }}>
        <SectionWrapper
          title="Comprehensive Performance Score"
          iconClass="fas fa-chart-line"
          className="comprehensive-score"
        >
          <div className="score-section__content">
            <div className="score-bars">
              {scores.map((s, idx) => (
                <DummyBar key={idx} label={s.label} value={s.value} />
              ))}
            </div>

            <div className="score-overall">
              <div className="score-overall__box">
                <span className="score-overall__label">Overall Score</span>
                <CountUp
                  start={0}
                  end={overallScore}
                  duration={2}
                  suffix="%"
                  className="score-overall__value"
                />
              </div>
            </div>
          </div>
        </SectionWrapper>
      </div>
    );
  };


  const renderScoreSection = () => (
    <div className="feedback-report__scores">
      <div className={`score score--${ScoreEvaluator.getScoreVariant(report.content_score)}`}>
        <i className="fas fa-file-text icon-sm icon-primary"></i>
        Content Score: {report.content_score}
      </div>
      <div className={`score score--${ScoreEvaluator.getScoreVariant(report.voice_score)}`}>
        <i className="fas fa-microphone icon-sm icon-primary"></i>
        Voice Score: {report.voice_score}
      </div>
      <div className={`score score--${ScoreEvaluator.getScoreVariant(report.face_score)}`}>
        <i className="fas fa-video icon-sm icon-primary"></i>
        Face Score: {report.face_score}
      </div>
    </div>
  );

    
  const renderStarSection = () => {
    let starData = report?.star_analysis || report?.starAnalysis;
    let transcript = report?.transcript_debug;

    if (!starData || !transcript) {
      // console.log("returning null");
      // return null;
      transcript = 'No transcript data available.';
    }

    // Build a regex-highlighted version of the transcript using STAR segments
    const highlightText = (text, highlights) => {
      let markedText = text;
      highlights.forEach((highlight, idx) => {
        if (!highlight || highlight.trim().length === 0) return;

        const escaped = highlight.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&');
        const regex = new RegExp(`(${escaped})`, 'gi');
        const color = ['#facc15', '#34d399', '#60a5fa', '#f87171'][idx]; // yellow, green, blue, red
        markedText = markedText.replace(
          regex,
          `<mark style="background:${color};padding:2px;border-radius:4px;">$1</mark>`
        );
      });
      return markedText;
    };

    const highlights = [
      ...(starData?.situation || []),
      ...(starData?.task || []),
      ...(starData?.action || []),
      ...(starData?.result || []),
    ];

    // Feedback for missing components
    const feedback = [];
    if (!starData.situation || starData.situation.length === 0) {
      feedback.push('Focus on making the <strong>Situation</strong> clearer.');
    }
    if (!starData.task || starData.task.length === 0) {
      feedback.push('Clearly define the <strong>Task</strong> you were responsible for.');
    }
    if (!starData.action || starData.action.length === 0) {
      feedback.push('Describe the <strong>Action</strong> you specifically took.');
    }
    if (!starData.result || starData.result.length === 0) {
      feedback.push('Make the <strong>Result</strong> or outcome of your actions clearer.');
    }

    const colorKey = [
      { label: 'Situation', color: '#facc15' },
      { label: 'Task', color: '#34d399' },
      { label: 'Action', color: '#60a5fa' },
      { label: 'Result', color: '#f87171' },
    ];

    return (
      <SectionWrapper title={UI_TEXT.STAR_ANALYSIS_TITLE} iconClass="fas fa-star" className="star-analysis">
        <div className="star-analysis">
          {/* <h3 className="star-analysis__title">
            <i className="fas fa-star icon-sm icon-warning"></i>
            {UI_TEXT.STAR_ANALYSIS_TITLE}
          </h3> */}
          <p style={{ fontSize: '14px', color: '#4b5563', marginBottom: '8px' }}>
            Below is your full response. STAR components are <mark>highlighted</mark>:
          </p>

          {/* Color Key */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '8px', flexWrap: 'wrap' }}>
            {colorKey.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span
                  style={{
                    width: '12px',
                    height: '12px',
                    backgroundColor: item.color,
                    borderRadius: '50%',
                    display: 'inline-block',
                    border: '1px solid #999'
                  }}
                />
                <span style={{ fontSize: '13px', color: '#374151' }}>{item.label}</span>
              </div>
            ))}
          </div>

          {/* Highlighted Transcript */}
          <div
            className="star-analysis__highlighted-transcript"
            style={{
              background: '#f9fafb',
              padding: '16px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px',
              whiteSpace: 'pre-wrap',
              lineHeight: '1.6',
            }}
            dangerouslySetInnerHTML={{ __html: highlightText(transcript, highlights) }}
          />

          {/* Feedback Section */}
          {feedback.length > 0 && (
            <div
              style={{
                marginTop: '16px',
                background: '#fff7ed',
                padding: '12px 16px',
                border: '1px solid #fdba74',
                borderRadius: '6px',
                color: '#78350f',
                fontSize: '14px',
              }}
            >
              <strong>Feedback:</strong>
              <ul style={{ paddingLeft: '1.25rem', marginTop: '0.5rem' }}>
                {feedback.map((item, idx) => (
                  <li key={idx} style={{ marginBottom: '4px' }} dangerouslySetInnerHTML={{ __html: item }} />
                ))}
              </ul>
            </div>
          )}
        </div>
      </SectionWrapper>
    );
  };

  const renderEyeTrackingSection = () => (
    <SectionWrapper title="Facial Analysis" iconClass="fas fa-eye" className="eye-tracking">
      {/* {!hasEyeData && (
        <span className="section-warning">(No data captured)</span>
      )} */}

      <div className="metric-grid">
        <MetricCard
          icon="fas fa-eye"
          label="Eye Contact"
          value={`${eyeData.eyeContactPercentage}%`}
        />
        <MetricCard
          icon="fas fa-smile"
          label="Smile Rate"
          value={`${eyeData.smilePercentage}%`}
        />
        <MetricCard
          icon="fas fa-clock"
          label="Session Time"
          value={eyeData.sessionDuration}
        />
      </div>

      {!hasEyeData && (
        <WarningBanner
          text="Eye tracking data was not captured."
          detail={`Please ensure your camera is working and your face is visible.`}
        />
      )}
    </SectionWrapper>
  );

  const renderHandTrackingSection = () => {
    const [minutes, secondsStr] = eyeData.sessionDuration.split(':');
    const totalSeconds = parseInt(minutes) * 60 + parseInt(secondsStr);
    const handsVisiblePercentage = Math.round(handData.averageHandsVisibleTime / totalSeconds * 100);
  
    return (
      <SectionWrapper title="Hand Gesture Analysis" iconClass="fas fa-hand-paper" className="hand-tracking">
        <div className="metric-grid">
          <Speedometer
            label="Average Speed"
            value={Math.round(handsVisiblePercentage)}
            min={0}
            max={300}
            unit=" px/s"
            zones={[
              { min: 0, max: 120, color: '#fcd34d' },     
              { min: 120, max: 200, color: '#34d399' },   
              { min: 200, max: 300, color: '#f87171' },   
            ]}
          />

          <Speedometer
            label="Erraticness"
            value={Math.round(handData.handMetrics[0].averageErraticness + handData.handMetrics[1].averageErraticness) / 2}
            min={0}
            max={10}
            unit=""
            zones={[
              { min: 0, max: 6, color: '#34d399' },
              { min: 5, max: 8, color: '#fcd34d' },
              { min: 8, max: 10, color: '#f87171' },
            ]}
          />

        <Speedometer
          label="Hand Visibility"
          value={handsVisiblePercentage}
          min={0}
          max={100}
          unit="%"
          zones={[
            { min: 0, max: 30, color: '#f87171' },     // too little
            { min: 30, max: 60, color: '#fcd34d' },    // good
            { min: 60, max: 100, color: '#34d399' },   // expressive
          ]}
        />

        </div>
          {!handData.hasData && (
            <WarningBanner 
              text="Hand tracking data was not captured." 
              detail={`Possible causes:\n• Hands not visible in camera frame\n• Camera permissions not granted\n• Hand tracking model failed to load`} 
            />
          )}

      </SectionWrapper>
    );
  };

  const renderVoiceAnalysisSection = () => {

    const getMetricColor = (value, type) => {
      switch (type) {
        case 'volume': return value > 10 ? '#10b981' : value > 3 ? '#f59e0b' : '#000000';
        case 'variation': return value > 15 ? '#10b981' : value > 5 ? '#f59e0b' : '#000000';
        case 'rate': return value > 60 ? '#10b981' : value > 40 ? '#f59e0b' : '#000000';
        case 'clarity': return value > 70 ? '#10b981' : value > 50 ? '#f59e0b' : '#000000';
        default: return '#6b7280';
      }
    };

    return (
      <SectionWrapper title="Voice Analysis" iconClass="fas fa-wave-square" className="voice-analysis">
        {/* {!hasVoiceData && <span className="section-warning">(No data captured)</span>} */}
        <div className="metric-grid">
          <MetricCard icon="fas fa-volume-up" label="Avg Volume" value={`${voiceData.averageVolume}%`} color={getMetricColor(voiceData.averageVolume, 'volume')} />
          <MetricCard icon="fas fa-chart-line" label="Vol Variation" value={`${voiceData.volumeVariation}%`} color={getMetricColor(voiceData.volumeVariation, 'variation')} />
          <MetricCard icon="fas fa-music" label="Tone Variation" value={`${voiceData.pitchVariation}%`} color={getMetricColor(voiceData.pitchVariation, 'variation')} />
          <MetricCard icon="fas fa-tachometer-alt" label="Speech Rate" value={`${voiceData.speechRate}%`} color={getMetricColor(voiceData.speechRate, 'rate')} />
          <MetricCard icon="fas fa-microphone" label="Clarity" value={`${voiceData.clarity}%`} color={getMetricColor(voiceData.clarity, 'clarity')} />
          <MetricCard icon="fas fa-database" label="Samples" value={voiceData.totalSamples} />
        </div>
        {!voiceData.hasData && (
            <WarningBanner 
              text="Voice data was not captured." 
              detail={`Possible causes:\n• Hands not visible in camera frame\n• Camera permissions not granted\n• Hand tracking model failed to load`} 
            />
          )}
      </SectionWrapper>
    );
  };


  const renderTipsSection = () => (
    <SectionWrapper title={UI_TEXT.TIPS_TITLE} iconClass="fas fa-lightbulb" className="tips-section">
      <div className="tips" style={{ marginTop: '0px' }}>
        <ul className="tips__list" style={{ listStyle: 'none', paddingLeft: 0, fontSize: '16px' }}>
          {Object.entries(report?.tips || {}).map(([tipCategory, tipContent]) => (
            <li key={tipCategory} className="tips__item" style={{ marginBottom: '1px' }}>
              <i className="fas fa-check-circle icon-sm icon-success" style={{ marginRight: '8px' }}></i>
              <strong>{tipCategory.charAt(0).toUpperCase() + tipCategory.slice(1)}:</strong> {tipContent}
            </li>
          ))}
        </ul>
      </div>
    </SectionWrapper>
  );


  // const renderTranscriptSection = () => {
  //   if (!report?.transcript_debug) return null;

  //   return (
  //     <div className="transcript">
  //       <h3 className="transcript__header">
  //         <i className="fas fa-file-alt icon-sm icon-primary"></i>
  //         {UI_TEXT.TRANSCRIPT_TITLE_FEEDBACK}
  //       </h3>
  //       <div className="transcript__content">
  //         {report.transcript_debug}
  //       </div>
  //     </div>
  //   );
  // };

  return (
    <div className="feedback-report">
      {renderProgressSavedIndicator()}
      {/* {renderDummyLine()} */}
      {renderComprehensiveScoreSection()}
      {/* {renderScoreSection()} */}
      <div className="feedback-report__content">
        {renderStarSection()}
        {renderEyeTrackingSection()}
        {renderHandTrackingSection()}
        {renderVoiceAnalysisSection()}
        {renderTipsSection()}
        {/* {renderTranscriptSection()} */}
      </div>
    </div>
  );
});
 
FeedbackReport.displayName = 'FeedbackReport';

export default FeedbackReport;