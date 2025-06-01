/**
 * @module middleware/sanitizationMiddleware
 * @description Enhanced Input Sanitization Middleware
 * 
 * This middleware provides comprehensive protection against:
 * - XSS (Cross-Site Scripting) attacks
 * - NoSQL injection attacks
 * - HTML injection
 * - JavaScript injection
 * - CSS-based attacks
 * - Protocol-based attacks (javascript:, data:)
 * - Malicious URL parameters
 */

const sanitizeHtml = require('sanitize-html');
const mongoSanitize = require('express-mongo-sanitize');
const xssClean = require('xss-clean');
const validator = require('validator');

// Create a simple xss function that uses sanitizeHtml as a fallback
const xss = function(html) {
  if (typeof html !== 'string') return html;
  return sanitizeHtml(html, {
    allowedTags: [],
    allowedAttributes: {},
    allowProtocolRelative: false
  });
};

/**
 * Configuration for HTML sanitization
 */
const SANITIZE_CONFIG = {
  // Content that can contain rich HTML (blog posts, product descriptions)
  richContent: {
    allowedTags: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'a', 'ul', 'ol',
      'nl', 'li', 'b', 'i', 'strong', 'em', 'strike', 'code', 'hr', 'br', 'div',
      'table', 'thead', 'caption', 'tbody', 'tr', 'th', 'td', 'pre', 'img', 'span'
    ],
    allowedAttributes: {
      a: ['href', 'name', 'target', 'rel'],
      img: ['src', 'alt', 'title', 'width', 'height'],
      div: ['class', 'id'],
      span: ['class', 'id'],
      p: ['class'],
      table: ['class', 'id'],
      th: ['scope']
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    allowedSchemesAppliedToAttributes: ['href', 'src'],
    allowProtocolRelative: false,
    enforceHtmlBoundary: true,
    transformTags: {
      // Force all links to open in a new tab with noopener and noreferrer
      'a': (tagName, attribs) => {
        return {
          tagName,
          attribs: {
            ...attribs,
            target: '_blank',
            rel: 'noopener noreferrer'
          }
        };
      }
    }
  },
  
  // Content with limited HTML (comments, reviews)
  limitedContent: {
    allowedTags: ['p', 'b', 'i', 'em', 'strong', 'a', 'br'],
    allowedAttributes: {
      a: ['href', 'rel', 'target']
    },
    allowedSchemes: ['http', 'https'],
    allowedSchemesAppliedToAttributes: ['href'],
    allowProtocolRelative: false,
    enforceHtmlBoundary: true
  },
  
  // Plain text (usernames, titles, etc.)
  plainText: {
    allowedTags: [],
    allowedAttributes: {},
    allowProtocolRelative: false,
    enforceHtmlBoundary: true
  }
};

/**
 * Sanitize HTML content with specific allowed tags and attributes
 * @param {string} content - HTML content to sanitize
 * @param {string} [level='plainText'] - Sanitization level: 'richContent', 'limitedContent', or 'plainText'
 * @returns {string} Sanitized HTML
 */
const sanitizeContent = (content, level = 'plainText') => {
  if (typeof content !== 'string') return content;
  
  // Apply sanitize-html with appropriate config
  const sanitized = sanitizeHtml(content, SANITIZE_CONFIG[level] || SANITIZE_CONFIG.plainText);
  
  // Apply additional XSS filter as a second layer of protection
  return xss(sanitized);
};

/**
 * Field type definitions for proper sanitization
 */
const FIELD_TYPES = {
  // Fields that can contain rich HTML content
  richContent: [
    'content', 
    'description', 
    'longDescription', 
    'blogContent', 
    'articleBody',
    'termsAndConditions'
  ],
  
  // Fields that can contain limited HTML
  limitedContent: [
    'comment', 
    'review', 
    'feedback', 
    'shortDescription', 
    'excerpt',
    'terms'
  ],
  
  // Fields that should be treated as URLs
  urls: [
    'url', 
    'website', 
    'link', 
    'imageUrl', 
    'profileUrl', 
    'redirectUrl',
    'thumbnailUrl',
    'logoUrl'
  ],
  
  // Fields that should be treated as email addresses
  emails: [
    'email', 
    'contactEmail', 
    'supportEmail'
  ],
  
  // Fields that should never be sanitized (e.g., passwords)
  noSanitize: [
    'password', 
    'passwordConfirm', 
    'newPassword', 
    'currentPassword',
    'token',
    'refreshToken',
    'accessToken'
  ]
};

