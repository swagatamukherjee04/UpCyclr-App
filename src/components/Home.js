// src/components/Home.js
import React from 'react';
import '../App.css'


const popularUpcycleItems = [
  { id: 1, name: "Plant pots", imageUrl: "https://i.pinimg.com/1200x/17/cc/8c/17cc8cfd4dbb622dc7ae32456e8e44b7.jpg" }, // This image is specifically of "Plant pots"
  { id: 2, name: "Aerosols", imageUrl: "https://i.pinimg.com/1200x/01/f5/2c/01f52c33642a8d29ce249d513cdf4903.jpg" },
  { id: 3, name: "Plastic pots, tubs and trays", imageUrl: "https://i.pinimg.com/1200x/8c/f6/5f/8cf65fa42dee266f5f1feaf8569a7774.jpg" },
  { id: 4, name: "Glass bottles and jars", imageUrl: "https://i.pinimg.com/736x/2e/85/cc/2e85cc7ee90b0151f55c3a7333b4d7dd.jpg" },
  { id: 5, name: "Cardboard", imageUrl: "https://i.pinimg.com/736x/03/f8/00/03f800484048a5893135ff95ee5fc751.jpg" },
  { id: 6, name: "Plastic", imageUrl: "https://i.pinimg.com/1200x/6e/97/b4/6e97b442c26192429d881df203e96dda.jpg" },
  { id: 7, name: "Old Clothes", imageUrl: "https://i.pinimg.com/736x/5d/e4/56/5de456df383e4b65e24029f5fb79d6d1.jpg" },
  { id: 8, name: "Batteries", imageUrl: "https://i.pinimg.com/736x/60/78/ab/6078ab80fa212be3537508a9aebacf30.jpg" },
];


// Home component now accepts a specific redirection handler
function Home({ handleStartUpcyclingNow }) { // Accept the prop
  return (
    <div className="home-container">
      <section className="hero-section text-center">
        <h2>Welcome to Upcyclr!</h2>
        <p className="tagline">Find out how to correctly dispose of your household items or give them a second life.</p>
        <p>Ready to transform your clutter into creativity?</p>
        {/* Call the passed-down handler for redirection */}
        <a
          href="/upcycle" // For accessibility and default browser behavior
          className="btn btn-primary btn-large"
          onClick={(e) => {
            e.preventDefault(); // Prevent default anchor link behavior
            handleStartUpcyclingNow(); // Call the redirection function
          }}
        >
          Start Upcycling Now!
        </a>
      </section>

      <section className="popular-items-panel">
        {/* Heading text from image, with the green underline styling */}
        <h3 className="popular-items-heading">Popular items</h3>
        <div className="popular-items-carousel"> {/* This is the horizontal scrollable container */}
          {popularUpcycleItems.map(item => (
            <div className="popular-item-card" key={item.id}>
              {/* Image URL points to placeholder or the actual uploaded image if specified */}
              <img src={item.imageUrl} alt={item.name} className="popular-item-image" />
              <p className="popular-item-name">{item.name}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Home;