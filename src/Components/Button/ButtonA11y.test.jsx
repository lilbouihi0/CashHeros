import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { axe, toHaveNoViolations } from 'jest-axe';
import Button from './Button';

// Add jest-axe matchers
expect.extend(toHaveNoViolations);

describe('Button Accessibility', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(<Button>Click Me</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have no accessibility violations when disabled', async () => {
    const { container } = render(<Button disabled>Click Me</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have no accessibility violations when loading', async () => {
    const { container } = render(<Button loading>Click Me</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have no accessibility violations when rendered as a link', async () => {
    const { container } = render(<Button href="https://example.com">Click Me</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have proper ARIA attributes when loading', () => {
    const { getByRole } = render(<Button loading>Click Me</Button>);
    const button = getByRole('button');
    
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button).toHaveAttribute('aria-disabled', 'true');
  });

  it('should have proper ARIA attributes when disabled', () => {
    const { getByRole } = render(<Button disabled>Click Me</Button>);
    const button = getByRole('button');
    
    expect(button).toHaveAttribute('aria-disabled', 'true');
  });
});