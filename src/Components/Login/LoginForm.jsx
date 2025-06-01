// src/Components/Login/LoginForm.jsx
import React, { useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import PropTypes from 'prop-types';
import styles from './LoginForm.module.css';
import { FaGoogle, FaFacebook, FaApple, FaEnvelope, FaLock } from 'react-icons/fa';
import illustration from '../assets/login-illustration.png';
import Form from '../Form/Form';
import FormField from '../Form/FormField';
import Button from '../Button/Button';
import { useForm, useAsyncOperation, useApp } from '../../hooks';
import { validateForm, isValidEmail } from '../../utils/validationUtils';

const SocialButton = ({ provider, onClick, icon: Icon }) => (
  <Button 
    onClick={() => onClick(provider)} 
    className={styles[`${provider.toLowerCase()}Btn`]}
    fullWidth
    icon={<Icon />}
  >
    Connect with {provider}
  </Button>
);

const LoginForm = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const { showNotification } = useApp();
  
  // Use our custom async operation hook for login
  const loginOperation = useAsyncOperation({
    operationName: 'login',
    showNotification: false
  });

  // Form validation rules
  const validationRules = {
    email: {
      required: true,
      email: true,
      requiredMessage: 'Email is required',
      emailMessage: 'Please enter a valid email address'
    },
    password: {
      required: true,
      minLength: 6,
      requiredMessage: 'Password is required',
      minLengthMessage: 'Password must be at least 6 characters'
    }
  };

  // Use our custom form hook
  const { 
    values, 
    errors, 
    touched, 
    handleChange, 
    handleBlur, 
    handleSubmit,
    hasError,
    getError
  } = useForm(
    { email: '', password: '' },
    (values) => validateForm(values, validationRules),
    async (values) => {
      try {
        await loginOperation.execute(async () => {
          await login(values);
          showNotification('Login successful! Welcome back.', 'success');
          navigate('/');
        }, {
          errorMessage: 'Login failed. Please check your credentials and try again.'
        });
      } catch (err) {
        // Error is already handled by the useAsyncOperation hook
        console.error('Login error:', err);
      }
    }
  );

  const handleSocialLogin = (provider) => {
    // Placeholder for social login API call
    showNotification(`Logging in with ${provider}...`, 'info');
    console.log(`Logging in with ${provider}`);
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.illustrationWrapper}>
        <img src={illustration} alt="Shopping" onError={(e) => (e.target.src = 'https://via.placeholder.com/400')} />
      </div>
      <div className={styles.formWrapper}>
        <h1>Log In</h1>
        {error && <p className={styles.error}>{error}</p>}
        <p className={styles.signUpPrompt}>
          Don’t have an account? <a href="/signup">Sign Up</a>
        </p>
        <p className={styles.termsText}>
          By logging in, you agree to our <a href="/terms">Terms of Service</a> and{' '}
          <a href="/privacy">Privacy Policy</a>.
        </p>
        <div className={styles.socialButtons}>
          <SocialButton provider="Google" onClick={handleSocialLogin} icon={FaGoogle} />
          <SocialButton provider="Facebook" onClick={handleSocialLogin} icon={FaFacebook} />
          <SocialButton provider="Apple" onClick={handleSocialLogin} icon={FaApple} />
        </div>
        <div className={styles.separator}>OR</div>
        <form className={styles.loginForm} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Email Address"
              value={credentials.email}
              onChange={handleChange}
              required
              aria-describedby="email-error"
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Password"
              value={credentials.password}
              onChange={handleChange}
              required
              aria-describedby="password-error"
            />
          </div>
          <button type="submit" className={styles.loginButton}>
            Log In
          </button>
        </form>
        <div className={styles.forgotPassword}>
          <a href="/forgot-password">Forgot Password?</a>
        </div>
      </div>
    </div>
  );
};

SocialButton.propTypes = {
  provider: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  icon: PropTypes.elementType.isRequired,
};

LoginForm.propTypes = {
  // Add props if component accepts any in the future
};

export default LoginForm;