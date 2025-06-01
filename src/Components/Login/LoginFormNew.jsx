// src/Components/Login/LoginFormNew.jsx
import React, { useContext, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import styles from './LoginForm.module.css';
import { FaGoogle, FaFacebook, FaApple, FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import Form from '../Form/Form';
import FormField from '../Form/FormField';
import Button from '../Button/Button';
import { useForm, useAsyncOperation, useApp } from '../../hooks';
import { AuthContext } from '../../context/AuthContext';
import { validateForm } from '../../utils/validationUtils';

const SocialButton = ({ provider, onClick, icon: Icon }) => (
  <Button 
    onClick={() => onClick(provider)} 
    className={styles[`${provider.toLowerCase()}Btn`]}
    fullWidth
    rounded
    icon={<Icon />}
  >
    Continue with {provider}
  </Button>
);

const LoginFormNew = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const { showNotification } = useApp();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
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
          await login(values.email, values.password, rememberMe);
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

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleRememberMeChange = (e) => {
    setRememberMe(e.target.checked);
  };

  // Custom password field icon that toggles visibility
  const PasswordIcon = () => (
    <div 
      className={styles.passwordToggle} 
      onClick={togglePasswordVisibility}
      role="button"
      tabIndex={0}
      aria-label={showPassword ? "Hide password" : "Show password"}
    >
      {showPassword ? <FaEyeSlash /> : <FaEye />}
    </div>
  );

  return (
    <div className={styles.loginContainer}>
      <div className={styles.formWrapper}>
        <h1 className={styles.loginTitle}>Welcome Back</h1>
        <p className={styles.signUpPrompt}>
          Don't have an account? <Link to="/signup">Sign Up</Link>
        </p>
        
        <Form 
          onSubmit={handleSubmit}
          loading={loginOperation.loading}
          error={loginOperation.error}
          className={styles.loginForm}
        >
          <FormField
            id="email"
            name="email"
            label="Email Address"
            type="email"
            placeholder="Enter your email address"
            value={values.email}
            onChange={handleChange}
            onBlur={handleBlur}
            error={getError('email')}
            touched={touched.email}
            required
            icon={<FaEnvelope />}
            className={styles.formField}
          />
          
          <FormField
            id="password"
            name="password"
            label="Password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={values.password}
            onChange={handleChange}
            onBlur={handleBlur}
            error={getError('password')}
            touched={touched.password}
            required
            icon={<FaLock />}
            className={styles.formField}
          />
          
          <PasswordIcon />
          
          <div className={styles.formOptions}>
            <div className={styles.rememberMe}>
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={handleRememberMeChange}
                className={styles.checkbox}
              />
              <label htmlFor="rememberMe">Remember me</label>
            </div>
            <div className={styles.forgotPassword}>
              <Link to="/forgot-password">Forgot Password?</Link>
            </div>
          </div>
          
          <Button 
            type="submit"
            variant="success"
            fullWidth
            rounded
            size="large"
            loading={loginOperation.loading}
            className={styles.loginButton}
          >
            Log In
          </Button>
        </Form>
        
        <div className={styles.separator}>
          <span>OR</span>
        </div>
        
        <div className={styles.socialButtons}>
          <SocialButton provider="Google" onClick={handleSocialLogin} icon={FaGoogle} />
          <SocialButton provider="Facebook" onClick={handleSocialLogin} icon={FaFacebook} />
          <SocialButton provider="Apple" onClick={handleSocialLogin} icon={FaApple} />
        </div>
        
        <p className={styles.termsText}>
          By logging in, you agree to our <Link to="/terms">Terms of Service</Link> and{' '}
          <Link to="/privacy">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  );
};

SocialButton.propTypes = {
  provider: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  icon: PropTypes.elementType.isRequired,
};

export default LoginFormNew;