/**
 * Sanitize a URL to prevent javascript: and data: protocol attacks
 * @param {string} url - URL to sanitize
 * @returns {string} Sanitized URL
 */
const sanitizeUrl = (url) => {
  if (typeof url !== 'string') return url;
  
  // Check if it's a valid URL
  if (!validator.isURL(url, { 
    protocols: ['http', 'https'], 
    require_protocol: true 
  })) {
    // If not a valid URL, check if it's a relative URL
    if (url.startsWith('/') && !url.startsWith('//')) {
      return url; // Allow relative URLs
    }
    return '#'; // Invalid URL, return a safe default
  }
  
  return url;
};

/**
 * Sanitize an email address
 * @param {string} email - Email to sanitize
 * @returns {string} Sanitized email
 */
const sanitizeEmail = (email) => {
  if (typeof email !== 'string') return email;
  
  // Check if it's a valid email
  if (!validator.isEmail(email)) {
    return ''; // Invalid email, return empty string
  }
  
  return email;
};

/**
 * Recursively sanitize all string values in an object
 * @param {Object} obj - Object to sanitize
 * @returns {Object} Sanitized object
 */
const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }
  
  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    // Skip fields that should never be sanitized
    if (FIELD_TYPES.noSanitize.includes(key)) {
      sanitized[key] = value;
      continue;
    }
    
    if (typeof value === 'string') {
      // Apply appropriate sanitization based on field type
      if (FIELD_TYPES.richContent.includes(key)) {
        sanitized[key] = sanitizeContent(value, 'richContent');
      } 
      else if (FIELD_TYPES.limitedContent.includes(key)) {
        sanitized[key] = sanitizeContent(value, 'limitedContent');
      }
      else if (FIELD_TYPES.urls.includes(key)) {
        sanitized[key] = sanitizeUrl(value);
      }
      else if (FIELD_TYPES.emails.includes(key)) {
        sanitized[key] = sanitizeEmail(value);
      }
      else {
        // For all other fields, strip all HTML and apply XSS filter
        sanitized[key] = xss(sanitizeContent(value, 'plainText'));
      }
    } 
    else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value);
    } 
    else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
};

/**
 * Middleware to sanitize request body, query parameters, and URL parameters
 * @param {Object} options - Configuration options
 * @returns {Function} Express middleware
 */
