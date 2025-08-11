# Upcyclr

**Give new life to old things with AI-powered ideas.**

Upcyclr is a web application designed to inspire creative reuse and promote sustainability. By leveraging modern AI and client-side technologies, it helps users find innovative ways to upcycle everyday items, turning waste into valuable and beautiful objects.

## Table of Contents
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Getting Started](#getting-started)
- [Deployment](#deployment)
- [Credits](#credits)

## Features
- **Input Flexibility:** Users can provide an object by capturing a photo with their webcam, uploading an image file, or simply typing its name.
- **AI-Powered Identification:** The frontend uses client-side machine learning with TensorFlow.js to intelligently identify objects from images in real-time.
- **AI-Powered Idea Generation:** A Node.js backend connects to the Gemini AI API to generate dynamic and creative upcycling ideas for any identified object.
- **Human-in-the-Loop Refinement:** Users can correct AI misidentifications, demonstrating a practical approach to refining AI systems.
- **User Contributions:** Users can contribute their own unique upcycling ideas, which are saved locally, fostering a sense of community.
- **User-Friendly UI:** The application features a clean, intuitive, and responsive design for a seamless user experience across all devices.
- **Dynamic Content:** Ideas are presented with titles, descriptions, steps, and external links for easy implementation.

## Technologies Used

**Frontend:**
- **React:** A JavaScript library for building user interfaces.
- **HTML5 Media Devices:** For accessing the user's webcam.
- **React Router:** For multi-page routing within the application.
- **CSS:** For styling and responsive design.

**Backend (AI API Gateway):**
- **Node.js & Express.js:** To create a lightweight, robust API server.
- **`@google/generative-ai`:** The official library for connecting to the Gemini AI API.
- **`dotenv`:** For securely managing the AI API key.
- **`cors`:** To enable communication between the frontend and backend.

**Machine Learning:**
- **TensorFlow.js:** For client-side object identification from images.
- **`@tensorflow-models/coco-ssd`:** A pre-trained model for real-time object detection.

**Tools & Deployment:**
- **Git & GitHub:** For version control and code hosting.
- **Vercel:** For seamless, serverless deployment of both the frontend and backend.

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine.

### Prerequisites
- [Node.js](https://nodejs.org/en/) (v18 or higher)
- `npm` (comes with Node.js)

### 1. Clone the Repository
```bash
git clone [https://github.com/swagatamukherjee04/Upcyclr-App.git](https://github.com/swagatamukherjee04/Upcyclr-App.git)
cd Upcyclr-App






