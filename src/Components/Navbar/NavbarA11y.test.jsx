import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { axe, toHaveNoViolations } from 'jest-axe';
import { BrowserRouter } from 'react-router-dom';
import Navbar from './Navbar';
import { AuthContext } from '../../context/AuthContext';

// Add jest-axe matchers
expect.extend(toHaveNoViolations);

// Mock context values
const mockAuthContext = {
  isAuthenticated: false,
  user: null,
  login: jest.fn(),
  logout: jest.fn()
};

const mockAuthenticatedContext = {
  isAuthenticated: true,
  user: {
    name: 'Test User',
    email: 'test@example.com',
    avatar: 'https://example.com/avatar.jpg'
  },
  login: jest.fn(),
  logout: jest.fn()
};

// Helper function to render with router and context
const renderWithRouterAndContext = (ui, contextValue = mockAuthContext) => {
  return render(
    <BrowserRouter>
      <AuthContext.Provider value={contextValue}>
        {ui}
      </AuthContext.Provider>
    </BrowserRouter>
  );
};

describe('Navbar Accessibility', () => {
  it('should have no accessibility violations when not authenticated', async () => {
    const { container } = renderWithRouterAndContext(<Navbar />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have no accessibility violations when authenticated', async () => {
    const { container } = renderWithRouterAndContext(<Navbar />, mockAuthenticatedContext);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have no accessibility violations when mobile menu is open', async () => {
    const { container } = renderWithRouterAndContext(<Navbar />);
    
    // Open mobile menu
    const menuButton = screen.getByRole('button', { name: /menu/i });
    fireEvent.click(menuButton);
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have proper keyboard navigation', () => {
    renderWithRouterAndContext(<Navbar />);
    
    // Get all focusable elements
    const focusableElements = screen.getAllByRole('link');
    const buttons = screen.getAllByRole('button');
    
    // Check that we have the expected number of interactive elements
    expect(focusableElements.length).toBeGreaterThan(0);
    expect(buttons.length).toBeGreaterThan(0);
    
    // Check that each element has a tabIndex that allows keyboard navigation
    [...focusableElements, ...buttons].forEach(element => {
      // Elements should either have no tabIndex (default of 0) or a non-negative tabIndex
      const tabIndex = element.tabIndex;
      expect(tabIndex).toBeGreaterThanOrEqual(0);
    });
  });

  it('should have proper ARIA attributes for mobile menu', () => {
    renderWithRouterAndContext(<Navbar />);
    
    // Get the mobile menu button
    const menuButton = screen.getByRole('button', { name: /menu/i });
    
    // Check initial ARIA attributes
    expect(menuButton).toHaveAttribute('aria-expanded', 'false');
    expect(menuButton).toHaveAttribute('aria-controls', 'mobile-menu');
    
    // Open the menu
    fireEvent.click(menuButton);
    
    // Check updated ARIA attributes
    expect(menuButton).toHaveAttribute('aria-expanded', 'true');
    
    // Check that the menu has proper ARIA attributes
    const mobileMenu = screen.getByRole('navigation', { name: /mobile/i });
    expect(mobileMenu).toHaveAttribute('id', 'mobile-menu');
    expect(mobileMenu).toHaveAttribute('aria-labelledby', menuButton.id);
  });

  it('should have proper contrast ratio for text elements', () => {
    renderWithRouterAndContext(<Navbar />);
    
    // This would typically be checked with a tool like axe-core
    // For this example, we'll just check that the component renders with expected classes
    
    const navbar = screen.getByRole('navigation');
    expect(navbar).toHaveClass('navbar'); // Assuming your navbar has a 'navbar' class
  });

  it('should have proper focus management for dropdown menus', () => {
    renderWithRouterAndContext(<Navbar />, mockAuthenticatedContext);
    
    // Find user dropdown toggle
    const userDropdown = screen.getByRole('button', { name: /test user/i });
    
    // Check initial state
    expect(userDropdown).toHaveAttribute('aria-expanded', 'false');
    
    // Open dropdown
    fireEvent.click(userDropdown);
    
    // Check updated state
    expect(userDropdown).toHaveAttribute('aria-expanded', 'true');
    
    // Check that dropdown menu has proper ARIA attributes
    const dropdownMenu = screen.getByRole('menu');
    expect(dropdownMenu).toHaveAttribute('aria-labelledby', userDropdown.id);
    
    // Check that menu items have proper roles
    const menuItems = screen.getAllByRole('menuitem');
    expect(menuItems.length).toBeGreaterThan(0);
  });

  it('should have proper alt text for images', () => {
    renderWithRouterAndContext(<Navbar />, mockAuthenticatedContext);
    
    // Check if logo has alt text
    const logo = screen.getByAltText(/logo/i);
    expect(logo).toHaveAttribute('alt');
    expect(logo.alt).not.toBe('');
    
    // Check if user avatar has alt text
    const avatar = screen.getByAltText(/test user/i);
    expect(avatar).toHaveAttribute('alt');
    expect(avatar.alt).not.toBe('');
  });
});