const sanitizeInputs = (options = {}) => {
  const {
    sanitizeBody = true,
    sanitizeQuery = true,
    sanitizeParams = true,
    sanitizeHeaders = false,
    sanitizeCookies = false,
    logSanitization = false
  } = options;
  
  return (req, res, next) => {
    try {
      const originalData = {
        body: sanitizeBody ? JSON.parse(JSON.stringify(req.body || {})) : null,
        query: sanitizeQuery ? JSON.parse(JSON.stringify(req.query || {})) : null,
        params: sanitizeParams ? JSON.parse(JSON.stringify(req.params || {})) : null
      };
      
      // Sanitize request body
      if (sanitizeBody && req.body && typeof req.body === 'object') {
        req.body = sanitizeObject(req.body);
      }
      
      // Sanitize query parameters
      if (sanitizeQuery && req.query && typeof req.query === 'object') {
        req.query = sanitizeObject(req.query);
      }
      
      // Sanitize URL parameters
      if (sanitizeParams && req.params && typeof req.params === 'object') {
        req.params = sanitizeObject(req.params);
      }
      
      // Sanitize headers (optional)
      if (sanitizeHeaders && req.headers && typeof req.headers === 'object') {
        // Only sanitize specific headers that might contain user input
        const headersToSanitize = ['user-agent', 'referer', 'origin'];
        headersToSanitize.forEach(header => {
          if (req.headers[header]) {
            req.headers[header] = sanitizeContent(req.headers[header], 'plainText');
          }
        });
      }
      
      // Sanitize cookies (optional)
      if (sanitizeCookies && req.cookies && typeof req.cookies === 'object') {
        // Skip sanitizing authentication and CSRF cookies
        const cookiesToSkip = ['token', 'refreshToken', 'csrfToken', 'sessionId'];
        Object.keys(req.cookies).forEach(cookie => {
          if (!cookiesToSkip.includes(cookie)) {
            req.cookies[cookie] = sanitizeContent(req.cookies[cookie], 'plainText');
          }
        });
      }
      
      // Log sanitization changes if enabled
      if (logSanitization) {
        const changes = {};
        
        if (sanitizeBody) {
          const bodyChanges = findChanges(originalData.body, req.body);
          if (Object.keys(bodyChanges).length > 0) {
            changes.body = bodyChanges;
          }
        }
        
        if (sanitizeQuery) {
          const queryChanges = findChanges(originalData.query, req.query);
          if (Object.keys(queryChanges).length > 0) {
            changes.query = queryChanges;
          }
        }
        
        if (sanitizeParams) {
          const paramsChanges = findChanges(originalData.params, req.params);
          if (Object.keys(paramsChanges).length > 0) {
            changes.params = paramsChanges;
          }
        }
        
        if (Object.keys(changes).length > 0) {
          console.log(`[Sanitization] ${req.method} ${req.originalUrl}:`, changes);
        }
      }
      
      next();
    } catch (error) {
      console.error('Error in sanitization middleware:', error);
      next();
    }
  };
};

/**
 * Find changes made during sanitization
 * @param {Object} original - Original object
 * @param {Object} sanitized - Sanitized object
 * @returns {Object} Object containing changes
 */
const findChanges = (original, sanitized) => {
  if (!original || !sanitized) return {};
  
  const changes = {};
  
  // Find all keys in both objects
  const allKeys = new Set([
    ...Object.keys(original),
    ...Object.keys(sanitized)
  ]);
  
  // Check each key for changes
  allKeys.forEach(key => {
    const originalValue = original[key];
    const sanitizedValue = sanitized[key];
    
    // Skip if values are identical
    if (originalValue === sanitizedValue) return;
    
    // Handle nested objects
    if (
      originalValue && 
      sanitizedValue && 
      typeof originalValue === 'object' && 
      typeof sanitizedValue === 'object' &&
      !Array.isArray(originalValue) &&
      !Array.isArray(sanitizedValue)
    ) {
      const nestedChanges = findChanges(originalValue, sanitizedValue);
      if (Object.keys(nestedChanges).length > 0) {
        changes[key] = nestedChanges;
      }
    }
    // Handle arrays
    else if (
      Array.isArray(originalValue) && 
      Array.isArray(sanitizedValue)
    ) {
      // Only record if arrays have different lengths or content
      if (
        originalValue.length !== sanitizedValue.length ||
        JSON.stringify(originalValue) !== JSON.stringify(sanitizedValue)
      ) {
        changes[key] = {
          original: originalValue,
          sanitized: sanitizedValue
        };
      }
    }
    // Handle primitive values
    else if (originalValue !== sanitizedValue) {
      changes[key] = {
        original: originalValue,
        sanitized: sanitizedValue
      };
    }
  });
  
  return changes;
};

/**
 * Middleware to prevent MongoDB operator injection
 * @param {Object} options - Configuration options
 * @returns {Function} Express middleware
 */
