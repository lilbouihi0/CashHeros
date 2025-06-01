/**
 * Performance metrics reporting function
 * 
 * This function attempts to use the web-vitals library if available,
 * but falls back to a basic implementation if the library is not installed.
 */
const reportWebVitals = (onPerfEntry) => {
  // Basic performance metrics without web-vitals
  const collectBasicMetrics = () => {
    if (onPerfEntry && onPerfEntry instanceof Function) {
      // Use Performance API for basic metrics
      if ('performance' in window) {
        // Navigation timing
        const navTiming = performance.getEntriesByType('navigation')[0];
        if (navTiming) {
          onPerfEntry({
            name: 'TTFB',
            value: navTiming.responseStart,
            id: 'basic-ttfb',
          });
          
          onPerfEntry({
            name: 'FCP',
            value: navTiming.domContentLoadedEventEnd - navTiming.fetchStart,
            id: 'basic-fcp',
          });
          
          onPerfEntry({
            name: 'LCP',
            value: navTiming.loadEventEnd - navTiming.fetchStart,
            id: 'basic-lcp',
          });
        }
      }
      
      // Log page load time
      window.addEventListener('load', () => {
        setTimeout(() => {
          const timing = performance.timing;
          const loadTime = timing.loadEventEnd - timing.navigationStart;
          
          onPerfEntry({
            name: 'LoadTime',
            value: loadTime,
            id: 'basic-load',
          });
        }, 0);
      });
    }
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Web Vitals library not available. Using basic performance metrics.');
      logBasicPerformance();
    }
  };
  
  // Try to use web-vitals if available
  try {
    if (onPerfEntry && onPerfEntry instanceof Function) {
      import('web-vitals')
        .then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
          getCLS(onPerfEntry); // Cumulative Layout Shift
          getFID(onPerfEntry); // First Input Delay
          getFCP(onPerfEntry); // First Contentful Paint
          getLCP(onPerfEntry); // Largest Contentful Paint
          getTTFB(onPerfEntry); // Time to First Byte
          
          // Log success
          console.log('Web Vitals library loaded successfully');
        })
        .catch(error => {
          console.warn('Failed to load web-vitals library:', error);
          collectBasicMetrics();
        });
    } else if (process.env.NODE_ENV === 'development') {
      // Default implementation to log to console in development
      import('web-vitals')
        .then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
          getCLS(logMetric);
          getFID(logMetric);
          getFCP(logMetric);
          getLCP(logMetric);
          getTTFB(logMetric);
        })
        .catch(() => {
          collectBasicMetrics();
        });
    } else if (process.env.NODE_ENV === 'production') {
      // Send metrics to analytics in production
      import('web-vitals')
        .then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
          getCLS(sendToAnalytics);
          getFID(sendToAnalytics);
          getFCP(sendToAnalytics);
          getLCP(sendToAnalytics);
          getTTFB(sendToAnalytics);
        })
        .catch(() => {
          collectBasicMetrics();
        });
    }
  } catch (e) {
    console.warn('Error setting up performance monitoring:', e);
    collectBasicMetrics();
  }
};

// Helper function to log metrics to console
const logMetric = (metric) => {
  console.log(`${metric.name}: ${metric.value}`);
};

// Helper function to log basic performance using Performance API
const logBasicPerformance = () => {
  window.addEventListener('load', () => {
    setTimeout(() => {
      if ('performance' in window) {
        const perfData = window.performance.timing;
        const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
        const domReadyTime = perfData.domComplete - perfData.domLoading;
        
        console.log('Page Load Time:', pageLoadTime);
        console.log('DOM Ready Time:', domReadyTime);
        console.log('Time to First Byte:', perfData.responseStart - perfData.navigationStart);
      }
    }, 0);
  });
};

// Helper function to send metrics to analytics
const sendToAnalytics = (metric) => {
  // You can replace this with your actual analytics service
  // Example: Google Analytics
  if (window.gtag) {
    window.gtag('event', 'web_vitals', {
      event_category: 'Web Vitals',
      event_action: metric.name,
      event_value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      event_label: metric.id,
      non_interaction: true,
    });
  }
  
  // Store in localStorage for debugging
  try {
    const vitals = JSON.parse(localStorage.getItem('web-vitals') || '{}');
    vitals[metric.name] = metric.value;
    localStorage.setItem('web-vitals', JSON.stringify(vitals));
  } catch (e) {
    console.error('Error storing web vitals:', e);
  }
};

export default reportWebVitals;
