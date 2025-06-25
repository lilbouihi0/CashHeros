const crypto = require('crypto');
const nodemailer = require('nodemailer');
const functions = require('firebase-functions');

// Generate a random token
const generateToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Generate a random numeric OTP
const generateOTP = (length = 6) => {
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  return Math.floor(Math.random() * (max - min + 1) + min).toString();
};

// Configure nodemailer transporter
const transporter = nodemailer.createTransport({
  service: functions.config().email?.service || 'gmail',
  auth: {
    user: functions.config().email?.user,
    pass: functions.config().email?.password
  }
});

// Send verification email
const sendVerificationEmail = async (email, token) => {
  const verificationUrl = `${functions.config().frontend?.url}/verify-email?token=${token}`;
  
  const mailOptions = {
    from: functions.config().email?.user,
    to: email,
    subject: 'CashHeros - Verify Your Email',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4a4a4a;">Welcome to CashHeros!</h2>
        <p>Thank you for signing up. Please verify your email address by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Verify Email</a>
        </div>
        <p>If the button doesn't work, you can also copy and paste the following link into your browser:</p>
        <p style="word-break: break-all;">${verificationUrl}</p>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't sign up for CashHeros, please ignore this email.</p>
        <p>Best regards,<br>The CashHeros Team</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending verification email:', error);
    return false;
  }
};

// Send password reset email
const sendPasswordResetEmail = async (email, token) => {
  const resetUrl = `${functions.config().frontend?.url}/reset-password?token=${token}`;
  
  const mailOptions = {
    from: functions.config().email?.user,
    to: email,
    subject: 'CashHeros - Reset Your Password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4a4a4a;">Reset Your Password</h2>
        <p>You requested a password reset. Please click the button below to set a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Reset Password</a>
        </div>
        <p>If the button doesn't work, you can also copy and paste the following link into your browser:</p>
        <p style="word-break: break-all;">${resetUrl}</p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request a password reset, please ignore this email and ensure your account is secure.</p>
        <p>Best regards,<br>The CashHeros Team</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return false;
  }
};

// Send two-factor authentication code
const sendTwoFactorCode = async (email, code) => {
  const mailOptions = {
    from: functions.config().email?.user,
    to: email,
    subject: 'CashHeros - Your Two-Factor Authentication Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4a4a4a;">Your Two-Factor Authentication Code</h2>
        <p>You are attempting to log in to your CashHeros account. Please use the following code to complete the login process:</p>
        <div style="text-align: center; margin: 30px 0;">
          <div style="font-size: 24px; font-weight: bold; letter-spacing: 5px; padding: 15px; background-color: #f5f5f5; border-radius: 4px; display: inline-block;">${code}</div>
        </div>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't attempt to log in, please secure your account by changing your password immediately.</p>
        <p>Best regards,<br>The CashHeros Team</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending two-factor code email:', error);
    return false;
  }
};

// Send backup codes email
const sendBackupCodesEmail = async (email, codes) => {
  const mailOptions = {
    from: functions.config().email?.user,
    to: email,
    subject: 'CashHeros - Your Two-Factor Authentication Backup Codes',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4a4a4a;">Your Two-Factor Authentication Backup Codes</h2>
        <p>Here are your backup codes for two-factor authentication. Each code can be used once if you lose access to your authenticator app:</p>
        <div style="margin: 20px 0; padding: 15px; background-color: #f5f5f5; border-radius: 4px;">
          ${codes.map(code => `<div style="font-family: monospace; font-size: 16px; margin: 5px 0;">${code}</div>`).join('')}
        </div>
        <p><strong>Important:</strong> Keep these codes in a safe place. They are the only way to access your account if you lose your phone or authenticator app.</p>
        <p>Best regards,<br>The CashHeros Team</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending backup codes email:', error);
    return false;
  }
};

// Send account activity notification
const sendAccountActivityEmail = async (email, activity) => {
  const { type, timestamp, ipAddress, userAgent, location } = activity;
  
  let activityText = '';
  switch (type) {
    case 'login':
      activityText = 'logged in to your account';
      break;
    case 'password_change':
      activityText = 'changed your password';
      break;
    case 'email_change':
      activityText = 'changed your email address';
      break;
    case '2fa_enabled':
      activityText = 'enabled two-factor authentication';
      break;
    case '2fa_disabled':
      activityText = 'disabled two-factor authentication';
      break;
    default:
      activityText = 'performed an action';
  }
  
  const mailOptions = {
    from: functions.config().email?.user,
    to: email,
    subject: 'CashHeros - Account Activity Alert',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4a4a4a;">Account Activity Alert</h2>
        <p>Someone recently ${activityText}.</p>
        <div style="margin: 20px 0; padding: 15px; background-color: #f5f5f5; border-radius: 4px;">
          <p><strong>Time:</strong> ${new Date(timestamp).toLocaleString()}</p>
          <p><strong>IP Address:</strong> ${ipAddress || 'Unknown'}</p>
          <p><strong>Device:</strong> ${userAgent || 'Unknown'}</p>
          ${location ? `<p><strong>Location:</strong> ${location}</p>` : ''}
        </div>
        <p>If this was you, you can ignore this email.</p>
        <p>If this wasn't you, please secure your account by changing your password immediately and contacting our support team.</p>
        <p>Best regards,<br>The CashHeros Team</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending account activity email:', error);
    return false;
  }
};

module.exports = {
  generateToken,
  generateOTP,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendTwoFactorCode,
  sendBackupCodesEmail,
  sendAccountActivityEmail
};