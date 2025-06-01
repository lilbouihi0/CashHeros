import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import HomePage from './HomePage';

// Mock the API responses
const server = setupServer(
  // Mock coupons endpoint
  rest.get('http://localhost:5000/api/coupons', (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        data: [
          {
            _id: 'coupon1',
            code: 'SAVE10',
            title: 'Save 10% Off',
            description: 'Get 10% off your purchase',
            store: {
              name: 'Amazon',
              logo: 'https://example.com/amazon-logo.png'
            },
            discount: 10,
            expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            isActive: true,
            usageCount: 120
          },
          {
            _id: 'coupon2',
            code: 'SAVE20',
            title: 'Save 20% Off',
            description: 'Get 20% off your purchase',
            store: {
              name: 'Walmart',
              logo: 'https://example.com/walmart-logo.png'
            },
            discount: 20,
            expiryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
            isActive: true,
            usageCount: 85
          }
        ],
        pagination: {
          totalCoupons: 2,
          totalPages: 1,
          currentPage: 1,
          limit: 10
        }
      })
    );
  }),
  
  // Mock stores endpoint
  rest.get('http://localhost:5000/api/stores', (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        data: [
          {
            _id: 'store1',
            name: 'Amazon',
            logo: 'https://example.com/amazon-logo.png',
            cashbackPercentage: 5,
            isActive: true
          },
          {
            _id: 'store2',
            name: 'Walmart',
            logo: 'https://example.com/walmart-logo.png',
            cashbackPercentage: 3,
            isActive: true
          }
        ]
      })
    );
  }),
  
  // Mock cashbacks endpoint
  rest.get('http://localhost:5000/api/cashbacks', (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        data: [
          {
            _id: 'cashback1',
            title: 'Amazon Cashback',
            description: '5% cashback on all purchases',
            store: {
              name: 'Amazon',
              logo: 'https://example.com/amazon-logo.png'
            },
            amount: 5,
            isActive: true
          },
          {
            _id: 'cashback2',
            title: 'Walmart Cashback',
            description: '3% cashback on all purchases',
            store: {
              name: 'Walmart',
              logo: 'https://example.com/walmart-logo.png'
            },
            amount: 3,
            isActive: true
          }
        ]
      })
    );
  })
);

// Start the server before all tests
beforeAll(() => server.listen());
// Reset any request handlers that we may add during the tests
afterEach(() => server.resetHandlers());
// Close server after all tests
afterAll(() => server.close());

// Mock child components to simplify testing
jest.mock('./Slider/Slider', () => {
  return () => <div data-testid="slider">Slider Component</div>;
});

jest.mock('./SearchBar/SearchBar', () => {
  return () => <div data-testid="search-bar">Search Bar Component</div>;
});

jest.mock('./TopStore/TopStore', () => {
  return () => <div data-testid="top-store">Top Store Component</div>;
});

jest.mock('./CouponsCard/CouponsCard', () => {
  return ({ coupon }) => (
    <div data-testid="coupon-card">
      <div>{coupon.title}</div>
      <div>{coupon.store.name}</div>
    </div>
  );
});

jest.mock('./CashBack/CashBack', () => {
  return () => <div data-testid="cashback">Cashback Component</div>;
});

describe('HomePage Integration', () => {
  const renderWithRouter = (ui) => {
    return render(
      <BrowserRouter>
        {ui}
      </BrowserRouter>
    );
  };

  it('renders all homepage sections', async () => {
    renderWithRouter(<HomePage />);
    
    // Check if all main sections are rendered
    expect(screen.getByTestId('slider')).toBeInTheDocument();
    expect(screen.getByTestId('search-bar')).toBeInTheDocument();
    expect(screen.getByTestId('top-store')).toBeInTheDocument();
    
    // Wait for API data to load
    await waitFor(() => {
      expect(screen.getAllByTestId('coupon-card').length).toBe(2);
    });
    
    expect(screen.getByTestId('cashback')).toBeInTheDocument();
  });

  it('displays coupons from the API', async () => {
    renderWithRouter(<HomePage />);
    
    // Wait for coupons to load
    await waitFor(() => {
      const couponCards = screen.getAllByTestId('coupon-card');
      expect(couponCards.length).toBe(2);
      
      // Check if coupon data is correctly displayed
      expect(screen.getByText('Save 10% Off')).toBeInTheDocument();
      expect(screen.getByText('Save 20% Off')).toBeInTheDocument();
      expect(screen.getByText('Amazon')).toBeInTheDocument();
      expect(screen.getByText('Walmart')).toBeInTheDocument();
    });
  });

  it('shows loading state before data is loaded', () => {
    renderWithRouter(<HomePage />);
    
    // Check for loading indicators
    const loadingIndicators = screen.getAllByTestId('loading-indicator');
    expect(loadingIndicators.length).toBeGreaterThan(0);
  });

  it('handles API error gracefully', async () => {
    // Override the server response for this test to return an error
    server.use(
      rest.get('http://localhost:5000/api/coupons', (req, res, ctx) => {
        return res(
          ctx.status(500),
          ctx.json({
            success: false,
            error: 'Server error'
          })
        );
      })
    );
    
    renderWithRouter(<HomePage />);
    
    // Wait for error message to appear
    await waitFor(() => {
      expect(screen.getByText(/failed to load coupons/i)).toBeInTheDocument();
    });
  });

  it('allows filtering coupons by category', async () => {
    renderWithRouter(<HomePage />);
    
    // Wait for categories to load
    await waitFor(() => {
      const categoryButtons = screen.getAllByRole('button', { name: /category/i });
      expect(categoryButtons.length).toBeGreaterThan(0);
    });
    
    // Click on a category filter
    const electronicsCategory = screen.getByRole('button', { name: /electronics/i });
    fireEvent.click(electronicsCategory);
    
    // Check if the API was called with the correct filter
    await waitFor(() => {
      expect(screen.getByText(/filtered by: electronics/i)).toBeInTheDocument();
    });
  });
});