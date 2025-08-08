// src/components/UpcyclePage.js
import React, { useState, useEffect, useRef } from 'react';
import Webcam from 'react-webcam';
import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import '../App.css';

function UpcyclePage() {
  // --- State Declarations ---
  const [objectNameInput, setObjectNameInput] = useState('');
  const [uploadedImageFile, setUploadedImageFile] = useState(null);
  const [uploadedImagePreviewUrl, setUploadedImagePreviewUrl] = useState(null);
  const [webcamImagePreviewUrl, setWebcamImagePreviewUrl] = useState(null);
  const [showWebcam, setShowWebcam] = useState(false);

  const [identifiedObject, setIdentifiedObject] = useState('');
  const [identifiedConfidence, setIdentifiedConfidence] = useState(0);
  const [showCorrection, setShowCorrection] = useState(false);
  const [correctionText, setCorrectionText] = useState('');
  const [acceptedFeedback, setAcceptedFeedback] = useState(false);

  const [displayIdeas, setDisplayIdeas] = useState([]);
  const [userIdeaInput, setUserIdeaInput] = useState('');
  const [userContributedIdeas, setUserContributedIdeas] = useState(() => {
    // Load user ideas from localStorage on initial render
    const storedIdeas = localStorage.getItem('userUpcycleIdeas');
    return storedIdeas ? JSON.parse(storedIdeas) : [];
  });
  const [submittedIdea, setSubmittedIdea] = useState(false);

  // --- AI Model and Loading State ---
  const [model, setModel] = useState(null);
  const [loadingModel, setLoadingModel] = useState(true);
  const [processingImage, setProcessingImage] = useState(false);

  // --- Refs for Webcam and Image elements ---
  const webcamRef = useRef(null);
  const imageElementRef = useRef(null);

  // --- useEffect to load AI model when component mounts ---
  useEffect(() => {
    const loadModel = async () => {
      setLoadingModel(true);
      try {
        const loadedModel = await cocoSsd.load();
        setModel(loadedModel);
        setLoadingModel(false);
        console.log("AI model loaded successfully!");
      } catch (error) {
        console.error("Failed to load AI model:", error);
        setLoadingModel(false);
        setIdentifiedObject("Error loading AI model. Please try refreshing.");
      }
    };

    loadModel();
  }, []);


// src/components/UpcyclePage.js
// ... (existing imports, state, useEffect etc.) ...

// --- NEW function to fetch AI-generated ideas ---
const fetchAIIdeas = async (objectName) => {
  // Set processing state for UI feedback
  setProcessingImage(true);
  setIdentifiedObject(objectName);
  setDisplayIdeas([]);
  setAcceptedFeedback(false);

  try {
    const response = await fetch('/api/generate-ideas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ objectName: objectName }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    // The AI generates an array of ideas. We just set it to our state directly.
    setDisplayIdeas(data);
    console.log("AI-generated ideas received:", data);

  } catch (error) {
    console.error("Could not fetch ideas from backend:", error);
    // Show a fallback message if the AI call fails
    setDisplayIdeas([
      {
        title: "Failed to generate ideas.",
        description: "An error occurred while connecting to the AI. Please check your internet connection or try again later.",
        steps: [],
        links: []
      }
    ]);
  } finally {
    setProcessingImage(false);
  }
};

  // --- Update your `runObjectDetection` function to call the new fetchAIIdeas ---
  const runObjectDetection = async (imageSrcOrElement) => {
    if (!model) {
        console.log("AI model not yet loaded.");
        setIdentifiedObject("AI model is still loading. Please wait.");
        return;
    }
    setProcessingImage(true);
    setIdentifiedObject('');
    setDisplayIdeas([]);
    setIdentifiedConfidence(0);
    setShowCorrection(false);

    try {
        let imageToDetect;

        if (typeof imageSrcOrElement === 'string' && imageSrcOrElement.startsWith('data:image')) {
            imageToDetect = new Image();
            imageToDetect.src = imageSrcOrElement;
            await new Promise(resolve => imageToDetect.onload = resolve);
        } else if (imageSrcOrElement instanceof HTMLImageElement || imageSrcOrElement instanceof HTMLVideoElement) {
            imageToDetect = imageSrcOrElement;
        } else {
            console.error("Invalid image source for detection.");
            setIdentifiedObject("Error: Invalid image source.");
            setProcessingImage(false);
            return;
        }

        // --- CRUCIAL FIX: This is the line that was missing ---
        const predictions = await model.detect(imageToDetect);
        console.log("AI Predictions:", predictions);

        if (predictions.length > 0) {
            const relevantPrediction = predictions.find(p => p.score > 0.5);
            const topPrediction = relevantPrediction ? relevantPrediction.class : predictions[0].class;
            
            const confidence = (relevantPrediction ? relevantPrediction.score : predictions[0].score) * 100;

            fetchAIIdeas(topPrediction); // Pass the AI's identified object name to the new fetch function
            setIdentifiedConfidence(confidence);
        } else {
            fetchAIIdeas("unknown object");
            setIdentifiedConfidence(0);
        }

    } catch (error) {
        console.error("Error during AI detection:", error);
        setIdentifiedObject("Error detecting object. Please try another image.");
        setIdentifiedConfidence(0);
        setDisplayIdeas([]);
    } finally {
        // The new fetch function handles setting processingImage to false
    }
  };

  // --- Event Handlers ---

  const handleObjectNameChange = (event) => {
    setObjectNameInput(event.target.value);
    setWebcamImagePreviewUrl(null);
    setUploadedImagePreviewUrl(null);
    setUploadedImageFile(null);
    setShowWebcam(false);
    setIdentifiedObject('');
    setDisplayIdeas([]);
    setIdentifiedConfidence(0);
    setAcceptedFeedback(false);
    setSubmittedIdea(false);
  };

  const handleGetIdeasFromText = () => {
    if (objectNameInput.trim()) {
      const typedObject = objectNameInput.trim();
      // Call the new function to fetch AI-generated ideas
      fetchAIIdeas(typedObject);
      // Reset confidence to 100% since it's user-provided
      setIdentifiedConfidence(100);
      setShowCorrection(false);
      setAcceptedFeedback(false);
    } else {
      setIdentifiedObject('');
      setDisplayIdeas([]);
      setIdentifiedConfidence(0);
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setUploadedImageFile(file);
      setUploadedImagePreviewUrl(imageUrl);
      setWebcamImagePreviewUrl(null); // Clear webcam preview if uploading
      setShowWebcam(false); // Hide webcam modal if open
      setIdentifiedObject('');
      setDisplayIdeas([]);
      setIdentifiedConfidence(0);
      setAcceptedFeedback(false);
      setSubmittedIdea(false);

      const img = new Image();
      img.src = imageUrl;
      img.onload = () => {
        if (imageElementRef.current) {
             imageElementRef.current.src = imageUrl;
             runObjectDetection(imageElementRef.current);
        } else {
            runObjectDetection(img);
        }
      };
      img.onerror = () => {
          console.error("Failed to load uploaded image for detection.");
          setIdentifiedObject("Failed to load image.");
          setProcessingImage(false);
      };

    } else {
      setUploadedImageFile(null);
      setUploadedImagePreviewUrl(null);
      setIdentifiedObject('');
      setDisplayIdeas([]);
      setIdentifiedConfidence(0);
    }
  };

  const handleToggleWebcam = () => {
    setShowWebcam(prev => !prev);
    setWebcamImagePreviewUrl(null);
    setUploadedImagePreviewUrl(null);
    setUploadedImageFile(null);
    setIdentifiedObject('');
    setDisplayIdeas([]);
    setIdentifiedConfidence(0);
    setAcceptedFeedback(false);
    setProcessingImage(false);
    setSubmittedIdea(false);
  };

  const capturePhoto = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setWebcamImagePreviewUrl(imageSrc); // Stores the captured image for display
      setUploadedImagePreviewUrl(null); // Clear uploaded preview if capturing

      setShowWebcam(false); // Hide the live webcam feed after capture
      setAcceptedFeedback(false);
      runObjectDetection(imageSrc);
      setSubmittedIdea(false);
    }
  };

  const handleCorrectionAccept = () => {
    setShowCorrection(false);
    setCorrectionText('');
    setAcceptedFeedback(true);
    console.log(`User confirmed: ${identifiedObject}`);
  };

  const handleCorrectionDecline = () => {
    setShowCorrection(true);
    setCorrectionText('');
    setAcceptedFeedback(false);
  };

  const handleCorrectionTextChange = (event) => {
    setCorrectionText(event.target.value);
  };

  const handleApplyCorrection = () => {
    if (correctionText.trim()) {
      const corrected = correctionText.trim();
      // Call the new function to fetch AI-generated ideas for the corrected object
      fetchAIIdeas(corrected);
      setIdentifiedConfidence(100);
      setShowCorrection(false);
      setCorrectionText('');
      setAcceptedFeedback(false);
    }
  };

  const handleUserIdeaChange = (event) => {
    setUserIdeaInput(event.target.value);
  };

  const handleAddUserIdea = () => {
    if (userIdeaInput.trim()) {
      const newIdea = {
        id: Date.now(),
        text: userIdeaInput.trim(),
        object: identifiedObject || "general"
      };
      const updatedUserIdeas = [...userContributedIdeas, newIdea];
      setUserContributedIdeas(updatedUserIdeas);
      localStorage.setItem('userUpcycleIdeas', JSON.stringify(updatedUserIdeas));
      setUserIdeaInput('');
      setSubmittedIdea(true); // --- CRUCIAL: Set this to true on successful submission ---
    }
  };

  return (
    <div className="upcycle-page-container">
      <section className="input-section">
        <h2>Provide an Object</h2>
        {loadingModel && <p className="text-center">Loading AI model... Please wait. This may take a moment.</p>}
        {processingImage && <p className="text-center">Processing... (This can take a few seconds)</p>}

        <div className="input-options">
          {/* Webcam Capture Button Group */}
          <div className="input-group">
            <button className="btn" onClick={handleToggleWebcam} disabled={loadingModel || processingImage}>
              {showWebcam ? 'Close Camera' : 'Capture from Webcam'}
            </button>
            {/* --- CRITICAL FIX: Webcam preview box JSX for CORRECT rendering --- */}
            {/* This div shows if webcam is active OR a webcam image is captured */}
            {(showWebcam || webcamImagePreviewUrl) ? (
                <div className="webcam-preview-placeholder">
                    {showWebcam ? ( /* If webcam is active, show feed and capture button */
                        <>
                            <Webcam
                                audio={false}
                                ref={webcamRef}
                                screenshotFormat="image/jpeg"
                                width="100%"
                                height="auto"
                                videoConstraints={{ facingMode: "user" }}
                                className="webcam-feed"
                            />
                            <button className="btn btn-small" onClick={capturePhoto} disabled={loadingModel || processingImage}>
                                Capture Photo
                            </button>
                        </>
                    ) : webcamImagePreviewUrl ? ( /* If captured image exists, show it and clear button */
                        <>
                            <img src={webcamImagePreviewUrl} alt="Captured" className="image-preview" />
                            <button className="btn btn-small btn-secondary image-preview-clear" onClick={() => { setWebcamImagePreviewUrl(null); setUploadedImagePreviewUrl(null); setIdentifiedObject(''); setDisplayIdeas([]); setIdentifiedConfidence(0); }}>
                                Clear Image
                            </button>
                        </>
                    ) : null /* If not showing webcam and no captured image, render nothing here */ }
                </div>
            ) : null /* If not showing webcam and no captured image, render nothing here */ }
          </div>

          {/* Image Upload Button Group */}
          <div className="input-group">
            <label htmlFor="image-upload" className="btn btn-upload" disabled={loadingModel || processingImage}>
              Upload Image
            </label>
            <input
              type="file"
              id="image-upload"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleImageUpload}
              disabled={loadingModel || processingImage}
            />
            {/* --- CRITICAL FIX: Upload image preview box JSX for CORRECT rendering --- */}
            {uploadedImagePreviewUrl ? ( /* This div shows ONLY if uploadedImagePreviewUrl exists */
                <div className="image-upload-preview-placeholder">
                    <> {/* Use Fragment to group image and button */}
                        <img src={uploadedImagePreviewUrl} alt="Uploaded Preview" className="image-preview" ref={imageElementRef} />
                        <button className="btn btn-small btn-secondary image-preview-clear" onClick={() => { setWebcamImagePreviewUrl(null); setUploadedImagePreviewUrl(null); setIdentifiedObject(''); setDisplayIdeas([]); setIdentifiedConfidence(0); }}>
                            Clear Image
                        </button>
                    </>
                </div>
            ) : null /* If no uploaded image, render nothing here */ }
          </div>

          {/* Text Input Group */}
          <div className="input-group">
            <input
              type="text"
              placeholder="Or type object name (e.g., 'plastic bottle', 'old jeans')"
              className="text-input"
              value={objectNameInput}
              onChange={handleObjectNameChange}
              disabled={processingImage}
            />
          </div>
        </div> {/* End of input-options div */}

        <div className="get-ideas-button-container">
          <button
            className="btn btn-primary"
            onClick={handleGetIdeasFromText}
            disabled={processingImage || objectNameInput.trim() === ''}
          >
            Get Ideas!
          </button>
        </div>
      </section>

      {/* Webcam Modal Overlay (This should be outside the input-section, as a full-screen overlay) */}
      {showWebcam && (
        <div className="webcam-modal-overlay">
          <div className="webcam-modal-content">
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              width="100%"
              height="auto"
              videoConstraints={{ facingMode: "user" }}
              className="webcam-feed"
            />
            <button className="btn btn-primary webcam-capture-button" onClick={capturePhoto} disabled={processingImage}>
              Capture Photo
            </button>
            <button className="btn btn-secondary webcam-close-button" onClick={handleToggleWebcam} disabled={processingImage}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* --- CONDITIONAL RENDERING FOR RESULTS STARTS HERE --- */}
      {(identifiedObject || processingImage) && (
        <>
          <section className="identified-object-section">
            <h2>Identified Object</h2>
            {processingImage ? (
              <p className="text-center">Identifying object...</p>
            ) : (
              <>
                <p>AI Identification / Your Typed Object:</p>
                <div className="identified-display">
                  <span className="object-name-display">{identifiedObject}</span>
                  {identifiedConfidence > 0 && identifiedConfidence <= 100 && (
                    <p className="ai-confidence-note"> (AI Confidence: {identifiedConfidence.toFixed(2)}%)</p>
                  )}
                </div>
                <div className="correction-section">
                  {acceptedFeedback ? ( /* --- CRUCIAL: Conditionally render feedback message --- */
                    <p className="text-center feedback-message">Thank you for your feedback!</p>
                  ) : (
                    <> {/* Render buttons only if feedback not accepted */}
                        <p>Is this correct?</p>
                        <button className="btn btn-small" onClick={handleCorrectionAccept}>Yes, that's right!</button>
                        <button className="btn btn-small btn-secondary" onClick={handleCorrectionDecline}>No, it's something else.</button>

                        {showCorrection && (
                            <div className="correction-input-placeholder">
                                <input
                                    type="text"
                                    placeholder="What is it actually?"
                                    className="text-input"
                                    value={correctionText}
                                    onChange={handleCorrectionTextChange}
                                />
                                <button className="btn btn-primary btn-small" onClick={handleApplyCorrection}>Correct & Get Ideas</button>
                            </div>
                        )}
                    </>
                  )}
              </div>
            </>
          )}
        </section>

          <section className="ideas-section">
            <h2>Upcycling Ideas</h2>
            {processingImage ? (
              <p className="text-center">Generating ideas...</p>
            ) : displayIdeas.length > 0 ? (
              <ul className="ideas-list">
                {displayIdeas.map((idea, index) => (
                  <li key={idea.title + index}>
                    <h3>{idea.title}</h3>
                    <p>{idea.description}</p>

                    {idea.steps && idea.steps.length > 0 && (
                      <>
                        <h4>Steps:</h4>
                        <ol>
                          {idea.steps.map((step, stepIndex) => (
                            <li key={stepIndex}>{step}</li>
                          ))}
                        </ol>
                      </>
                    )}

                    {idea.links && idea.links.length > 0 && (
                      <>
                        <h4>Resources:</h4>
                        <ul className="idea-links">
                          {idea.links.map((link, linkIndex) => (
                            <li key={linkIndex}>
                              <a href={link.url} target="_blank" rel="noopener noreferrer">{link.text}</a>
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-ideas-message text-center">No ideas found yet. Feel free to contribute one!</p>
            )}
          </section>

          <section className="contribute-section">
            <h2>Share Your Own Ideas!</h2>
            {submittedIdea ? ( /* --- CRUCIAL: Conditionally show thank you message --- */
              <p className="thank-you-message">Thank you for contributing to the Upcyclr community!</p>
            ) : (
              <> {/* Render the form only if an idea has not just been submitted */}
                <p>Help grow the Upcyclr community by sharing your creative reuse ideas.</p>
                <div className="idea-form-group"> {/* New container for textarea and button */}
                  <textarea
                    placeholder="Describe your awesome upcycling idea here..."
                    className="idea-textarea"
                    value={userIdeaInput}
                    onChange={handleUserIdeaChange}
                  ></textarea>
                  <button
                    className="btn btn-primary"
                    onClick={handleAddUserIdea}
                    disabled={userIdeaInput.trim() === ''} // --- CRUCIAL: Disable button when textarea is empty ---
                  >
                    Add My Idea
                  </button>
                </div>
              </>
            )}
          </section>
        </>
      )}
    </div>
  );
}

export default UpcyclePage;