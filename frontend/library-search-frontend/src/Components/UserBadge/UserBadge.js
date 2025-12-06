import React from 'react';
import './UserBadge.css';

function UserBadge({ user, onLogout, onAccountSettings }) {
  return (
    <div className="user-badge">
      <div className="user-info">
        <div className={`role-indicator ${user.role}`}>
          {user.role === 'admin' ? '👑' : '👤'}
        </div>
        <div className="user-details">
          <span className="username">
            {user.firstName && user.lastName 
              ? `${user.firstName} ${user.lastName}` 
              : user.username || user.email}
          </span>
          <span className="role-text">{user.role.toUpperCase()}</span>
        </div>
      </div>
      <div className="user-actions">
        {onAccountSettings && (
          <button className="settings-btn" onClick={onAccountSettings} title="Account Settings">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </button>
        )}
        <button className="logout-btn" onClick={onLogout} title="Logout">
          Logout
        </button>
      </div>
    </div>
  );
}

export default UserBadge;