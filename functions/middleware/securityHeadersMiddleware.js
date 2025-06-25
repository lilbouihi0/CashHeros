/**
 * @module middleware/securityHeadersMiddleware
 * @description Enhanced Security Headers Middleware
 * 
 * This middleware sets comprehensive HTTP security headers to protect against
 * common web vulnerabilities including:
 * - XSS (Cross-Site Scripting)
 * - Clickjacking
 * - MIME type sniffing
 * - Cross-site leaks
 * - Information disclosure
 * - Mixed content
 * - Insecure resource loading
 * - Unwanted browser features
 * 
 * It implements best practices from OWASP and web security standards.
 */

/**
 * Default CSP directives for different environments
 */
const CSP_DIRECTIVES = {
  production: [
    // Default fallback for everything
    "default-src 'self'",
    
    // JavaScript sources
    "script-src 'self' https://cdn.jsdelivr.net https://ajax.googleapis.com https://www.google-analytics.com https://www.googletagmanager.com https://js.stripe.com",
    
    // CSS sources
    "style-src 'self' https://cdn.jsdelivr.net https://fonts.googleapis.com 'unsafe-inline'",
    
    // Image sources
    "img-src 'self' data: https: blob:",
    
    // Font sources
    "font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net",
    
    // Connect sources (API endpoints, WebSockets)
    "connect-src 'self' https://www.google-analytics.com https://api.stripe.com",
    
    // Media sources
    "media-src 'self'",
    
    // Object sources (plugins, embeds)
    "object-src 'none'",
    
    // Frame sources (iframes)
    "frame-src 'self' https://www.youtube.com https://js.stripe.com",
    
    // Worker sources
    "worker-src 'self' blob:",
    
    // Manifest sources
    "manifest-src 'self'",
    
    // Base URI restriction
    "base-uri 'self'",
    
    // Form submission restriction
    "form-action 'self'",
    
    // Frame embedding restriction
    "frame-ancestors 'none'",
    
    // Block mixed content
    "block-all-mixed-content",
    
    // Upgrade insecure requests
    "upgrade-insecure-requests"
  ],
  
  development: [
    // More permissive policy for development
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.jsdelivr.net https://ajax.googleapis.com",
    "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://fonts.googleapis.com",
    "img-src 'self' data: https: blob:",
    "font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net",
    "connect-src 'self' ws: wss:",
    "media-src 'self'",
    "object-src 'none'",
    "frame-src 'self' https://www.youtube.com",
    "worker-src 'self' blob:",
    "manifest-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'self'"
  ]
};

/**
 * Permissions Policy directives
 * Controls which browser features and APIs can be used
 */
const PERMISSIONS_POLICY = [
  'accelerometer=()',
  'ambient-light-sensor=()',
  'autoplay=(self)',
  'battery=()',
  'camera=()',
  'display-capture=()',
  'document-domain=()',
  'encrypted-media=(self)',
  'execution-while-not-rendered=()',
  'execution-while-out-of-viewport=()',
  'fullscreen=(self)',
  'geolocation=(self)',
  'gyroscope=()',
  'magnetometer=()',
  'microphone=()',
  'midi=()',
  'navigation-override=()',
  'payment=(self)',
  'picture-in-picture=(self)',
  'publickey-credentials-get=()',
  'screen-wake-lock=()',
  'sync-xhr=()',
  'usb=()',
  'web-share=(self)',
  'xr-spatial-tracking=()'
];

/**
 * Cache control directives for different types of content
 */
const CACHE_CONTROL = {
  api: 'no-store, no-cache, must-revalidate, proxy-revalidate',
  dynamic: 'no-cache, must-revalidate, max-age=0',
  static: 'public, max-age=31536000, immutable' // 1 year for static assets
};

/**
 * Set enhanced security headers for all responses
 * @param {Object} options - Configuration options
 * @returns {Function} Express middleware
 */
