import React, { useState } from 'react';
import './Signup.css';

function Signup({ onClose, onSubmit }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password) {
      setError('Please fill out all required fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!agree) {
      setError('You must agree to the terms to create an account.');
      return;
    }

    const payload = { firstName, lastName, email, password };

    if (onSubmit) {
      onSubmit(payload);
    } else {
      // Demo behaviour: just notify and close
      alert('Account created (demo). You can now log in.');
    }

    if (onClose) onClose();
  };

  return (
    <div className="signup-overlay" onClick={onClose}>
      <div className="signup-card" onClick={(e) => e.stopPropagation()}>
        <h2>Create an Account</h2>
        <form className="signup-form" onSubmit={handleSubmit} autoComplete="off">
          {/* hidden decoy fields to reduce browser autofill */}
          <input type="text" name="prevent_autofill" style={{ display: 'none' }} />
          <input type="password" name="prevent_autofill_pwd" style={{ display: 'none' }} />
          {error && <div className="signup-error">{error}</div>}

          <div className="name-row">
            <div className="form-group">
              <label>First Name</label>
              <input name="given-name" autoComplete="given-name" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First name" />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input name="family-name" autoComplete="family-name" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last name" />
            </div>
          </div>

          <div className="form-group">
            <label>Email</label>
            <input name="email" autoComplete="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input name="new-password" autoComplete="new-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Create a password" />
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input name="confirm-password" autoComplete="new-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm password" />
          </div>

          <label className="terms">
            <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
            <span>I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a></span>
          </label>

          <div className="actions">
            <button type="submit" className="btn-primary">Create account</button>
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          </div>

          <div className="alt-action">
            <span>Already have an account?</span>
            <button type="button" className="link-btn" onClick={onClose}>Log in</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Signup;
