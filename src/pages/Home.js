// src/pages/Home.js
import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Home.css';
import MinimalNavbar from '../components/MinimalNavbar';

const HomePage = () => {
  return (
    <>
      <div className="hero">
        {/* Background Video */}
        <video className="background-video" autoPlay loop muted playsInline>
          <source src="/videos/nutrition-bg.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Overlay to darken the video slightly */}
        <div className="overlay"></div>

        {/* Navbar */}
        <MinimalNavbar />

        {/* Hero Content */}
        <div className="hero-card">
          <h1>Nutrition Trends</h1>
          <p className="tagline">Track your progress, achieve your goals, and connect with nutrition experts.</p>
          <div className="button-container">
            <Link to="/signup" className="button primary-button">Get Started</Link>
          </div>
        </div>
      </div>

      {/* About Section */}
      <section id="about" className="section-container about-section">
        <div className="section-content">
          <h2>About Your Wellness Journey with Nutrition Trends</h2>
          <p>
            Welcome to <b>Nutrition Trends </b>, your personalized platform for achieving your health and wellness goals.
            We've partnered with your dietitian to provide you with a seamless and effective way to manage your nutrition plan,
            track your progress, and stay motivated on your journey.
          </p>
          <p>
            Through our intuitive interface, you can easily log your meals, monitor your dietary intake,
            and visualize your achievements. Your dietitian will use this platform to provide tailored guidance,
            monitor your adherence, and offer personalized insights, ensuring you get the most out of your expert advice.
            Join us to transform your eating habits and embrace a healthier lifestyle!
          </p>
        </div>
      </section>

      {/* New Features Section */}
      <section id="features" className="section-container features-section">
        <div className="section-content">
          <h2>Key Features for Your Success</h2>
          <div className="features-grid">
            {/* Feature Item 1: Personalized Meal Logging */}
            <div className="feature-item">
              <img src="/images/icon-meal-logging.jpg" alt="Meal Logging Icon" className="feature-item-image" />
              <h3>Personalized Meal Logging</h3>
              <p>Effortlessly log your daily meals and snacks. Our simple interface makes tracking your intake quick and accurate, helping you stay accountable to your plan.</p>
            </div>
            {/* Feature Item 2: Progress Tracking & Visuals */}
            <div className="feature-item">
              <img src="/images/icon-progress-tracking.jpg" alt="Progress Tracking Icon" className="feature-item-image" />
              <h3>Progress Tracking & Visuals</h3>
              <p>Monitor your weight, measurements, and other health metrics over time. Visual charts and graphs help you see your progress at a glance and celebrate your milestones.</p>
            </div>
            {/* Feature Item 3: Dietitian Connection */}
            <div className="feature-item">
              <img src="/images/icon-dietitian-connect.jpg" alt="Dietitian Connection Icon" className="feature-item-image" />
              <h3>Dietitian Connection</h3>
              <p>Stay connected with your personal dietitian. Share your logs, receive feedback, and get real-time adjustments to your plan, all within the app.</p>
            </div>
            {/* Feature Item 4: Custom Meal Plans */}
            <div className="feature-item">
              <img src="/images/icon-meal-plan.jpg" alt="Custom Meal Plans Icon" className="feature-item-image" />
              <h3>Custom Meal Plans</h3>
              <p>Access custom meal plans uploaded directly by your dietitian. View recipes, ingredient lists, and preparation instructions designed specifically for your needs.</p>
            </div>
            {/* Feature Item 5: Goal Setting & Reminders */}
            <div className="feature-item">
              <img src="/images/icon-goals.jpg" alt="Goal Setting Icon" className="feature-item-image" />
              <h3>Goal Setting & Reminders</h3>
              <p>Set and track personal nutrition goals. Get helpful reminders and notifications to keep you on track with your meals, hydration, and other healthy habits.</p>
            </div>
            {/* Feature Item 6: Resource Library */}
            <div className="feature-item">
              <img src="/images/icon-resources.jpg" alt="Resource Library Icon" className="feature-item-image" />
              <h3>Resource Library</h3>
              <p>Explore a library of educational resources, articles, and tips curated by your dietitian to empower you with knowledge about healthy eating and lifestyle choices.</p>
            </div>
          </div>
        </div>
      </section>

      {/* NEW: Roadmap Section */}
      <section id="roadmap" className="section-container roadmap-section">
        <div className="section-content">
          <h2>Your Journey to Better Nutrition</h2>
          <p>See how Nutrition Trends guides you every step of the way, in partnership with your dietitian.</p>

          <div className="roadmap-steps">
            <div className="roadmap-step">
              <span className="step-number">1</span>
              <h3>Sign Up & Onboard</h3>
              <p>Quickly create your account and complete a brief profile to help your dietitian understand your needs.</p>
            </div>
            <div className="roadmap-step">
              <span className="step-number">2</span>
              <h3>Connect with Your Expert</h3>
              <p>Easily link up with your dietitian's account to enable seamless communication and plan sharing.</p>
            </div>
            <div className="roadmap-step">
              <span className="step-number">3</span>
              <h3>Receive Personalized Plan</h3>
              <p>Your dietitian will upload your custom meal plans, goals, and recommendations directly to your dashboard.</p>
            </div>
            <div className="roadmap-step">
              <span className="step-number">4</span>
              <h3>Log & Track Daily</h3>
              <p>Use our intuitive tools to log your meals, hydration, and progress. The more you track, the better the insights!</p>
            </div>
            <div className="roadmap-step">
              <span className="step-number">5</span>
              <h3>Get Feedback & Adjustments</h3>
              <p>Your dietitian reviews your progress, provides tailored feedback, and adjusts your plan as needed to optimize your results.</p>
            </div>
            <div className="roadmap-step">
              <span className="step-number">6</span>
              <h3>Achieve Your Goals</h3>
              <p>Stay consistent and leverage expert guidance to reach your health and wellness milestones successfully.</p>
            </div>
          </div> {/* /roadmap-steps */}
        </div> {/* /section-content */}
      </section> {/* /roadmap-section */}

      {/* Contact Section */}
      <section id="contact" className="section-container contact-section">
        <div className="section-content">
          <h2>Connect with Your Dietitian</h2>
          <p>If you have questions about your personalized plan, please reach out directly to your dietitian.</p>
          <p>For technical support or general inquiries about the Nutrition Trends platform, please contact us below:</p>
          <form className="contact-form">
            <div className="form-group">
              <label htmlFor="name">Your Name</label>
              <input type="text" id="name" name="name" required />
            </div>
            <div className="form-group">
              <label htmlFor="email">Your Email</label>
              <input type="email" id="email" name="email" required />
            </div>
            <div className="form-group">
              <label htmlFor="message">Your Message</label>
              <textarea id="message" name="message" rows="5" placeholder="e.g., I'm having trouble logging my breakfast..." required></textarea>
            </div>
            <button type="submit" className="button primary-button">Send Message</button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <p>&copy; {new Date().getFullYear()} Nutrition Trends. All rights reserved.</p>
          <div className="footer-links">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </>
  );
};

export default HomePage;