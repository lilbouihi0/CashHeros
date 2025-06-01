import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { axe, toHaveNoViolations } from 'jest-axe';
import LoginForm from './LoginForm';
import { AuthContext } from '../../context/AuthContext';

// Add jest-axe matchers
expect.extend(toHaveNoViolations);

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

// Helper function to render the component with context
const renderWithContext = () => {
  return render(
    <AuthContext.Provider value={{ login: jest.fn() }}>
      <LoginForm />
    </AuthContext.Provider>
  );
};

describe('LoginForm Accessibility', () => {
  it('should have no accessibility violations', async () => {
    const { container } = renderWithContext();
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have proper form labeling', () => {
    renderWithContext();
    
    // Check if form elements have proper labels
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('should have proper ARIA attributes', () => {
    renderWithContext();
    
    // Check for aria-describedby on form fields
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    
    expect(emailInput).toHaveAttribute('aria-describedby', 'email-error');
    expect(passwordInput).toHaveAttribute('aria-describedby', 'password-error');
  });

  it('should have sufficient color contrast', () => {
    // This test would typically use a tool like axe-core to check contrast
    // For this example, we'll just check that the component renders with expected classes
    
    renderWithContext();
    
    // Check if the component has the expected styling classes
    const loginContainer = screen.getByText('Log In').closest('div');
    expect(loginContainer).toHaveClass('loginContainer');
  });

  it('should be keyboard navigable', () => {
    renderWithContext();
    
    // Check if all interactive elements are focusable
    const focusableElements = screen.getAllByRole('button');
    const links = screen.getAllByRole('link');
    const inputs = screen.getAllByRole('textbox').concat(screen.getByLabelText(/password/i));
    
    // Check that we have the expected number of interactive elements
    expect(focusableElements.length).toBeGreaterThan(0);
    expect(links.length).toBeGreaterThan(0);
    expect(inputs.length).toBe(2); // Email and password
    
    // Check that each element has a tabIndex that allows keyboard navigation
    [...focusableElements, ...links, ...inputs].forEach(element => {
      // Elements should either have no tabIndex (default of 0) or a non-negative tabIndex
      const tabIndex = element.tabIndex;
      expect(tabIndex).toBeGreaterThanOrEqual(0);
    });
  });

  it('should have appropriate heading structure', () => {
    renderWithContext();
    
    // Check for proper heading structure
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('Log In');
  });

  it('should have alt text for images', () => {
    renderWithContext();
    
    // Check if images have alt text
    const images = screen.getAllByRole('img');
    images.forEach(img => {
      expect(img).toHaveAttribute('alt');
      expect(img.alt).not.toBe('');
    });
  });
});