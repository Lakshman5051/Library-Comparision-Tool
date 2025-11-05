import React from 'react';
import './Header.css';

function Header({ children }) {
  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <h1 className="header-title">
            Visualizing and Comparing Software Libraries
          </h1>
          <p className="header-subtitle">
            A Web Application for Comparing and Managing Software Libraries
          </p>
        </div>
        {children && (
          <div className="header-right">
            {children}
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;