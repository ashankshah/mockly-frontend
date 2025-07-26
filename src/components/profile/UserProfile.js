import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { BEHAVIORAL_QUESTIONS, getCategoryInfo } from '../../constants/interviewConstants';
import './UserProfile.css';

const UserProfile = ({ onNavigateToInterview, currentView }) => {
  const { user, updateProfile, getAuthHeaders } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    first_name: '',
    last_name: ''
  });
  const [loading, setLoading] = useState(true);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [error, setError] = useState('');
  const [exportLoading, setExportLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedCategories, setExpandedCategories] = useState(new Set());

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  // Get categories from centralized store
  const BEHAVIORAL_CATEGORIES = Object.values(BEHAVIORAL_QUESTIONS).map(category => ({
    ...category,
    questions: category.questions.map(question => ({
      ...question,
      title: question.text, // Map text to title for compatibility
      status: 'not-started', // Default status
      starred: false, // Default starred state
      hasVideo: true // Default video availability
    }))
  }));

  useEffect(() => {
    if (user) {
      fetchProfileData();
      setEditForm({
        first_name: user.first_name || '',
        last_name: user.last_name || ''
      });
    }
  }, [user]);

  // Refresh data when navigating to profile
  useEffect(() => {
    if (currentView === 'profile' && user) {
      fetchProfileData();
    }
  }, [currentView, user]);

  // Add a refresh function that can be called externally
  const refreshProfileData = useCallback(() => {
    if (user) {
      fetchProfileData();
    }
  }, [user]);

  const fetchProfileData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/profile`, {
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProfileData(data);
      } else {
        setError('Failed to load profile data');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Network error while loading profile');
    } finally {
      setLoading(false);
    }
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    setError('');
    if (!isEditing) {
      setEditForm({
        first_name: user.first_name || '',
        last_name: user.last_name || ''
      });
    }
  };

  const handleInputChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value
    });
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);
    setError('');

    const result = await updateProfile(editForm);
    
    if (result.success) {
      setIsEditing(false);
      await fetchProfileData();
    } else {
      setError(result.error);
    }
    
    setUpdateLoading(false);
  };

  const handleExportProgress = async () => {
    setExportLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/users/progress?limit=1000`, {
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        }
      });

      if (response.ok) {
        const progressData = await response.json();
        
        const exportData = {
          exportDate: new Date().toISOString(),
          user: {
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            joinedDate: user.created_at
          },
          stats: stats,
          progressRecords: progressData
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], {
          type: 'application/json'
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mockly-progress-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        setError('Failed to export progress data');
      }
    } catch (error) {
      console.error('Error exporting progress:', error);
      setError('Network error while exporting progress');
    } finally {
      setExportLoading(false);
    }
  };

  const formatScore = (score) => {
    return score ? score.toFixed(1) : 'N/A';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Create a Set of completed question IDs for efficient lookup
  const completedQuestionIds = useMemo(() => {
    if (!profileData?.recent_progress) return new Set();
    return new Set(profileData.recent_progress.map(session => session.question_text).filter(Boolean));
  }, [profileData?.recent_progress]);

  // Create a Set of starred question IDs for efficient lookup
  const starredQuestionIds = useMemo(() => {
    if (!profileData?.starred_questions) return new Set();
    return new Set(profileData.starred_questions.map(star => star.question_id));
  }, [profileData?.starred_questions]);

  // Check if a question has been completed (optimized with Set lookup)
  const isQuestionCompleted = useCallback((questionId) => {
    return completedQuestionIds.has(questionId);
  }, [completedQuestionIds]);

  // Calculate category progress
  const calculateCategoryProgress = (categoryId) => {
    if (!profileData?.recent_progress) return { completed: 0, total: 0, percentage: 0 };
    
    const category = BEHAVIORAL_CATEGORIES.find(cat => cat.id === categoryId);
    if (!category) return { completed: 0, total: 0, percentage: 0 };
    
    const total = category.questions.length;
    const completed = category.questions.filter(question => 
      isQuestionCompleted(question.id)
    ).length;
    const percentage = total > 0 ? (completed / total) * 100 : 0;
    
    return { completed, total, percentage };
  };

  // Calculate overall progress
  const calculateOverallProgress = () => {
    if (!profileData?.recent_progress) return { completed: 0, total: 0, percentage: 0 };
    
    const totalQuestions = BEHAVIORAL_CATEGORIES.reduce((sum, cat) => sum + cat.questions.length, 0);
    const completedQuestions = BEHAVIORAL_CATEGORIES.reduce((sum, cat) => 
      sum + cat.questions.filter(question => isQuestionCompleted(question.id)).length, 0
    );
    const percentage = totalQuestions > 0 ? (completedQuestions / totalQuestions) * 100 : 0;
    
    return { completed: completedQuestions, total: totalQuestions, percentage };
  };

  const overallProgress = calculateOverallProgress();

  // Filter categories based on search
  const filteredCategories = BEHAVIORAL_CATEGORIES.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Toggle category expansion
  const toggleCategory = (categoryId) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  // Handle question click
  const handleQuestionClick = (questionId) => {
    // Navigate to interview with the specific question ID
    onNavigateToInterview(questionId);
  };

  // Handle star click
  const handleStarClick = async (e, questionId) => {
    e.stopPropagation(); // Prevent triggering the question click
    
    try {
      const isCurrentlyStarred = starredQuestionIds.has(questionId);
      
      if (isCurrentlyStarred) {
        // Unstar the question
        const response = await fetch(`${API_BASE_URL}/users/starred-questions/${questionId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders()
          }
        });
        
        if (response.ok) {
          // Refresh profile data to get updated starred questions
          await fetchProfileData();
        } else {
          console.error('Failed to unstar question');
        }
      } else {
        // Star the question
        const response = await fetch(`${API_BASE_URL}/users/starred-questions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders()
          },
          body: JSON.stringify({ question_id: questionId })
        });
        
        if (response.ok) {
          // Refresh profile data to get updated starred questions
          await fetchProfileData();
        } else {
          console.error('Failed to star question');
        }
      }
    } catch (error) {
      console.error('Error toggling star:', error);
    }
  };

  // Check if a question is starred
  const isQuestionStarred = (questionId) => {
    return starredQuestionIds.has(questionId);
  };

  // Get question status
  const getQuestionStatus = (questionId) => {
    if (isQuestionCompleted(questionId)) {
      return 'completed';
    }
    return 'not-started';
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <i className="fas fa-check-circle" style={{ color: '#3BA676' }}></i>;
      case 'in-progress':
        return <i className="fas fa-clock" style={{ color: '#f59e0b' }}></i>;
      case 'not-started':
        return <i className="fas fa-circle" style={{ color: '#94a3b8' }}></i>;
      default:
        return <i className="fas fa-circle" style={{ color: '#94a3b8' }}></i>;
    }
  };

  // Get difficulty color
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy':
        return '#3BA676';
      case 'Medium':
        return '#f59e0b';
      case 'Hard':
        return '#ef4444';
      default:
        return '#94a3b8';
    }
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="loading-spinner">Loading profile...</div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="profile-container">
        <div className="error-message">Failed to load profile data</div>
      </div>
    );
  }

  const { user: userData, stats, recent_progress } = profileData;

  return (
    <div className="profile-container neetcode-style">
      {/* Top Navigation Bar */}
      <div className="top-nav">
        <div className="nav-section">
          <i className="fas fa-book"></i>
          <span>Core Skills</span>
        </div>
        <div className="nav-section active">
          <i className="fas fa-brain"></i>
          <span>Behavioral 75</span>
          <i className="fas fa-chevron-down"></i>
        </div>
        <div className="nav-section">
          <i className="fas fa-cherry-blossom"></i>
          <span>System Design</span>
        </div>
      </div>

      {/* Overall Progress Summary */}
      <div className="progress-summary">
        <div className="progress-header">
          <h1 className="progress-title">
            {overallProgress.completed} / {overallProgress.total}
          </h1>
          <div className="progress-info">
            <i className="fas fa-question-circle"></i>
            <span>The Behavioral 75 is a curated list of essential behavioral interview questions.</span>
          </div>
        </div>
        <div className="progress-bar-container">
          <div 
            className="progress-bar-fill" 
            style={{ width: `${Math.min(overallProgress.percentage, 100)}%` }}
          ></div>
        </div>
      </div>

      {/* Interactive Controls */}
      <div className="controls-section">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <i className="fas fa-search search-icon"></i>
        </div>
        <div className="control-buttons">
          <button className="control-btn grid-btn" title="Grid View">
            <i className="fas fa-th"></i>
          </button>
          <button className="control-btn shuffle-btn" title="Random Practice">
            <i className="fas fa-random"></i>
          </button>
          <button className="control-btn export-btn" onClick={handleExportProgress} disabled={exportLoading}>
            <i className="fas fa-download"></i>
          </button>
          <button className="control-btn help-btn" title="Help">
            <i className="fas fa-question"></i>
          </button>
        </div>
      </div>

      {/* Category List */}
      <div className="categories-section">
        {filteredCategories.map((category) => {
          const progress = calculateCategoryProgress(category.id);
          const isExpanded = expandedCategories.has(category.id);
          
          return (
            <div key={category.id} className="category-container">
              <div className="category-row" onClick={() => toggleCategory(category.id)}>
                <div className="category-info">
                  <div className="category-name">
                    <i className={category.icon}></i>
                    {category.name}
                    <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'} category-expand-icon`}></i>
                  </div>
                  <div className="category-description">{category.description}</div>
                </div>
                <div className="category-progress">
                  <div className="progress-count">
                    ({progress.completed}/{progress.total})
                  </div>
                  <div className="category-progress-bar">
                    <div 
                      className="category-progress-fill"
                      style={{ width: `${Math.min(progress.percentage, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              {/* Questions Table */}
              {isExpanded && (
                <div className="questions-table">
                  <div className="table-header">
                    <div className="header-cell">Status</div>
                    <div className="header-cell">Star</div>
                    <div className="header-cell">Question</div>
                    <div className="header-cell">Difficulty</div>
                    <div className="header-cell">Solution</div>
                  </div>
                  <div className="table-body">
                    {category.questions.map((question) => (
                      <div 
                        key={question.id} 
                        className="question-row"
                        onClick={() => handleQuestionClick(question.id)}
                      >
                        <div className="question-cell status-cell">
                          {getStatusIcon(getQuestionStatus(question.id))}
                        </div>
                        <div className="question-cell star-cell">
                          <i className={`fas fa-star ${isQuestionStarred(question.id) ? 'starred' : 'star-outline'}`} onClick={(e) => handleStarClick(e, question.id)}></i>
                        </div>
                        <div className="question-cell title-cell">
                          {question.title}
                          <i className="fas fa-external-link-alt external-link"></i>
                        </div>
                        <div className="question-cell difficulty-cell">
                          <span style={{ color: getDifficultyColor(question.difficulty) }}>
                            {question.difficulty}
                          </span>
                        </div>
                        <div className="question-cell solution-cell">
                          {question.hasVideo && (
                            <i className="fas fa-video" style={{ color: '#3BA676' }}></i>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Quick Stats */}
      <div className="quick-stats">
        <div className="stat-card">
          <div className="stat-number">{stats?.total_sessions || 0}</div>
          <div className="stat-label">Total Sessions</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{formatScore(stats?.average_overall_score)}</div>
          <div className="stat-label">Average Score</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{formatScore(stats?.best_overall_score)}</div>
          <div className="stat-label">Best Score</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats?.streak_days || 0}</div>
          <div className="stat-label">Day Streak</div>
        </div>
      </div>

      {/* Recent Sessions */}
      {recent_progress && recent_progress.length > 0 && (
        <div className="recent-sessions">
          <h3>Recent Practice Sessions</h3>
          <div className="sessions-list">
            {recent_progress.slice(0, 5).map((session) => (
              <div key={session.id} className="session-item">
                <div className="session-date">{formatDate(session.session_date)}</div>
                <div className="session-type">{session.question_type || 'General'}</div>
                <div className="session-score">Score: {formatScore(session.overall_score)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default UserProfile; 