const securityHeaders = (options = {}) => {
  const {
    enableHSTS = process.env.NODE_ENV === 'production',
    hstsMaxAge = 31536000, // 1 year
    hstsIncludeSubDomains = true,
    hstsPreload = true,
    
    enableCSP = true,
    cspReportOnly = process.env.NODE_ENV !== 'production',
    cspReportUri = '',
    customCSP = null,
    
    enablePermissionsPolicy = true,
    customPermissionsPolicy = null,
    
    enableCacheControl = true,
    
    referrerPolicy = 'strict-origin-when-cross-origin',
    
    removeServerHeader = true,
    
    // Cross-Origin settings
    crossOriginResourcePolicy = 'same-origin',
    crossOriginEmbedderPolicy = process.env.NODE_ENV === 'production' ? 'require-corp' : 'unsafe-none',
    crossOriginOpenerPolicy = 'same-origin'
  } = options;
  
  return (req, res, next) => {
    try {
      // Prevent browsers from interpreting files as a different MIME type
      res.setHeader('X-Content-Type-Options', 'nosniff');
      
      // Prevent clickjacking by not allowing the site to be framed
      res.setHeader('X-Frame-Options', 'DENY');
      
      // Enable browser's XSS filtering
      res.setHeader('X-XSS-Protection', '1; mode=block');
      
      // Control how much referrer information should be included with requests
      res.setHeader('Referrer-Policy', referrerPolicy);
      
      // Force HTTPS for a specified period
      if (enableHSTS) {
        let hstsValue = `max-age=${hstsMaxAge}`;
        if (hstsIncludeSubDomains) hstsValue += '; includeSubDomains';
        if (hstsPreload) hstsValue += '; preload';
        res.setHeader('Strict-Transport-Security', hstsValue);
      }
      
      // Set Cross-Origin Resource Policy
      res.setHeader('Cross-Origin-Resource-Policy', crossOriginResourcePolicy);
      
      // Set Cross-Origin Embedder Policy
      res.setHeader('Cross-Origin-Embedder-Policy', crossOriginEmbedderPolicy);
      
      // Set Cross-Origin Opener Policy
      res.setHeader('Cross-Origin-Opener-Policy', crossOriginOpenerPolicy);
      
      // Content Security Policy
      if (enableCSP) {
        // Determine environment
        const env = process.env.NODE_ENV === 'production' ? 'production' : 'development';
        
        // Use custom CSP if provided, otherwise use default
        const cspDirectives = customCSP || CSP_DIRECTIVES[env];
        
        // Add report URI if provided
        if (cspReportUri) {
          cspDirectives.push(`report-uri ${cspReportUri}`);
          cspDirectives.push(`report-to default`);
          
          // Set up the report-to header
          res.setHeader('Report-To', JSON.stringify({
            group: 'default',
            max_age: 31536000,
            endpoints: [{ url: cspReportUri }]
          }));
        }
        
        // Set CSP header
        const cspHeaderName = cspReportOnly 
          ? 'Content-Security-Policy-Report-Only' 
          : 'Content-Security-Policy';
          
        res.setHeader(cspHeaderName, cspDirectives.join('; '));
      }
      
      // Permissions Policy
      if (enablePermissionsPolicy) {
        const permissionsPolicy = customPermissionsPolicy || PERMISSIONS_POLICY;
        res.setHeader('Permissions-Policy', permissionsPolicy.join(', '));
      }
      
      // Cache Control
      if (enableCacheControl) {
        // API endpoints
        if (req.path.startsWith('/api/')) {
          res.setHeader('Cache-Control', CACHE_CONTROL.api);
          res.setHeader('Pragma', 'no-cache');
          res.setHeader('Expires', '0');
          res.setHeader('Surrogate-Control', 'no-store');
        }
        // Static assets
        else if (req.path.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)) {
          res.setHeader('Cache-Control', CACHE_CONTROL.static);
        }
        // Dynamic content
        else {
          res.setHeader('Cache-Control', CACHE_CONTROL.dynamic);
        }
      }
      
      // Remove Server header if enabled
      if (removeServerHeader) {
        res.removeHeader('Server');
        res.removeHeader('X-Powered-By');
      }
      
      next();
    } catch (error) {
      console.error('Error setting security headers:', error);
      next();
    }
  };
};

/**
 * Create default middleware instance with standard configuration
 */
const defaultSecurityHeaders = securityHeaders();

module.exports = {
  securityHeaders,
  defaultSecurityHeaders,
  CSP_DIRECTIVES,
  PERMISSIONS_POLICY,
  CACHE_CONTROL
};