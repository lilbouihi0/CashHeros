// Simple test slider to debug the issue
import React, { useState } from 'react';

const TestSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const slides = [
    { id: 1, title: 'Slide 1', color: '#ff6b6b' },
    { id: 2, title: 'Slide 2', color: '#4ecdc4' },
    { id: 3, title: 'Slide 3', color: '#45b7d1' }
  ];

  const nextSlide = () => {
    console.log('Next slide clicked, current:', currentIndex);
    setCurrentIndex(prev => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    console.log('Previous slide clicked, current:', currentIndex);
    setCurrentIndex(prev => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const goToSlide = (index) => {
    console.log('Going to slide:', index);
    setCurrentIndex(index);
  };

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '400px',
      overflow: 'hidden',
      borderRadius: '10px',
      margin: '20px 0'
    }}>
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: slide.color,
            opacity: index === currentIndex ? 1 : 0,
            transition: 'opacity 0.5s ease-in-out',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            color: 'white',
            fontWeight: 'bold'
          }}
        >
          {slide.title}
        </div>
      ))}

      {/* Navigation Buttons */}
      <button
        onClick={prevSlide}
        style={{
          position: 'absolute',
          left: '20px',
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'rgba(255,255,255,0.8)',
          border: 'none',
          borderRadius: '50%',
          width: '50px',
          height: '50px',
          cursor: 'pointer',
          fontSize: '20px',
          zIndex: 10
        }}
      >
        ←
      </button>

      <button
        onClick={nextSlide}
        style={{
          position: 'absolute',
          right: '20px',
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'rgba(255,255,255,0.8)',
          border: 'none',
          borderRadius: '50%',
          width: '50px',
          height: '50px',
          cursor: 'pointer',
          fontSize: '20px',
          zIndex: 10
        }}
      >
        →
      </button>

      {/* Indicators */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '10px',
        zIndex: 10
      }}>
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              border: 'none',
              background: index === currentIndex ? 'white' : 'rgba(255,255,255,0.5)',
              cursor: 'pointer'
            }}
          />
        ))}
      </div>

      {/* Debug Info */}
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        background: 'rgba(0,0,0,0.7)',
        color: 'white',
        padding: '5px 10px',
        borderRadius: '5px',
        fontSize: '12px',
        zIndex: 10
      }}>
        Current Slide: {currentIndex + 1}/{slides.length}
      </div>
    </div>
  );
};

export default TestSlider;