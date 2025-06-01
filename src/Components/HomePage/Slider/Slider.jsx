// src/Components/HomePage/Slider/Slider.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import styles from './Slider.module.css';
import { sliderImage1, sliderImage2, sliderImage3 } from '../../../assets/images/homeImages';

const slides = [
  { 
    src: sliderImage1, 
    caption: 'Save Big on Winter Deals!',
    subCaption: 'Exclusive offers from top brands',
    buttonText: 'Shop Now',
    buttonLink: '/deals/winter'
  },
  { 
    src: sliderImage2, 
    caption: 'Up to 50% Off Electronics',
    subCaption: 'Limited time offers on the latest gadgets',
    buttonText: 'View Deals',
    buttonLink: '/category/electronics'
  },
  { 
    src: sliderImage3, 
    caption: 'Exclusive Cash Back Offers',
    subCaption: 'Earn while you shop at your favorite stores',
    buttonText: 'Get Cash Back',
    buttonLink: '/cashback'
  },
];

export const Slider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const autoPlayRef = useRef(null);
  const transitionTimeoutRef = useRef(null);

  // Function to go to the next slide
  const nextSlide = useCallback(() => {
    if (!isTransitioning) {
      setIsTransitioning(true);
      setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
      
      // Reset transition state after animation completes
      transitionTimeoutRef.current = setTimeout(() => {
        setIsTransitioning(false);
      }, 500); // Match this with the CSS transition time
    }
  }, [isTransitioning]);

  // Function to go to the previous slide
  const prevSlide = useCallback(() => {
    if (!isTransitioning) {
      setIsTransitioning(true);
      setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
      
      // Reset transition state after animation completes
      transitionTimeoutRef.current = setTimeout(() => {
        setIsTransitioning(false);
      }, 500); // Match this with the CSS transition time
    }
  }, [isTransitioning]);

  // Auto-play functionality
  useEffect(() => {
    const play = () => {
      autoPlayRef.current = setTimeout(nextSlide, 6000); // Auto-play every 6 seconds
    };
    
    play();
    
    return () => {
      clearTimeout(autoPlayRef.current);
      clearTimeout(transitionTimeoutRef.current);
    };
  }, [nextSlide]);

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
      }, 500);
    }
  };

  // Pause auto-play on hover
  const handleMouseEnter = () => {
    clearTimeout(autoPlayRef.current);
  };
  
  const handleMouseLeave = () => {
    autoPlayRef.current = setTimeout(nextSlide, 6000);
  };

  return (
    <div 
      className={styles.slider}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <button 
        className={styles.leftButton} 
        onClick={prevSlide}
        aria-label="Previous slide"
        disabled={isTransitioning}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>
      
      <div className={styles.slideContainer}>
        {slides.map((slide, index) => (
          <div 
            key={index} 
            className={`${styles.slide} ${index === currentIndex ? styles.active : ''}`}
            style={{ transform: `translateX(${100 * (index - currentIndex)}%)` }}
            aria-hidden={index !== currentIndex}
          >
            <img src={slide.src} alt={`Slide ${index + 1}`} className={styles.image} />
            <div className={styles.overlay}></div>
            <div className={styles.content}>
              <h2 className={styles.caption}>{slide.caption}</h2>
              <p className={styles.subCaption}>{slide.subCaption}</p>
              <a href={slide.buttonLink} className={styles.button}>
                {slide.buttonText}
              </a>
            </div>
          </div>
        ))}
      </div>
      
      <button 
        className={styles.rightButton} 
        onClick={nextSlide}
        aria-label="Next slide"
        disabled={isTransitioning}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>
      
      <div className={styles.indicators}>
        {slides.map((_, index) => (
          <button
            key={index}
            className={`${styles.indicator} ${index === currentIndex ? styles.active : ''}`}
            onClick={() => goToSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
            aria-current={index === currentIndex}
          />
        ))}
      </div>
    </div>
  );
};