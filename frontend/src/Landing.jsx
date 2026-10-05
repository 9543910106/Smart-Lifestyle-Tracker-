import React from "react";
import "./Landing.css";

function Landing({ onGetStarted, onLogin }) {
  return (
    <div className="landing-container">
      <header className="landing-header">
        <div className="landing-logo">Smart Lifestyle Tracker</div>
        <nav className="landing-nav">
          <button onClick={onLogin} className="landing-login-btn">
            Log In
          </button>
          <button onClick={onGetStarted} className="landing-signup-btn">
            Get Started
          </button>
        </nav>
      </header>

      <main className="landing-main">
        <div className="landing-hero">
          <h1 className="hero-title">Track your habits. Improve your life.</h1>
          <p className="hero-subtitle">
            Smart Lifestyle Tracker helps you build good habits, monitor your sleep, 
            and track your daily progress in a clean, professional dashboard.
          </p>
          <div className="hero-actions">
            <button onClick={onGetStarted} className="hero-primary-btn">
              Start Tracking for Free
            </button>
          </div>
        </div>

        <div className="landing-features">
          <div className="feature-card">
            <div className="feature-icon">🌱</div>
            <h3>Custom Habits</h3>
            <p>Add your own habits and track them daily. Build consistency over time.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">😴</div>
            <h3>Sleep Cycle Graph</h3>
            <p>Log your sleep hours and visualize your resting patterns over the month.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Monthly Dashboard</h3>
            <p>View your completion rates and find out which habits you are best at.</p>
          </div>
        </div>
      </main>

      <footer className="landing-footer">
        <p>&copy; {new Date().getFullYear()} Smart Lifestyle Tracker. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default Landing;
