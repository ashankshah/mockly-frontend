/**
 * SelectedQuestionDisplay Component Tests
 * Tests for the reusable question display component
 * 
 * @author: David Chung
 * @creation-date: 6/22/2025
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import SelectedQuestionDisplay from '../SelectedQuestionDisplay';
import { INTERVIEW_QUESTIONS } from '../../constants/interviewConstants';

// Mock the constants to avoid circular dependencies in tests
jest.mock('../../constants/interviewConstants', () => ({
  INTERVIEW_QUESTIONS: [
    {
      id: 'leadership',
      text: 'Tell me about a time when you had to lead a team through a difficult situation.',
      category: 'Leadership'
    },
    {
      id: 'conflict',
      text: 'Describe a situation where you had to resolve a conflict with a colleague.',
      category: 'Conflict Resolution'
    }
  ]
}));

describe('SelectedQuestionDisplay', () => {
  const mockQuestion = INTERVIEW_QUESTIONS[0];

  describe('Rendering', () => {
    test('renders nothing when no questionId is provided', () => {
      const { container } = render(<SelectedQuestionDisplay />);
      expect(container.firstChild).toBeNull();
    });

    test('renders nothing when questionId is empty string', () => {
      const { container } = render(<SelectedQuestionDisplay questionId="" />);
      expect(container.firstChild).toBeNull();
    });

    test('renders nothing when questionId is not found', () => {
      const { container } = render(<SelectedQuestionDisplay questionId="nonexistent" />);
      expect(container.firstChild).toBeNull();
    });

    test('renders question with preview variant by default', () => {
      render(<SelectedQuestionDisplay questionId={mockQuestion.id} />);
      
      expect(screen.getByText('Your Question:')).toBeInTheDocument();
      expect(screen.getByText(mockQuestion.text)).toBeInTheDocument();
    });

    test('renders question with interview variant', () => {
      render(<SelectedQuestionDisplay questionId={mockQuestion.id} variant="interview" />);
      
      expect(screen.getByText('Current Question:')).toBeInTheDocument();
      expect(screen.getByText(mockQuestion.text)).toBeInTheDocument();
      expect(screen.getByText('Category:')).toBeInTheDocument();
      expect(screen.getByText(mockQuestion.category)).toBeInTheDocument();
    });

    test('renders question with minimal variant', () => {
      render(<SelectedQuestionDisplay questionId={mockQuestion.id} variant="minimal" />);
      
      expect(screen.getByText('Q:')).toBeInTheDocument();
      expect(screen.getByText(mockQuestion.text)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('has proper ARIA attributes', () => {
      render(<SelectedQuestionDisplay questionId={mockQuestion.id} />);
      
      const questionElement = screen.getByRole('region');
      expect(questionElement).toHaveAttribute('aria-label', 'Selected interview question');
    });

    test('has proper semantic structure', () => {
      render(<SelectedQuestionDisplay questionId={mockQuestion.id} variant="interview" />);
      
      expect(screen.getByRole('heading', { level: 4 })).toBeInTheDocument();
      expect(screen.getByText(mockQuestion.text)).toBeInTheDocument();
    });
  });

  describe('CSS Classes', () => {
    test('applies base class and variant class', () => {
      const { container } = render(
        <SelectedQuestionDisplay questionId={mockQuestion.id} variant="interview" />
      );
      
      const questionElement = container.firstChild;
      expect(questionElement).toHaveClass('selected-question');
      expect(questionElement).toHaveClass('selected-question--interview');
    });

    test('applies additional className prop', () => {
      const { container } = render(
        <SelectedQuestionDisplay 
          questionId={mockQuestion.id} 
          className="custom-class" 
        />
      );
      
      const questionElement = container.firstChild;
      expect(questionElement).toHaveClass('selected-question');
      expect(questionElement).toHaveClass('custom-class');
    });
  });

  describe('Error Handling', () => {
    const originalConsoleWarn = console.warn;
    
    beforeEach(() => {
      console.warn = jest.fn();
    });
    
    afterEach(() => {
      console.warn = originalConsoleWarn;
    });

    test('logs warning when question not found', () => {
      render(<SelectedQuestionDisplay questionId="nonexistent" />);
      
      expect(console.warn).toHaveBeenCalledWith(
        'Question with ID "nonexistent" not found'
      );
    });
  });
}); 