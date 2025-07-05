/**
 * Header Component
 * Persistent top banner with branding and global controls
 * 
 * @author: David Chung
 * @creation-date: 6/22/2025
 */

import React, { useState } from 'react';
import { UI_TEXT } from '../constants/interviewConstants';

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const renderMobileMenu = () => (
    <div className={`header__menu ${isMenuOpen ? 'header__menu--open' : ''}`}>
      <button 
        className="header__menu-button"
        onClick={toggleMenu}
        aria-expanded={isMenuOpen}
        aria-label="Toggle menu"
      >
        <span className="header__menu-icon"></span>
      </button>
      <div className="header__menu-content">
        {renderControls()}
      </div>
    </div>
  );

  const renderControls = () => (
    <div className="header__controls">
      <button 
        className="header__control-button"
        aria-label="Toggle audio"
      >
        <span className="header__control-icon header__control-icon--audio"></span>
      </button>
      <button 
        className="header__control-button"
        aria-label="Open settings"
      >
        <span className="header__control-icon header__control-icon--settings"></span>
      </button>
    </div>
  );

  return (
    <header className="header" role="banner">
      <div className="header__container">
        {/* Left section for mobile menu on small screens */}
        <div className="header__left">
          <div className="header__mobile-controls">
            {renderMobileMenu()}
          </div>
        </div>

        {/* Center section for branding */}
        <div className="header__center">
          <div className="header__branding">
            <h1 className="header__title">{UI_TEXT.APP_TITLE}</h1>
            <span className="header__subtitle">AI Interview Practice</span>
          </div>
        </div>

        {/* Right section for controls */}
        <div className="header__right">
          <div className="header__desktop-controls">
            {renderControls()}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header; 