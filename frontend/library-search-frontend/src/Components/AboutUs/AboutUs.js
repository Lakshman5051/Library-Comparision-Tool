import React from 'react';
import './AboutUs.css';

function AboutUs({ onBack }) {
  return (
    <div className="about-us-page">
      <div className="about-us-container">
        {onBack && (
          <button className="back-to-home-btn" onClick={onBack}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Back to Home
          </button>
        )}

        <div className="about-us-content">
          <h1 className="about-us-title">About IntelliLib</h1>
          
          <section className="about-section">
            <h2>What is IntelliLib?</h2>
            <p>
              IntelliLib is an intelligent library discovery and comparison platform designed to help 
              software engineers, product teams, and developers make informed decisions when selecting 
              libraries and components for their projects. We provide comprehensive data-driven insights, 
              real-time comparisons, and quality assessments to streamline your technology stack selection process.
            </p>
          </section>

          <section className="about-section">
            <h2>Our Mission</h2>
            <p>
              Our mission is to eliminate the guesswork in library selection by providing transparent, 
              data-driven insights that help developers choose the right tools for their specific needs. 
              We believe that informed decisions lead to better software, faster development cycles, 
              and more maintainable codebases.
            </p>
          </section>

          <section className="about-section">
            <h2>Who We Serve</h2>
            <div className="target-customers">
              <div className="customer-card">
                <h3>Software Engineers</h3>
                <p>
                  Individual developers and engineering teams who need to quickly evaluate and compare 
                  libraries across different platforms (npm, PyPI, Maven, NuGet) before integrating 
                  them into their projects.
                </p>
              </div>
              
              <div className="customer-card">
                <h3>Product Teams</h3>
                <p>
                  Product managers and technical leads who need to make strategic decisions about 
                  technology stacks, ensuring they choose libraries that are well-maintained, secure, 
                  and have strong community support.
                </p>
              </div>
              
              <div className="customer-card">
                <h3>Startups & Enterprises</h3>
                <p>
                  Organizations of all sizes looking to build scalable applications with confidence, 
                  knowing they're using battle-tested libraries with proven track records and active 
                  maintenance.
                </p>
              </div>
            </div>
          </section>

          <section className="about-section">
            <h2>Key Features</h2>
            <ul className="features-list">
              <li>
                <strong>Comprehensive Library Database:</strong> Access to 2,000+ libraries across 
                multiple platforms and categories
              </li>
              <li>
                <strong>Real-time Comparison:</strong> Side-by-side comparison of up to 3 libraries 
                with key metrics and quality grades
              </li>
              <li>
                <strong>Quality Assessment:</strong> Automated grading system (A+ to F) based on 
                GitHub stars, downloads, maintenance activity, and security
              </li>
              <li>
                <strong>Advanced Filtering:</strong> Filter by language, platform, category, and 
                sort by popularity, downloads, or last updated
              </li>
              <li>
                <strong>Data-Driven Insights:</strong> Make informed decisions based on actual 
                usage metrics and community health indicators
              </li>
            </ul>
          </section>

          <section className="about-section">
            <h2>How We Help</h2>
            <p>
              IntelliLib saves you time and reduces risk by providing a centralized platform where 
              you can discover, evaluate, and compare libraries before making integration decisions. 
              Instead of spending hours researching across multiple sources, you get all the information 
              you need in one place, with clear visualizations and quality indicators.
            </p>
          </section>

          <section className="about-section">
            <h2>Contact Us</h2>
            <p>
              Have questions or feedback? We'd love to hear from you! Reach out to us at{' '}
              <a href="mailto:developers.intellib@gmail.com">developers.intellib@gmail.com</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

export default AboutUs;

