// src/components/Navbar.js
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom'; // Import Link, useLocation, useNavigate
import '../App.css';

function Navbar() {
  const location = useLocation();   // Hook to get current URL path
  const navigate = useNavigate();   // Hook for redirection

  // This function will handle all Navbar link clicks
  const handleNavLinkClick = (e, sectionId) => {
    e.preventDefault(); // Prevent default anchor behavior

    if (location.pathname === '/') {
      // If we are already on the main page, just scroll to the section
      const section = document.getElementById(sectionId);
      if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      // If we are on a different page (e.g., /upcycle),
      // navigate to the main page first, then scroll.
      // Using setTimeout here is a common trick to ensure navigation completes before scrolling.
      // For complex apps, use useEffect with location change. For this, setTimeout is fine.
      navigate('/');
      setTimeout(() => {
        const section = document.getElementById(sectionId);
        if (section) {
          section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100); // Small delay to allow page transition
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        {/* Home/Brand link: Uses the same conditional logic */}
        <a href="#home" onClick={(e) => handleNavLinkClick(e, 'home')}>Upcyclr</a>
      </div>
      <ul className="navbar-nav">
        <li className="nav-item">
          <a href="#home" onClick={(e) => handleNavLinkClick(e, 'home')} className="nav-link">Home</a>
        </li>
        <li className="nav-item">
          <a href="#features-section" onClick={(e) => handleNavLinkClick(e, 'features-section')} className="nav-link">Features</a>
        </li>
        <li className="nav-item">
          <a href="#about-section" onClick={(e) => handleNavLinkClick(e, 'about-section')} className="nav-link">About</a>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;