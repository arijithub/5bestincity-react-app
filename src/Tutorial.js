import React, { useState, useEffect } from 'react';

// Centralized tutorial settings
const tutorialSettings = {
  sharedCollection: {
    images: [
      './images/tutorial/ShareCollection-Tutorial-1.png',
      './images/tutorial/ShareCollection-Tutorial-2.png',
    ],
    title: "Shared Collection Tutorial",
  },
  pinnedCollection: {
    images: [
      './images/tutorial/pinned-collection-tutorial-1.png',
      './images/tutorial/ShareCollection-Tutorial-2.png',
    ],
    title: "Pinned Collection Tutorial",
  },
};

const Tutorial = ({ tutorialId, onClose }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [images, setImages] = useState([]);

  useEffect(() => {
    if (tutorialId && tutorialSettings[tutorialId]) {
      setImages(tutorialSettings[tutorialId].images);
    } else {
      onClose();
    }
  }, [tutorialId, onClose]);

  const handleNext = () => {
    if (currentImageIndex < images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    } else {
      onClose();
    }
  };

  if (images.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }}
      onClick={handleNext}
    >
      <img
        src={images[currentImageIndex]}
        alt={`Tutorial step ${currentImageIndex + 1}`}
        style={{
          maxWidth: '100%',
          maxHeight: '100%',
          objectFit: 'contain',
        }}
      />
    </div>
  );
};

export default Tutorial;




/*
import React, { useState } from 'react';

import Tutorial from './Tutorial';

const SharedCollectionPage = () => {
  const [showTutorial, setShowTutorial] = useState(true);
  
  
<MetaData component="ShareCollections" />
	  {showTutorial && (
        <Tutorial
          tutorialId="sharedCollection"
          onClose={() => setShowTutorial(false)}
        />
      )}
*/
