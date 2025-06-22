// src/Components/HomePage/Slider/Slider.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import styles from './Slider.module.css';
import { sliderImage1, sliderImage2, sliderImage3 } from '../../../assets/images/homeImages';
import { SearchBar } from '../SearchBar/SearchBar';

const slides = [
  { 
    src: sliderImage1, 
    caption: 'SAVE BIG ON WINTER DEALS!',
    subCaption: 'Exclusive offers from top brands',
    buttonText: 'Shop Now',
    buttonLink: '/deals/winter',
    showSearchBar: true,
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    accentColor: '#667eea'
  },
  { 
    src: sliderImage2, 
    caption: 'Up to 50% Off Electronics',
    subCaption: 'Limited time offers on the latest gadgets',
    buttonText: 'View Deals',
    buttonLink: '/category/electronics',
    showSearchBar: true,
    gradient: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
    accentColor: '#28a745'
  },
  { 
    src: sliderImage3, 
    caption: 'Exclusive Cash Back Offers',
    subCaption: 'Earn while you shop at your favorite stores',
    buttonText: 'Get Cash Back',
    buttonLink: '/cashback',
    showSearchBar: true,
    gradient: 'linear-gradient(135deg, #ffc107 0%, #ff8c00 100%)',
    accentColor: '#ffc107'
  },
];

export const Slider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const autoPlayRef = useRef(null);
  const transitionTimeoutRef = useRef(null);
  const sliderRef = useRef(null);

  // Function to go to the next slide
  const nextSlide = useCallback(() => {
    if (!isTransitioning) {
      setIsTransitioning(true);
      setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
      
      // Reset transition state after animation completes
      transitionTimeoutRef.current = setTimeout(() => {
        setIsTransitioning(false);
      }, 1000); // Match this with the CSS transition time (1s)
    }
  }, [isTransitioning, currentIndex]);

  // Function to go to the previous slide
  const prevSlide = useCallback(() => {
    if (!isTransitioning) {
      setIsTransitioning(true);
      setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
      
      // Reset transition state after animation completes
      transitionTimeoutRef.current = setTimeout(() => {
        setIsTransitioning(false);
      }, 1000); // Match this with the CSS transition time (1s)
    }
  }, [isTransitioning, currentIndex]);

  // Auto-play functionality - temporarily disabled for debugging
  useEffect(() => {
    const play = () => {
      if (!isPaused) {
        autoPlayRef.current = setTimeout(nextSlide, 4000); // Auto-play every 4 seconds
      }
    };
    
    // Enable auto-play for testing
    play();
    
    return () => {
      clearTimeout(autoPlayRef.current);
      clearTimeout(transitionTimeoutRef.current);
    };
  }, [nextSlide, isPaused]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        prevSlide();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        nextSlide();
      } else if (event.key === ' ') {
        event.preventDefault();
        setIsPaused(prev => !prev);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide]);

  // Initialize component
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Handle touch events for swipe functionality
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };
  
  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };
  
  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 100) {
      // Swipe left, go to next slide
      nextSlide();
    }
    
    if (touchStart - touchEnd < -100) {
      // Swipe right, go to previous slide
      prevSlide();
    }
  };

  // Indicator dots for navigation
  const goToSlide = (index) => {
    if (!isTransitioning && index !== currentIndex) {
      setIsTransitioning(true);
      setCurrentIndex(index);
      
      transitionTimeoutRef.current = setTimeout(() => {
        setIsTransitioning(false);
      }, 1000); // Match this with the CSS transition time (1s)
    }
  };

  // Pause auto-play on hover
  const handleMouseEnter = () => {
    setIsPaused(true);
    clearTimeout(autoPlayRef.current);
  };
  
  const handleMouseLeave = () => {
    setIsPaused(false);
  };

  // Toggle play/pause
  const togglePlayPause = () => {
    setIsPaused(prev => !prev);
  };

  return (
    <div 
      ref={sliderRef}
      className={`${styles.slider} ${isLoaded ? styles.loaded : ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      role="region"
      aria-label="Featured deals carousel"
    >
      {/* Background gradient that changes with slides */}
      <div 
        className={styles.backgroundGradient}
        style={{ background: slides[currentIndex].gradient }}
      />
      
      <div className={styles.slideContainer}>
        {slides.map((slide, index) => (
          <div 
            key={index} 
            className={`${styles.slide} ${index === currentIndex ? styles.active : ''}`}
            aria-hidden={index !== currentIndex}
            style={{ '--accent-color': slide.accentColor }}
          >
            <div className={styles.slideBackground}>
              <img src={slide.src} alt="" className={styles.image} aria-hidden="true" />
              <div className={styles.overlay}></div>
            </div>
            <div className={styles.content}>
              <div className={styles.contentInner}>
                <h2 className={styles.caption}>
                  <span className={styles.captionText}>{slide.caption}</span>
                  <div className={styles.captionUnderline}></div>
                </h2>
                <p className={styles.subCaption}>{slide.subCaption}</p>
                {slide.showSearchBar ? (
                  <div className={styles.searchBarWrapper}>
                    <SearchBar />
                  </div>
                ) : (
                  <a href={slide.buttonLink} className={styles.button}>
                    <span>{slide.buttonText}</span>
                    <svg className={styles.buttonIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Navigation Controls */}
      <div className={styles.navigationControls}>
        <button 
          className={`${styles.navButton} ${styles.leftButton}`} 
          onClick={prevSlide}
          aria-label="Previous slide"
          disabled={isTransitioning}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        
        <button 
          className={`${styles.navButton} ${styles.rightButton}`} 
          onClick={nextSlide}
          aria-label="Next slide"
          disabled={isTransitioning}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>

      {/* Play/Pause Control */}
      <button 
        className={styles.playPauseButton}
        onClick={togglePlayPause}
        aria-label={isPaused ? 'Play slideshow' : 'Pause slideshow'}
        title={isPaused ? 'Play slideshow' : 'Pause slideshow'}
      >
        {isPaused ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="4" width="4" height="16"></rect>
            <rect x="14" y="4" width="4" height="16"></rect>
          </svg>
        )}
      </button>
      
      {/* Enhanced Indicators */}
      <div className={styles.indicators}>
        {slides.map((slide, index) => (
          <button
            key={index}
            className={`${styles.indicator} ${index === currentIndex ? styles.active : ''}`}
            onClick={() => goToSlide(index)}
            aria-label={`Go to slide ${index + 1}: ${slide.caption}`}
            aria-current={index === currentIndex}
            style={{ '--accent-color': slide.accentColor }}
          >
            <span className={styles.indicatorProgress}></span>
          </button>
        ))}
      </div>

      {/* Progress Bar */}
      <div className={styles.progressBar}>
        <div 
          className={styles.progressFill}
          style={{ 
            width: `${((currentIndex + 1) / slides.length) * 100}%`,
            backgroundColor: slides[currentIndex].accentColor
          }}
        ></div>
      </div>
      


      {/* Screen Reader Announcements */}
      <div className={styles.visuallyHidden} aria-live="polite" aria-atomic="true">
        Slide {currentIndex + 1} of {slides.length}: {slides[currentIndex].caption}
      </div>
      
      {/* Keyboard Instructions */}
      <div className={styles.visuallyHidden}>
        Use arrow keys to navigate slides, spacebar to pause/play
      </div>
    </div>
  );
};