/**
 * Header Component
 * Navigation header matching landing page design
 * 
 * @author: David Chung
 * @creation-date: 6/22/2025
 */

import React, { useState, useEffect } from 'react';
import { UI_TEXT } from '../constants/interviewConstants';

function Header() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 50;
      setIsScrolled(scrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const renderNavLinks = () => (
    <ul className="nav-links">
      <li><a href="#practice" className="nav-link">Practice</a></li>
      <li><a href="#feedback" className="nav-link">Feedback</a></li>
      <li><a href="#about" className="nav-link">About</a></li>
    </ul>
  );

  return (
    <header className={`header ${isScrolled ? 'header--scrolled' : ''}`} role="banner">
      <nav className="nav">
        <a href="#" className="logo">
          <i className="fas fa-brain"></i>
          Mockly
        </a>
        
        <div className="nav-center">
          {renderNavLinks()}
        </div>
        
        <div className="nav-actions">
          <button className="nav-control-button" aria-label="Settings">
            <i className="fas fa-cog"></i>
          </button>
          <button className="nav-control-button" aria-label="Audio Settings">
            <i className="fas fa-microphone"></i>
          </button>
        </div>
      </nav>
    </header>
  );
}

export default Header; 