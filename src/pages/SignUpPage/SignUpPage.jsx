// src/pages/SignUpPage/SignUpPage.jsx
import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import styles from './SignUpPage.module.css';
import { 
  FaGoogle, 
  FaFacebook, 
  FaApple, 
  FaEye, 
  FaEyeSlash, 
  FaCheck, 
  FaTimes,
  FaInfoCircle
} from 'react-icons/fa';

export const SignUpPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordFeedback, setPasswordFeedback] = useState({
    length: false,
    email: true,
    common: true,
    match: false
  });
  
  const { signup } = useContext(AuthContext);
  const navigate = useNavigate();

  // Update password strength and feedback whenever password changes
  useEffect(() => {
    // Check password length
    const hasLength = password.length >= 8;
    
    // Check if password contains email
    const hasEmail = email ? email.toLowerCase().includes(password.toLowerCase()) : false;
    
    // Check for common passwords
    const commonPasswords = ['password123', 'admin123', '12345678'];
    const isCommon = commonPasswords.includes(password.toLowerCase());
    
    // Check if passwords match
    const passwordsMatch = password === confirmPassword && password !== '';
    
    // Update feedback object
    setPasswordFeedback({
      length: hasLength,
      email: !hasEmail,
      common: !isCommon,
      match: passwordsMatch
    });
    
    // Calculate strength (0-3)
    let strength = 0;
    if (hasLength) strength++;
    if (!hasEmail) strength++;
    if (!isCommon) strength++;
    if (password.match(/[A-Z]/) && password.match(/[a-z]/) && password.match(/[0-9]/)) strength++;
    
    setPasswordStrength(strength);
  }, [password, email, confirmPassword]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate all password requirements
    if (!passwordFeedback.length) {
      setError('Password must be 8 characters or more');
      return;
    }
    if (!passwordFeedback.email) {
      setError("Password must not include any part of your email");
      return;
    }
    if (!passwordFeedback.common) {
      setError("Don't use a common password");
      return;
    }
    if (!passwordFeedback.match) {
      setError("Passwords don't match");
      return;
    }

    setIsSubmitting(true);

    try {
      // Split the name into firstName and lastName
      const nameParts = name.trim().split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
      
      console.log('Attempting to sign up with:', { firstName, lastName, email, password });
      
      const userData = {
        firstName,
        lastName,
        email,
        password
      };
      
      console.log('Sending registration data:', userData);
      
      const result = await signup(userData);
      console.log('Signup successful:', result);
      
      navigate('/'); // Redirect to homepage after successful signup
    } catch (err) {
      console.error('Signup error:', err);
      
      // Provide more specific error messages based on the error type
      if (err.type === 'NETWORK_ERROR') {
        setError('Unable to connect to the server. Please check your internet connection.');
      } else if (err.type === 'VALIDATION_ERROR') {
        // Display the validation error message directly
        setError(err.message || 'Please check your input and try again.');
        
        // If it's a "User already exists" error, provide a link to login
        if (err.message && err.message.includes('already registered')) {
          setError(
            <>
              {err.message} <a href="/login" className={styles.loginLink}>Log in here</a>
            </>
          );
        }
      } else if (err.type === 'RATE_LIMIT_ERROR') {
        setError(err.message || 'Too many signup attempts. Please try again later.');
      } else {
        setError(err.message || 'An error occurred during signup. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSocialLogin = (provider) => {
    alert(`Signing up with ${provider}... (Not implemented)`);
    // Future social login integration here
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  // Social login button component
  const SocialButton = ({ provider, onClick, icon: Icon }) => (
    <button 
      onClick={() => onClick(provider)} 
      className={styles[`${provider.toLowerCase()}Btn`]}
    >
      <Icon /> Continue with {provider}
    </button>
  );

  return (
    <div className={styles.signUpPage}>
      <div className={styles.formCard}>
        <h1 className={styles.title}>Create Account</h1>
        <p className={styles.alreadyHaveAccount}>
          Already have an account? <Link to="/login">Log In</Link>
        </p>
        
        <form className={styles.signUpForm} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className={styles.formInput}
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={styles.formInput}
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="password">Password</label>
            <div className={styles.passwordInputWrapper}>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={styles.formInput}
              />
              <button 
                type="button" 
                className={styles.passwordToggle}
                onClick={togglePasswordVisibility}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            
            {password && (
              <div className={styles.passwordStrengthContainer}>
                <div className={styles.passwordStrengthLabel}>
                  Password strength: 
                  <span className={
                    passwordStrength === 0 ? styles.strengthWeak :
                    passwordStrength === 1 ? styles.strengthWeak :
                    passwordStrength === 2 ? styles.strengthMedium :
                    passwordStrength === 3 ? styles.strengthGood :
                    styles.strengthStrong
                  }>
                    {passwordStrength === 0 ? ' Very Weak' :
                     passwordStrength === 1 ? ' Weak' :
                     passwordStrength === 2 ? ' Medium' :
                     passwordStrength === 3 ? ' Good' :
                     ' Strong'}
                  </span>
                </div>
                <div className={styles.passwordStrengthMeter}>
                  <div 
                    className={styles.passwordStrengthIndicator} 
                    style={{
                      width: `${(passwordStrength / 4) * 100}%`,
                      backgroundColor: 
                        passwordStrength <= 1 ? '#e53e3e' :
                        passwordStrength === 2 ? '#ed8936' :
                        passwordStrength === 3 ? '#48bb78' :
                        '#38a169'
                    }}
                  ></div>
                </div>
              </div>
            )}
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className={styles.passwordInputWrapper}>
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className={styles.formInput}
              />
              <button 
                type="button" 
                className={styles.passwordToggle}
                onClick={toggleConfirmPasswordVisibility}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>
          
          <div className={styles.passwordRequirements}>
            <h4 className={styles.requirementsTitle}>
              <FaInfoCircle /> Password Requirements
            </h4>
            <ul className={styles.requirementsList}>
              <li className={passwordFeedback.length ? styles.requirementMet : styles.requirementNotMet}>
                {passwordFeedback.length ? <FaCheck /> : <FaTimes />} 
                At least 8 characters
              </li>
              <li className={passwordFeedback.email ? styles.requirementMet : styles.requirementNotMet}>
                {passwordFeedback.email ? <FaCheck /> : <FaTimes />} 
                Doesn't contain your email
              </li>
              <li className={passwordFeedback.common ? styles.requirementMet : styles.requirementNotMet}>
                {passwordFeedback.common ? <FaCheck /> : <FaTimes />} 
                Not a common password
              </li>
              <li className={passwordFeedback.match ? styles.requirementMet : styles.requirementNotMet}>
                {passwordFeedback.match ? <FaCheck /> : <FaTimes />} 
                Passwords match
              </li>
            </ul>
          </div>
          
          {error && (
            <div className={styles.errorContainer}>
              <p className={styles.error}>{error}</p>
            </div>
          )}
          
          <button 
            type="submit" 
            className={styles.signUpButton}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        
        <div className={styles.separator}>
          <span>OR</span>
        </div>
        
        <div className={styles.socialButtons}>
          <SocialButton provider="Google" onClick={handleSocialLogin} icon={FaGoogle} />
          <SocialButton provider="Facebook" onClick={handleSocialLogin} icon={FaFacebook} />
          <SocialButton provider="Apple" onClick={handleSocialLogin} icon={FaApple} />
        </div>
        
        <p className={styles.termsText}>
          By signing up, you agree to our <Link to="/terms">Terms of Service</Link> and{' '}
          <Link to="/privacy">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  );
};