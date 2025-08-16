/**
 * Selected Question Display Component
 * Reusable component for displaying the current interview question
 * 
 * @author: David Chung
 * @creation-date: 6/22/2025
 */

import React from 'react';
import { getQuestionById } from '../../constants/interviewConstants';

/**
 * Displays the selected interview question with proper styling and accessibility
 * 
 * @param {Object} props - Component props
 * @param {string} props.questionId - The ID of the selected question
 * @param {string} props.variant - Display variant ('preview' | 'interview' | 'minimal')
 * @param {string} props.className - Additional CSS classes
 * @returns {JSX.Element|null} The question display component or null if no question
 */
function SelectedQuestionDisplay({ questionId, variant = 'preview', className = '' }) {
  // Early return if no question is selected
  if (!questionId) {
    return null;
  }

  // Find the question object from the centralized store
  const question = getQuestionById(questionId);
  
  // Return null if question not found
  if (!question) {
    console.warn(`Question with ID "${questionId}" not found`);
    return null;
  }

  // Get appropriate CSS classes based on variant
  const getContainerClasses = () => {
    const baseClass = 'selected-question';
    const variantClass = `selected-question--${variant}`;
    return `${baseClass} ${variantClass} ${className}`.trim();
  };

  // Get appropriate title text based on variant
  const getTitleText = () => {
    switch (variant) {
      case 'interview':
        return 'Current Question:';
      case 'minimal':
        return 'Q:';
      default:
        return 'Your Question:';
    }
  };

  // Render different layouts based on variant
  const renderQuestionContent = () => {
    switch (variant) {
      case 'minimal':
        return (
          <div className="selected-question__minimal-content">
            <span className="selected-question__minimal-title">{getTitleText()}</span>
            <span className="selected-question__minimal-text" style={{whiteSpace: 'normal'}}>{question.text}</span>
          </div>
        );
      
      case 'interview':
        return (
          <>
            <h4 className="selected-question__title">{getTitleText()}</h4>
            <p className="selected-question__text">{question.text}</p>
            <div className="selected-question__category">
              <span className="selected-question__category-label">Category:</span>
              <span className="selected-question__category-value">{question.category}</span>
            </div>
          </>
        );
      
      default: // preview variant
        return (
          <>
            <h4 className="selected-question__title">{getTitleText()}</h4>
            <p className="selected-question__text">{question.text}</p>
          </>
        );
    }
  };

  return (
    <div 
      className={getContainerClasses()}
      role="region"
      aria-label="Selected interview question"
    >
      {renderQuestionContent()}
    </div>
  );
}

export default SelectedQuestionDisplay; 