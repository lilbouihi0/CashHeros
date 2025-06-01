import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import CouponsCard from './CouponsCard';

// Mock any assets or dependencies
jest.mock('../LazyImage/LazyImage', () => {
  return ({ src, alt }) => <img src={src} alt={alt} data-testid="lazy-image" />;
});

describe('CouponsCard Component', () => {
  const mockCoupon = {
    _id: 'coupon123',
    code: 'SAVE20',
    title: 'Save 20% Off',
    description: 'Get 20% off your purchase',
    store: {
      name: 'Test Store',
      logo: 'https://example.com/logo.png'
    },
    discount: 20,
    expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    isActive: true,
    usageCount: 150
  };

  const renderWithRouter = (ui) => {
    return render(
      <BrowserRouter>
        {ui}
      </BrowserRouter>
    );
  };

  it('renders the coupon card with correct information', () => {
    renderWithRouter(<CouponsCard coupon={mockCoupon} />);
    
    // Check if store name is displayed
    expect(screen.getByText('Test Store')).toBeInTheDocument();
    
    // Check if coupon title is displayed
    expect(screen.getByText('Save 20% Off')).toBeInTheDocument();
    
    // Check if discount is displayed
    expect(screen.getByText('20%')).toBeInTheDocument();
    
    // Check if store logo is displayed
    const logo = screen.getByTestId('lazy-image');
    expect(logo).toHaveAttribute('src', 'https://example.com/logo.png');
    expect(logo).toHaveAttribute('alt', 'Test Store logo');
  });

  it('displays the coupon code', () => {
    renderWithRouter(<CouponsCard coupon={mockCoupon} />);
    
    const codeElement = screen.getByText('SAVE20');
    expect(codeElement).toBeInTheDocument();
  });

  it('shows expiry date in the correct format', () => {
    renderWithRouter(<CouponsCard coupon={mockCoupon} />);
    
    // Check for expiry date text (format may vary)
    const expiryText = screen.getByText(/expires/i);
    expect(expiryText).toBeInTheDocument();
  });

  it('shows usage count', () => {
    renderWithRouter(<CouponsCard coupon={mockCoupon} />);
    
    const usageText = screen.getByText(/150 used/i);
    expect(usageText).toBeInTheDocument();
  });

  it('handles click on the coupon card', () => {
    renderWithRouter(<CouponsCard coupon={mockCoupon} />);
    
    const card = screen.getByRole('link');
    expect(card).toHaveAttribute('href', `/coupon/${mockCoupon._id}`);
  });

  it('displays inactive status when coupon is not active', () => {
    const inactiveCoupon = { ...mockCoupon, isActive: false };
    renderWithRouter(<CouponsCard coupon={inactiveCoupon} />);
    
    const inactiveLabel = screen.getByText(/inactive/i);
    expect(inactiveLabel).toBeInTheDocument();
    expect(inactiveLabel).toHaveClass('inactive');
  });

  it('displays expired status when coupon is expired', () => {
    const expiredCoupon = { 
      ...mockCoupon, 
      expiryDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // 1 day ago
    };
    renderWithRouter(<CouponsCard coupon={expiredCoupon} />);
    
    const expiredLabel = screen.getByText(/expired/i);
    expect(expiredLabel).toBeInTheDocument();
    expect(expiredLabel).toHaveClass('expired');
  });

  it('displays featured badge when coupon is featured', () => {
    const featuredCoupon = { ...mockCoupon, featured: true };
    renderWithRouter(<CouponsCard coupon={featuredCoupon} />);
    
    const featuredBadge = screen.getByText(/featured/i);
    expect(featuredBadge).toBeInTheDocument();
    expect(featuredBadge).toHaveClass('featured');
  });

  it('allows copying coupon code to clipboard', () => {
    // Mock clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn().mockImplementation(() => Promise.resolve())
      }
    });
    
    renderWithRouter(<CouponsCard coupon={mockCoupon} />);
    
    const copyButton = screen.getByRole('button', { name: /copy/i });
    fireEvent.click(copyButton);
    
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('SAVE20');
  });
});