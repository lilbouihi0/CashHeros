import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoginForm from './LoginForm';
import { AuthContext } from '../../context/AuthContext';

// Mock the react-router-dom useNavigate hook
jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate
}));

// Mock the assets
jest.mock('../assets/login-illustration.png', () => 'mock-illustration.png');

// Mock the react-icons
jest.mock('react-icons/fa', () => ({
  FaGoogle: () => <div data-testid="google-icon" />,
  FaFacebook: () => <div data-testid="facebook-icon" />,
  FaApple: () => <div data-testid="apple-icon" />
}));

// Setup mocks
const mockLogin = jest.fn();
const mockNavigate = jest.fn();

// Helper function to render the component with context
const renderWithContext = (contextValue = { login: mockLogin }) => {
  return render(
    <AuthContext.Provider value={contextValue}>
      <LoginForm />
    </AuthContext.Provider>
  );
};

describe('LoginForm Component', () => {
  beforeEach(() => {
    // Clear mocks before each test
    jest.clearAllMocks();
  });

  it('renders the login form correctly', () => {
    renderWithContext();

    // Check if main elements are rendered
    expect(screen.getByText('Log In')).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
    
    // Check for social login buttons
    expect(screen.getByText(/connect with google/i)).toBeInTheDocument();
    expect(screen.getByText(/connect with facebook/i)).toBeInTheDocument();
    expect(screen.getByText(/connect with apple/i)).toBeInTheDocument();
    
    // Check for links
    expect(screen.getByText(/don't have an account/i)).toBeInTheDocument();
    expect(screen.getByText(/sign up/i)).toBeInTheDocument();
    expect(screen.getByText(/forgot password/i)).toBeInTheDocument();
    
    // Check for terms text
    expect(screen.getByText(/by logging in, you agree to our/i)).toBeInTheDocument();
    expect(screen.getByText(/terms of service/i)).toBeInTheDocument();
    expect(screen.getByText(/privacy policy/i)).toBeInTheDocument();
  });

  it('updates form values when user types', () => {
    renderWithContext();

    // Get form inputs
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);

    // Simulate user typing
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    // Check if values are updated
    expect(emailInput.value).toBe('test@example.com');
    expect(passwordInput.value).toBe('password123');
  });

  it('calls login function and navigates on successful form submission', async () => {
    // Setup mock to resolve successfully
    mockLogin.mockResolvedValueOnce();
    
    renderWithContext();

    // Get form inputs and submit button
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /log in/i });

    // Fill the form
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    // Submit the form
    fireEvent.click(submitButton);

    // Check if login was called with correct credentials
    expect(mockLogin).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123'
    });

    // Wait for navigation to happen after successful login
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('displays error message on login failure', async () => {
    // Setup mock to reject with error
    const errorMessage = 'Invalid credentials';
    mockLogin.mockRejectedValueOnce({ message: errorMessage });
    
    renderWithContext();

    // Get form inputs and submit button
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /log in/i });

    // Fill the form
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });

    // Submit the form
    fireEvent.click(submitButton);

    // Check if error message is displayed
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    // Navigation should not be called
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('handles social login button clicks', () => {
    // Mock console.log to check if it's called
    const originalConsoleLog = console.log;
    console.log = jest.fn();

    renderWithContext();

    // Get social login buttons
    const googleButton = screen.getByText(/connect with google/i);
    const facebookButton = screen.getByText(/connect with facebook/i);
    const appleButton = screen.getByText(/connect with apple/i);

    // Click each button
    fireEvent.click(googleButton);
    expect(console.log).toHaveBeenCalledWith('Logging in with Google');

    fireEvent.click(facebookButton);
    expect(console.log).toHaveBeenCalledWith('Logging in with Facebook');

    fireEvent.click(appleButton);
    expect(console.log).toHaveBeenCalledWith('Logging in with Apple');

    // Restore console.log
    console.log = originalConsoleLog;
  });

  it('handles image loading error', () => {
    renderWithContext();

    // Get the image
    const image = screen.getByAltText('Shopping');
    
    // Simulate image loading error
    fireEvent.error(image);
    
    // Check if the fallback src is set
    expect(image.src).toContain('https://via.placeholder.com/400');
  });
});