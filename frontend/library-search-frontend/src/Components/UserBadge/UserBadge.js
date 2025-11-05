import React from 'react';
import './UserBadge.css';

function UserBadge({ user, onLogout }) {
  return (
    <div className="user-badge">
      <div className="user-info">
        <div className={`role-indicator ${user.role}`}>
          {user.role === 'admin' ? '👑' : '👤'}
        </div>
        <div className="user-details">
          <span className="username">{user.username}</span>
          <span className="role-text">{user.role.toUpperCase()}</span>
        </div>
      </div>
      <button className="logout-btn" onClick={onLogout} title="Logout">
        Logout
      </button>
    </div>
  );
}

export default UserBadge;