import React from 'react';
import './TermsOfService.css';

function TermsOfService({ onClose }) {
  return (
    <div className="terms-overlay" onClick={onClose}>
      <div className="terms-modal" onClick={(e) => e.stopPropagation()}>
        <button className="terms-close-btn" onClick={onClose}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        <div className="terms-content">
          <h1>Terms of Service</h1>
          <p className="terms-last-updated">Last updated: {new Date().toLocaleDateString()}</p>

          <section>
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing and using IntelliLib ("the Service"), you accept and agree to be bound by 
              the terms and provision of this agreement. If you do not agree to abide by the above, 
              please do not use this service.
            </p>
          </section>

          <section>
            <h2>2. Use License</h2>
            <p>
              Permission is granted to temporarily access and use IntelliLib for personal, 
              non-commercial transitory viewing only. This is the grant of a license, not a transfer 
              of title, and under this license you may not:
            </p>
            <ul>
              <li>Modify or copy the materials</li>
              <li>Use the materials for any commercial purpose or for any public display</li>
              <li>Attempt to reverse engineer any software contained on IntelliLib</li>
              <li>Remove any copyright or other proprietary notations from the materials</li>
            </ul>
          </section>

          <section>
            <h2>3. Disclaimer</h2>
            <p>
              The materials on IntelliLib are provided on an 'as is' basis. IntelliLib makes no 
              warranties, expressed or implied, and hereby disclaims and negates all other warranties 
              including, without limitation, implied warranties or conditions of merchantability, 
              fitness for a particular purpose, or non-infringement of intellectual property or other 
              violation of rights.
            </p>
          </section>

          <section>
            <h2>4. Limitations</h2>
            <p>
              In no event shall IntelliLib or its suppliers be liable for any damages (including, 
              without limitation, damages for loss of data or profit, or due to business interruption) 
              arising out of the use or inability to use the materials on IntelliLib, even if IntelliLib 
              or an authorized representative has been notified orally or in writing of the possibility 
              of such damage.
            </p>
          </section>

          <section>
            <h2>5. Accuracy of Materials</h2>
            <p>
              The materials appearing on IntelliLib could include technical, typographical, or 
              photographic errors. IntelliLib does not warrant that any of the materials on its 
              website are accurate, complete, or current. IntelliLib may make changes to the 
              materials contained on its website at any time without notice.
            </p>
          </section>

          <section>
            <h2>6. Links</h2>
            <p>
              IntelliLib has not reviewed all of the sites linked to its website and is not 
              responsible for the contents of any such linked site. The inclusion of any link does 
              not imply endorsement by IntelliLib of the site. Use of any such linked website is at 
              the user's own risk.
            </p>
          </section>

          <section>
            <h2>7. Modifications</h2>
            <p>
              IntelliLib may revise these terms of service for its website at any time without notice. 
              By using this website you are agreeing to be bound by the then current version of these 
              terms of service.
            </p>
          </section>

          <section>
            <h2>8. Governing Law</h2>
            <p>
              These terms and conditions are governed by and construed in accordance with the laws 
              and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
            </p>
          </section>

          <div className="terms-footer">
            <button className="terms-accept-btn" onClick={onClose}>
              I Understand
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TermsOfService;

