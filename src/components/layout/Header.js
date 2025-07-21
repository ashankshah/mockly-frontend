/**
 * Header Component
 * Navigation header matching landing page design
 * 
 * @author: David Chung
 * @creation-date: 6/22/2025
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { UI_TEXT } from '../../constants/interviewConstants';

function Header({ 
  currentView, 
  onNavigateToProfile, 
  onNavigateToInterview,
  onShowAuthModal 
}) {
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 50;
      setIsScrolled(scrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const renderNavLinks = () => (
    <ul className="nav-links">
      <li><a href="#about" className="nav-link">About</a></li>
    </ul>
  );

  const renderUserMenu = () => {
    if (!isAuthenticated) {
      return (
        <button 
          onClick={onShowAuthModal}
          className="auth-button"
        >
          Sign In
        </button>
      );
    }

    return (
      <div className="user-menu">
        <button 
          onClick={onNavigateToProfile}
          className="user-profile-button"
          title="View Profile"
        >
          <div className="user-avatar">
            {user?.first_name?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
          </div>
          <span className="user-name">
            {user?.first_name || user?.email?.split('@')[0] || 'User'}
          </span>
        </button>
        <button 
          onClick={handleLogout}
          className="logout-button"
          title="Sign Out"
        >
          <i className="fas fa-sign-out-alt"></i>
        </button>
      </div>
    );
  };

  return (
    <header className={`header ${isScrolled ? 'header--scrolled' : ''}`} role="banner">
      <nav className="nav">
        <button onClick={onNavigateToInterview} className="logo" title="Back to Practice">
          <i className="fas fa-brain"></i>
          Mockly
        </button>
        
        <div className="nav-center">
          {renderNavLinks()}
        </div>
        
        <div className="nav-actions">
          {renderUserMenu()}
        </div>
      </nav>
    </header>
  );
}

export default Header; 