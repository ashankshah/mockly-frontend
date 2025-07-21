import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './UserProfile.css';

const UserProfile = ({ onNavigateToInterview }) => {
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

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  useEffect(() => {
    if (user) {
      fetchProfileData();
      setEditForm({
        first_name: user.first_name || '',
        last_name: user.last_name || ''
      });
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
      // Refresh profile data
      await fetchProfileData();
    } else {
      setError(result.error);
    }
    
    setUpdateLoading(false);
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
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-info">
          <div className="profile-avatar">
            {userData.first_name?.[0] || userData.email[0].toUpperCase()}
          </div>
          <div className="profile-details">
            {isEditing ? (
              <form onSubmit={handleSaveProfile} className="edit-form">
                <div className="edit-row">
                  <input
                    type="text"
                    name="first_name"
                    placeholder="First Name"
                    value={editForm.first_name}
                    onChange={handleInputChange}
                    className="edit-input"
                  />
                  <input
                    type="text"
                    name="last_name"
                    placeholder="Last Name"
                    value={editForm.last_name}
                    onChange={handleInputChange}
                    className="edit-input"
                  />
                </div>
                <div className="edit-actions">
                  <button 
                    type="submit" 
                    className="save-btn"
                    disabled={updateLoading}
                  >
                    {updateLoading ? 'Saving...' : 'Save'}
                  </button>
                  <button 
                    type="button" 
                    className="cancel-btn" 
                    onClick={handleEditToggle}
                    disabled={updateLoading}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <>
                <h1 className="profile-name">
                  {userData.first_name && userData.last_name 
                    ? `${userData.first_name} ${userData.last_name}`
                    : userData.email
                  }
                </h1>
                <p className="profile-email">{userData.email}</p>
                <p className="profile-joined">
                  Joined {formatDate(userData.created_at)}
                </p>
              </>
            )}
          </div>
        </div>
        {!isEditing && (
          <button className="edit-btn" onClick={handleEditToggle}>
            Edit Profile
          </button>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Statistics Section */}
      <div className="stats-section">
        <h2>Your Progress</h2>
        <div className="stats-grid">
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

        {stats && (
          <div className="detailed-stats">
            <h3>Score Breakdown</h3>
            <div className="score-breakdown">
              <div className="score-item">
                <span>Content</span>
                <span>{formatScore(stats.average_content_score)}</span>
              </div>
              <div className="score-item">
                <span>Voice</span>
                <span>{formatScore(stats.average_voice_score)}</span>
              </div>
              <div className="score-item">
                <span>Presentation</span>
                <span>{formatScore(stats.average_face_score)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recent Progress Section */}
      <div className="progress-section">
        <div className="section-header">
          <h2>Recent Sessions</h2>
          <button 
            className="start-practice-btn start-practice-btn--header"
            onClick={onNavigateToInterview}
          >
            <i className="fas fa-plus icon-sm"></i>
            New Practice Session
          </button>
        </div>
        {recent_progress && recent_progress.length > 0 ? (
          <div className="progress-list">
            {recent_progress.map((session) => (
              <div key={session.id} className="progress-item">
                <div className="progress-header">
                  <div className="progress-date">
                    {formatDate(session.session_date)}
                  </div>
                  <div className="progress-type">
                    {session.question_type || 'General'}
                  </div>
                </div>
                <div className="progress-scores">
                  <div className="score-badge content">
                    Content: {formatScore(session.content_score)}
                  </div>
                  <div className="score-badge voice">
                    Voice: {formatScore(session.voice_score)}
                  </div>
                  <div className="score-badge face">
                    Presentation: {formatScore(session.face_score)}
                  </div>
                  {session.overall_score && (
                    <div className="score-badge overall">
                      Overall: {formatScore(session.overall_score)}
                    </div>
                  )}
                </div>
                {session.question_text && (
                  <div className="progress-question">
                    <strong>Question:</strong> {session.question_text}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="no-progress">
            <p>No practice sessions yet. Start practicing to see your progress!</p>
            <button 
              className="start-practice-btn"
              onClick={onNavigateToInterview}
            >
              <i className="fas fa-play icon-sm"></i>
              Start Practice Session
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile; 