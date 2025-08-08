// src/components/MainPage.js
import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for redirection
import '../App.css'; // Import App.css for styling

import Home from './Home';
import About from './About';
import Features from './Features';

function MainPage() {
  // Refs for scrolling within this Main Page
  const homeRef = useRef(null);
  const featuresRef = useRef(null);
  const aboutRef = useRef(null);

  // useNavigate hook for programmatic navigation
  const navigate = useNavigate();

  // Function to scroll to a specific section on *this* page
  const scrollToSection = (ref) => {
    if (ref.current) {
      ref.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  // Function for the "Start Upcycling Now!" button on Home page
  const handleStartUpcyclingNow = () => {
    navigate('/upcycle'); // Redirect to the /upcycle route
  };

  return (
    <main className="app-content"> {/* Use app-content wrapper */}
      <div id="home" ref={homeRef}>
        {/* Pass the new redirection handler to the Home component */}
        <Home handleStartUpcyclingNow={handleStartUpcyclingNow} />
      </div>

      <div id="features-section" ref={featuresRef}>
        <Features />
      </div>

      <div id="about-section" ref={aboutRef}>
        <About />
      </div>
    </main>
  );
}

export default MainPage;