const preventNoSqlInjection = (options = {}) => {
  const {
    replaceWith = '_',
    logAttempts = true
  } = options;
  
  // Create the base middleware
  const sanitizer = mongoSanitize({
    replaceWith
  });
  
  // Return enhanced middleware that logs attempts
  return (req, res, next) => {
    // Store original data for comparison
    const originalBody = req.body ? JSON.parse(JSON.stringify(req.body)) : null;
    const originalQuery = req.query ? JSON.parse(JSON.stringify(req.query)) : null;
    const originalParams = req.params ? JSON.parse(JSON.stringify(req.params)) : null;
    
    // Apply the sanitizer
    sanitizer(req, res, () => {
      if (logAttempts) {
        // Check if anything was sanitized
        let injectionAttempt = false;
        let sanitizedData = {};
        
        // Check body
        if (originalBody && req.body) {
          const bodyDiff = findMongoOperators(originalBody, req.body);
          if (Object.keys(bodyDiff).length > 0) {
            injectionAttempt = true;
            sanitizedData.body = bodyDiff;
          }
        }
        
        // Check query
        if (originalQuery && req.query) {
          const queryDiff = findMongoOperators(originalQuery, req.query);
          if (Object.keys(queryDiff).length > 0) {
            injectionAttempt = true;
            sanitizedData.query = queryDiff;
          }
        }
        
        // Check params
        if (originalParams && req.params) {
          const paramsDiff = findMongoOperators(originalParams, req.params);
          if (Object.keys(paramsDiff).length > 0) {
            injectionAttempt = true;
            sanitizedData.params = paramsDiff;
          }
        }
        
        // Log the attempt if found
        if (injectionAttempt) {
          const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
          console.warn(`[Security] Possible NoSQL injection attempt from ${clientIp}:`, {
            method: req.method,
            url: req.originalUrl,
            sanitized: sanitizedData,
            userAgent: req.headers['user-agent']
          });
        }
      }
      
      next();
    });
  };
};

/**
 * Find MongoDB operators that were sanitized
 * @param {Object} original - Original object
 * @param {Object} sanitized - Sanitized object
 * @returns {Object} Object containing sanitized operators
 */
const findMongoOperators = (original, sanitized) => {
  if (!original || !sanitized) return {};
  
  const changes = {};
  const mongoOperators = ['$', '{$', '.$'];
  
  // Helper function to check if a string contains MongoDB operators
  const containsOperator = (str) => {
    if (typeof str !== 'string') return false;
    return mongoOperators.some(op => str.includes(op));
  };
  
  // Find all keys in the original object
  const processObject = (orig, san, path = '') => {
    if (!orig || typeof orig !== 'object') return;
    
    Object.keys(orig).forEach(key => {
      const currentPath = path ? `${path}.${key}` : key;
      
      // Check if the key contains an operator
      if (containsOperator(key)) {
        changes[currentPath] = {
          original: key,
          sanitized: Object.keys(san).find(k => k.includes(key.replace(/\$/g, '_'))) || 'removed'
        };
      }
      
      // Check the value
      const origValue = orig[key];
      const sanValue = san[key];
      
      if (typeof origValue === 'string' && containsOperator(origValue)) {
        changes[currentPath] = {
          original: origValue,
          sanitized: sanValue
        };
      } 
      else if (origValue && typeof origValue === 'object') {
        // Recursively check nested objects
        processObject(origValue, sanValue || {}, currentPath);
      }
    });
  };
  
  processObject(original, sanitized);
  return changes;
};

// Create default middleware instances
const defaultSanitizeInputs = sanitizeInputs({
  sanitizeBody: true,
  sanitizeQuery: true,
  sanitizeParams: true,
  sanitizeHeaders: false,
  sanitizeCookies: false,
  logSanitization: process.env.NODE_ENV !== 'production'
});

const defaultPreventNoSqlInjection = preventNoSqlInjection({
  replaceWith: '_',
  logAttempts: true
});

module.exports = {
  sanitizeInputs,
  preventNoSqlInjection,
  sanitizeContent,
  sanitizeObject,
  sanitizeUrl,
  sanitizeEmail,
  defaultSanitizeInputs,
  defaultPreventNoSqlInjection,
  xss
};