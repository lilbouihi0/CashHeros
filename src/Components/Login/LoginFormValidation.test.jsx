import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoginForm from './LoginForm';
import { AuthContext } from '../../context/AuthContext';

// Mock the react-router-dom useNavigate hook
jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn()
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

// Helper function to render the component with context
const renderWithContext = (contextValue = { login: mockLogin }) => {
  return render(
    <AuthContext.Provider value={contextValue}>
      <LoginForm />
    </AuthContext.Provider>
  );
};

describe('LoginForm Validation', () => {
  beforeEach(() => {
    // Clear mocks before each test
    jest.clearAllMocks();
  });

  it('should validate email format', async () => {
    renderWithContext();

    // Get form inputs and submit button
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /log in/i });

    // Fill the form with invalid email
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    // Submit the form
    fireEvent.click(submitButton);

    // Check if login was not called
    expect(mockLogin).not.toHaveBeenCalled();

    // Check for HTML5 validation message
    // Note: This is browser-dependent, so we're checking if the input is invalid
    expect(emailInput).toBeInvalid();
  });

  it('should require email field', async () => {
    renderWithContext();

    // Get form inputs and submit button
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /log in/i });

    // Fill only password
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    // Submit the form
    fireEvent.click(submitButton);

    // Check if login was not called
    expect(mockLogin).not.toHaveBeenCalled();

    // Check for HTML5 validation message
    expect(emailInput).toBeInvalid();
  });

  it('should require password field', async () => {
    renderWithContext();

    // Get form inputs and submit button
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /log in/i });

    // Fill only email
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    // Submit the form
    fireEvent.click(submitButton);

    // Check if login was not called
    expect(mockLogin).not.toHaveBeenCalled();

    // Check for HTML5 validation message
    expect(passwordInput).toBeInvalid();
  });

  it('should handle server-side validation errors', async () => {
    // Setup mock to reject with specific validation error
    const validationError = { 
      message: 'Validation failed', 
      errors: [
        { field: 'email', message: 'Email not found' },
        { field: 'password', message: 'Password is incorrect' }
      ]
    };
    mockLogin.mockRejectedValueOnce(validationError);
    
    renderWithContext();

    // Get form inputs and submit button
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /log in/i });

    // Fill the form with valid data
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    // Submit the form
    fireEvent.click(submitButton);

    // Check if login was called
    expect(mockLogin).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123'
    });

    // Check if error message is displayed
    await waitFor(() => {
      expect(screen.getByText('Validation failed')).toBeInTheDocument();
    });
  });

  it('should handle network errors', async () => {
    // Setup mock to reject with network error
    const networkError = new Error('Network Error');
    mockLogin.mockRejectedValueOnce(networkError);
    
    renderWithContext();

    // Get form inputs and submit button
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /log in/i });

    // Fill the form with valid data
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    // Submit the form
    fireEvent.click(submitButton);

    // Check if error message is displayed
    await waitFor(() => {
      expect(screen.getByText('Network Error')).toBeInTheDocument();
    });
  });

  it('should handle generic error message when no specific error is provided', async () => {
    // Setup mock to reject with empty error
    mockLogin.mockRejectedValueOnce({});
    
    renderWithContext();

    // Get form inputs and submit button
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /log in/i });

    // Fill the form with valid data
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    // Submit the form
    fireEvent.click(submitButton);

    // Check if generic error message is displayed
    await waitFor(() => {
      expect(screen.getByText('Login failed. Please try again.')).toBeInTheDocument();
    });
  });
});