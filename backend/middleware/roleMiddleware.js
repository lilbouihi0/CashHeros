/**
 * @module middleware/roleMiddleware
 * @description Role-based access control middleware for protecting routes
 */

/**
 * Role hierarchy for permission inheritance
 * Higher roles inherit permissions from lower roles
 */
const ROLE_HIERARCHY = {
  user: ['user'],
  support: ['user', 'support'],
  moderator: ['user', 'support', 'moderator'],
  admin: ['user', 'support', 'moderator', 'admin']
};

/**
 * Permission definitions for fine-grained access control
 */
const PERMISSIONS = {
  // User permissions
  'user:read': ['user', 'support', 'moderator', 'admin'],
  'user:update': ['user', 'admin'],
  'user:delete': ['admin'],
  
  // Content permissions
  'content:read': ['user', 'support', 'moderator', 'admin'],
  'content:create': ['moderator', 'admin'],
  'content:update': ['moderator', 'admin'],
  'content:delete': ['admin'],
  
  // Coupon permissions
  'coupon:read': ['user', 'support', 'moderator', 'admin'],
  'coupon:create': ['moderator', 'admin'],
  'coupon:update': ['moderator', 'admin'],
  'coupon:delete': ['admin'],
  
  // Cashback permissions
  'cashback:read': ['user', 'support', 'moderator', 'admin'],
  'cashback:create': ['moderator', 'admin'],
  'cashback:update': ['moderator', 'admin'],
  'cashback:delete': ['admin'],
  
  // Store permissions
  'store:read': ['user', 'support', 'moderator', 'admin'],
  'store:create': ['moderator', 'admin'],
  'store:update': ['moderator', 'admin'],
  'store:delete': ['admin'],
  
  // Transaction permissions
  'transaction:read': ['user', 'support', 'moderator', 'admin'],
  'transaction:create': ['user', 'admin'],
  'transaction:update': ['support', 'moderator', 'admin'],
  'transaction:delete': ['admin'],
  
  // Admin permissions
  'admin:access': ['admin'],
  'admin:users': ['admin'],
  'admin:reports': ['admin', 'moderator'],
  'admin:settings': ['admin'],
  
  // Support permissions
  'support:access': ['support', 'moderator', 'admin'],
  'support:tickets': ['support', 'moderator', 'admin'],
  'support:respond': ['support', 'moderator', 'admin']
};

/**
 * Check if a user has a specific role
 * @param {string} userRole - The user's role
 * @param {string} requiredRole - The required role
 * @returns {boolean} True if the user has the required role
 */
const hasRole = (userRole, requiredRole) => {
  if (!userRole || !requiredRole) return false;
  
  // Get the roles that the user's role inherits
  const inheritedRoles = ROLE_HIERARCHY[userRole] || [];
  
  // Check if the required role is in the inherited roles
  return inheritedRoles.includes(requiredRole);
};

/**
 * Check if a user has a specific permission
 * @param {string} userRole - The user's role
 * @param {string} permission - The required permission
 * @returns {boolean} True if the user has the required permission
 */
const hasPermission = (userRole, permission) => {
  if (!userRole || !permission) return false;
  
  // Get the roles that have this permission
  const rolesWithPermission = PERMISSIONS[permission] || [];
  
  // Check if the user's role is in the roles with permission
  return rolesWithPermission.some(role => hasRole(userRole, role));
};

/**
 * Role-based access control middleware
 * 
 * This middleware checks if the user has the required role to access a resource.
 * It should be used after the authMiddleware to ensure the user is authenticated.
 * 
 * @param {string|string[]} roles - The role(s) required to access the resource
 * @returns {Function} Express middleware function
 */
