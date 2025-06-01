# CashHeros Backend - Authentication System

## Email Verification and Password Reset Implementation

This document outlines the implementation of email verification and password reset functionality in the CashHeros backend.

### Setup Instructions

1. Install the required dependencies:
   ```bash
   npm install
   ```

2. Configure your environment variables in the `.env` file:
   ```
   MONGO_URI=mongodb://localhost:27017/cashheros
   JWT_SECRET=your_jwt_secret
   JWT_REFRESH_SECRET=your_refresh_secret_key
   PORT=5000
   CORS_ORIGIN=http://localhost:3000
   FRONTEND_URL=http://localhost:3000
   EMAIL_SERVICE=gmail
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASSWORD=your_email_password
   ```

   Note: For Gmail, you might need to use an "App Password" instead of your regular password. You can generate one in your Google Account settings.

3. Start the server:
   ```bash
   npm run dev
   ```

### Features Implemented

#### 1. Email Verification

- When a user signs up, a verification token is generated and stored in the database
- An email with a verification link is sent to the user's email address
- The verification token expires after 24 hours
- Users can click the link to verify their email address
- Users can request a new verification email if the original one expires

#### 2. Password Reset

- Users can request a password reset by providing their email address
- A password reset token is generated and stored in the database
- An email with a password reset link is sent to the user's email address
- The reset token expires after 1 hour
- Users can set a new password by clicking the link and submitting a new password

### API Endpoints

#### Authentication

- `POST /api/auth/signup` - Register a new user and send verification email
- `GET /api/auth/verify-email/:token` - Verify user's email address
- `POST /api/auth/resend-verification` - Resend verification email
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password/:token` - Reset password with token
- `POST /api/auth/login` - Login with email and password
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout and invalidate refresh token

### Security Considerations

- Tokens are securely generated using crypto.randomBytes
- Password reset tokens expire after 1 hour
- Email verification tokens expire after 24 hours
- User passwords are hashed using bcrypt
- API responses for sensitive operations (like forgot password) don't reveal if a user exists

### Email Templates

The system includes HTML email templates for:
- Email verification
- Password reset

These templates are responsive and include both button links and fallback text links.

### Testing

To test the email functionality without sending real emails, you can use services like:
- [Mailtrap](https://mailtrap.io/) - A test mail server
- [Ethereal Email](https://ethereal.email/) - A fake SMTP service

Update the EMAIL_* environment variables to use these testing services instead of a real email provider.