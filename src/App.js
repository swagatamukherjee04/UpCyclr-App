// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css'; // Keep App.css for global styles

// Import your components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Main from './components/Main';
import UpcyclePage from './components/UpcyclePage';

function App() {
  return (
    <Router>
      {/* --- CRUCIAL FOR FOOTER FIX: This div will directly contain Navbar, Routes, and Footer --- */}
      {/* --- It will handle the main flex layout of your entire application content --- */}
      <div className="app-container">
        <Navbar /> {/* This is the first child, it will be at the top */}

        {/* Routes contains your main content (Main or UpcyclePage, which contain <main class="app-content">) */}
        <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/upcycle" element={<UpcyclePage />} />
        </Routes>

        <Footer /> {/* This is the last child, it will be pushed to the bottom */}
      </div> {/* End of app-container */}
    </Router>
  );
}

export default App;