const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authMiddleware } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { body, validationResult } = require('express-validator');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for profile picture uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter to only allow image files
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

/**
 * @route   GET /api/users/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId).select('-password -resetPasswordToken -resetPasswordExpires -verificationToken');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   GET /api/users/activity
 * @desc    Get user activity (coupons redeemed, cashbacks earned, etc.)
 * @access  Private
 */
router.get('/activity', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;

    // This is a placeholder for actual activity tracking
    // In a real implementation, you would query activity collections

    // Example response structure
    const 
       activity = {
      couponsRedeemed: [],
      cashbacksEarned: [],
      totalSavings: 0,
      recentActivity: []
    };

    res.json({ activity });
  } catch (error) {
    console.error('Get user activity error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   GET /api/users/favorites
 * @desc    Get user favorite stores and coupons
 * @access  Private
 */
router.get('/favorites', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;

    // This is a placeholder for actual favorites tracking
    // In a real implementation, you would query favorites collections

    // Example response structure
    const favorites = {
      stores: [],
      coupons: [],
      cashbacks: []
    };

    res.json({ favorites });
  } catch (error) {
    console.error('Get user favorites error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   PUT /api/users/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile',
  authMiddleware,
  upload.single('profilePicture'),
  [
    body('firstName').optional().trim().isLength({ min: 1 }).withMessage('First name cannot be empty'),
    body('lastName').optional().trim().isLength({ min: 1 }).withMessage('Last name cannot be empty'),
    body('email').optional().isEmail().withMessage('Please provide a valid email'),
    body('phone').optional().isMobilePhone().withMessage('Please provide a valid phone number'),
    body('address').optional().isObject().withMessage('Address must be an object'),
    body('address.street').optional().isString().withMessage('Street must be a string'),
    body('address.city').optional().isString().withMessage('City must be a string'),
    body('address.state').optional().isString().withMessage('State must be a string'),
    body('address.zipCode').optional().isString().withMessage('Zip code must be a string'),
    body('address.country').optional().isString().withMessage('Country must be a string'),
    body('preferences').optional().isObject().withMessage('Preferences must be an object'),
    body('preferences.emailNotifications').optional().isBoolean().withMessage('Email notifications must be a boolean'),
    body('preferences.smsNotifications').optional().isBoolean().withMessage('SMS notifications must be a boolean'),
    body('preferences.categories').optional().isArray().withMessage('Categories must be an array')
  ],
  async (req, res) => {
    try {
      // Validate input
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const userId = req.user.userId;
      const {
        firstName,
        lastName,
        email,
        phone,
        address,
        preferences
      } = req.body;

      let updateData = {};

      // Basic profile fields
      // Basic profile fields
      if (firstName !== undefined) updateData.firstName = firstName;
      if (lastName !== undefined) updateData.lastName = lastName;

      // Email update requires verification
      if (email !== undefined && email !== req.user.email) {
        // Check if email is already in use
        const existingUser = await User.findOne({ email, _id: { $ne: userId } });
        if (existingUser) {
          return res.status(400).json({ message: 'Email is already in use' });
        }

        // Generate verification token for new email
        const verificationToken = crypto.randomBytes(32).toString('hex');
        updateData.newEmail = email;
        updateData.verificationToken = verificationToken;

        // Send verification email (placeholder)
        console.log(`Email verification sent to ${email} with token ${verificationToken}`);
      }

      // Additional profile fields
      if (phone !== undefined) updateData.phone = phone;
      if (address !== undefined) updateData.address = address;
      if (preferences !== undefined) updateData.preferences = preferences;

      // Handle profile picture upload
      if (req.file) {
        // If user already has a profile picture, delete the old one
        const currentUser = await User.findById(userId);
        if (currentUser.profilePicture) {
          const oldPicturePath = path.join(__dirname, '..', currentUser.profilePicture);
          if (fs.existsSync(oldPicturePath)) {
            fs.unlinkSync(oldPicturePath);
          }
        }

        // Save the relative path to the database
        updateData.profilePicture = path.relative(path.join(__dirname, '..'), req.file.path);
      }

      const updatedUser = await User.findByIdAndUpdate(
        userId,
        updateData,
        { new: true, runValidators: true }
      ).select('-password -resetPasswordToken -resetPasswordExpires -verificationToken');

      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Prepare response message
      let message = 'Profile updated successfully';
      if (updateData.newEmail) {
        message += '. Please check your new email address to verify the change.';
      }

      res.json({
        message,
        user: updatedUser
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

/**
 * @route   PUT /api/users/change-password
 * @desc    Change user password
 * @access  Private
 */
router.put('/change-password',
  authMiddleware,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 8 }).withMessage('New password must be at least 8 characters long')
      .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])/).withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
  ],
  async (req, res) => {
    try {
      // Validate input
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const userId = req.user.userId;
      const { currentPassword, newPassword } = req.body;

      // Get user with password
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Verify current password
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }

      // Check if new password is the same as the current one
      const isSamePassword = await bcrypt.compare(newPassword, user.password);
      if (isSamePassword) {
        return res.status(400).json({ message: 'New password must be different from the current password' });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update password
      user.password = hashedPassword;

      // Update last password change date
      user.lastPasswordChange = Date.now();

      await user.save();

      // Send password change notification email (placeholder)
      console.log(`Password change notification sent to ${user.email}`);

      res.json({
        message: 'Password updated successfully',
        lastPasswordChange: user.lastPasswordChange
      });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

/**
 * @route   POST /api/users/verify-email
 * @desc    Verify new email address
 * @access  Public
 */
router.post('/verify-email',
  [
    body('token').notEmpty().withMessage('Verification token is required')
  ],
  async (req, res) => {
    try {
      // Validate input
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { token } = req.body;

      // Find user with this verification token
      const user = await User.findOne({ verificationToken: token });
      if (!user) {
        return res.status(400).json({ message: 'Invalid verification token' });
      }

      // Check if user has a pending email change
      if (!user.newEmail) {
        return res.status(400).json({ message: 'No email change pending' });
      }

      // Update email and clear verification data
      user.email = user.newEmail;
      user.newEmail = undefined;
      user.verificationToken = undefined;
      user.verified = true;

      await user.save();

      res.json({ message: 'Email address updated successfully' });
    } catch (error) {
      console.error('Verify email error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

/**
 * @route   DELETE /api/users/account
 * @desc    Delete user account
 * @access  Private
 */
router.delete('/account',
  authMiddleware,
  [
    body('password').notEmpty().withMessage('Password is required for account deletion')
  ],
  async (req, res) => {
    try {
      // Validate input
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const userId = req.user.userId;
      const { password } = req.body;

      // Get user
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Verify password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Password is incorrect' });
      }

      // Delete profile picture if exists
      if (user.profilePicture) {
        const picturePath = path.join(__dirname, '..', user.profilePicture);
        if (fs.existsSync(picturePath)) {
          fs.unlinkSync(picturePath);
        }
      }

      // Delete user
      await User.findByIdAndDelete(userId);

      // Send account deletion confirmation email (placeholder)
      console.log(`Account deletion confirmation sent to ${user.email}`);

      res.json({ message: 'Account deleted successfully' });
    } catch (error) {
      console.error('Delete account error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

/**
 * @route   GET /api/users/security-log
 * @desc    Get user security activity log
 * @access  Private
 */
router.get('/security-log', authMiddleware, async (req, res) => {
  try {
    // This is a placeholder for actual security log tracking
    // In a real implementation, you would query a security log collection

    // Example response structure
    const securityLog = {
      lastLogin: new Date(),
      lastPasswordChange: new Date(),
      recentLogins: [
        {
          date: new Date(),
          ip: '192.168.1.1',
          device: 'Chrome on Windows'
        }
      ],
      accountChanges: [
        {
          date: new Date(),
          action: 'Password changed',
          ip: '192.168.1.1'
        }
      ]
    };

    res.json({ securityLog });
  } catch (error) {
    console.error('Get security log error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