const roleMiddleware = (roles) => {
  // Convert single role to array
  if (typeof roles === 'string') {
    roles = [roles];
  }
  
  return (req, res, next) => {
    // Check if user exists in request (set by authMiddleware)
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        message: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }
    
    // Get the user's role
    const userRole = req.user.role;
    
    // Check if user has any of the required roles
    const hasRequiredRole = roles.some(role => hasRole(userRole, role));
    
    if (!hasRequiredRole) {
      return res.status(403).json({ 
        success: false,
        message: `Access denied: ${roles.join(' or ')} role required`,
        code: 'INSUFFICIENT_ROLE'
      });
    }
    
    // User has required role, proceed
    next();
  };
};

/**
 * Permission-based access control middleware
 * 
 * This middleware checks if the user has the required permission to access a resource.
 * It should be used after the authMiddleware to ensure the user is authenticated.
 * 
 * @param {string|string[]} permissions - The permission(s) required to access the resource
 * @returns {Function} Express middleware function
 */
const permissionMiddleware = (permissions) => {
  // Convert single permission to array
  if (typeof permissions === 'string') {
    permissions = [permissions];
  }
  
  return (req, res, next) => {
    // Check if user exists in request (set by authMiddleware)
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        message: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }
    
    // Get the user's role
    const userRole = req.user.role;
    
    // Check if user has any of the required permissions
    const hasRequiredPermission = permissions.some(permission => 
      hasPermission(userRole, permission)
    );
    
    if (!hasRequiredPermission) {
      return res.status(403).json({ 
        success: false,
        message: 'Access denied: Insufficient permissions',
        code: 'INSUFFICIENT_PERMISSION'
      });
    }
    
    // User has required permission, proceed
    next();
  };
};

/**
 * Resource owner middleware
 * 
 * This middleware checks if the user is the owner of a resource.
 * It should be used after the authMiddleware to ensure the user is authenticated.
 * 
 * @param {Function} getResourceOwnerId - Function to get the resource owner ID from the request
 * @param {boolean} allowAdmin - Whether to allow admin users to access the resource
 * @returns {Function} Express middleware function
 */
const resourceOwnerMiddleware = (getResourceOwnerId, allowAdmin = true) => {
  return async (req, res, next) => {
    // Check if user exists in request (set by authMiddleware)
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        message: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }
    
    // Get the user's ID and role
    const userId = req.user.userId;
    const userRole = req.user.role;
    
    // If user is admin and admins are allowed, proceed
    if (allowAdmin && hasRole(userRole, 'admin')) {
      return next();
    }
    
    // Get the resource owner ID
    let resourceOwnerId;
    try {
      resourceOwnerId = await getResourceOwnerId(req);
    } catch (error) {
      return res.status(500).json({ 
        success: false,
        message: 'Error determining resource ownership',
        code: 'OWNERSHIP_ERROR'
      });
    }
    
    // Convert to string for comparison
    const resourceOwnerIdStr = resourceOwnerId ? resourceOwnerId.toString() : null;
    const userIdStr = userId ? userId.toString() : null;
    
    // Check if user is the resource owner
    if (resourceOwnerIdStr !== userIdStr) {
      return res.status(403).json({ 
        success: false,
        message: 'Access denied: You do not own this resource',
        code: 'NOT_RESOURCE_OWNER'
      });
    }
    
    // User is the resource owner, proceed
    next();
  };
};

// Common role middleware shortcuts
const adminMiddleware = roleMiddleware('admin');
const moderatorMiddleware = roleMiddleware(['admin', 'moderator']);
const supportMiddleware = roleMiddleware(['admin', 'moderator', 'support']);

// Common permission middleware shortcuts
const readPermission = permissionMiddleware('content:read');
const writePermission = permissionMiddleware(['content:create', 'content:update']);
const deletePermission = permissionMiddleware('content:delete');
const adminPermission = permissionMiddleware('admin:access');

module.exports = {
  roleMiddleware,
  permissionMiddleware,
  resourceOwnerMiddleware,
  adminMiddleware,
  moderatorMiddleware,
  supportMiddleware,
  readPermission,
  writePermission,
  deletePermission,
  adminPermission,
  hasRole,
  hasPermission,
  ROLE_HIERARCHY,
  PERMISSIONS
};