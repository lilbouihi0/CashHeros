import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Button from './Button';

describe('Button Component', () => {
  it('renders the button with provided text', () => {
    render(<Button>Click Me</Button>);
    
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
  });

  it('calls onClick handler when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click Me</Button>);
    
    const button = screen.getByRole('button', { name: /click me/i });
    fireEvent.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies primary variant styles by default', () => {
    render(<Button>Click Me</Button>);
    
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toHaveClass('primary');
  });

  it('applies secondary variant styles when specified', () => {
    render(<Button variant="secondary">Click Me</Button>);
    
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toHaveClass('secondary');
  });

  it('applies outline variant styles when specified', () => {
    render(<Button variant="outline">Click Me</Button>);
    
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toHaveClass('outline');
  });

  it('applies disabled styles and attributes when disabled', () => {
    render(<Button disabled>Click Me</Button>);
    
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeDisabled();
    expect(button).toHaveClass('disabled');
  });

  it('applies fullWidth style when specified', () => {
    render(<Button fullWidth>Click Me</Button>);
    
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toHaveClass('fullWidth');
  });

  it('applies custom className when provided', () => {
    render(<Button className="custom-class">Click Me</Button>);
    
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toHaveClass('custom-class');
  });

  it('renders as a link when href is provided', () => {
    render(<Button href="https://example.com">Click Me</Button>);
    
    const link = screen.getByRole('link', { name: /click me/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'https://example.com');
  });

  it('applies loading state when loading prop is true', () => {
    render(<Button loading>Click Me</Button>);
    
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toHaveClass('loading');
    expect(button).toBeDisabled();
    
    // Check if loading indicator is present
    const loadingIndicator = screen.getByTestId('loading-spinner');
    expect(loadingIndicator).toBeInTheDocument();
  });
});