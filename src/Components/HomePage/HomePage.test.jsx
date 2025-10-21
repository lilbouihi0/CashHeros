import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { DataContext } from '../../context/DataContext';
import HomePage from './HomePage';

// Mock the Slider component since it's lazy loaded
jest.mock('./Slider/Slider.jsx', () => {
  return {
    __esModule: true,
    default: () => <div data-testid="mock-slider">Slider Component</div>
  };
});

// Mock other lazy loaded components
jest.mock('./CouponsCard/CouponsCard.jsx', () => {
  return {
    __esModule: true,
    default: ({ brand, title }) => (
      <div data-testid="mock-coupons-card">
        <span>{brand}</span>
        <span>{title}</span>
      </div>
    )
  };
});

jest.mock('./CashBack/CashBack.jsx', () => {
  return {
    __esModule: true,
    default: ({ storeName, percent }) => (
      <div data-testid="mock-cashback">
        <span>{storeName}</span>
        <span>{percent}%</span>
      </div>
    )
  };
});

jest.mock('./Deals/Deals.jsx', () => {
  return {
    __esModule: true,
    default: ({ brand, title }) => (
      <div data-testid="mock-deals">
        <span>{brand}</span>
        <span>{title}</span>
      </div>
    )
  };
});

// Mock the AIRecommendations component
jest.mock('../AIRecommendations/AIRecommendations.jsx', () => {
  return {
    __esModule: true,
    default: () => <div data-testid="mock-ai-recommendations">AI Recommendations</div>
  };
});

// Mock homeImages
jest.mock('../../assets/images/homeImages', () => ({
  default: {},
  __esModule: true
}));

// Mock placeholder image
jest.mock('../../assets/placeholder.js', () => '');

describe('HomePage', () => {
  const mockAuthContext = {
    isAuthenticated: false,
    user: null
  };

  const mockDataContext = {
    coupons: [
      { id: 1, brand: 'Amazon', title: '20% off', discount: '20%', code: 'SAVE20' },
      { id: 2, brand: 'Walmart', title: '15% off', discount: '15%', code: 'SAVE15' }
    ],
    cashBacks: [
      { id: 1, storeName: 'Amazon', percent: 5 },
      { id: 2, storeName: 'Walmart', percent: 3 }
    ],
    deals: [
      { id: 1, brand: 'Best Buy', title: 'Laptop Deal' },
      { id: 2, brand: 'Target', title: 'Home Goods Sale' }
    ]
  };

  const renderWithProviders = (component) => {
    return render(
      <BrowserRouter>
        <AuthContext.Provider value={mockAuthContext}>
          <DataContext.Provider value={mockDataContext}>
            {component}
          </DataContext.Provider>
        </AuthContext.Provider>
      </BrowserRouter>
    );
  };

  test('renders without crashing', () => {
    renderWithProviders(<HomePage />);
    expect(screen.getByText('★ TOP COUPONS ★')).toBeInTheDocument();
  });

  test('renders hero section with slider', () => {
    renderWithProviders(<HomePage />);
    expect(screen.getByTestId('mock-slider')).toBeInTheDocument();
  });

  test('renders coupons section', () => {
    renderWithProviders(<HomePage />);
    expect(screen.getByText('★ TOP COUPONS ★')).toBeInTheDocument();
    expect(screen.getByText('Explore All Coupons')).toBeInTheDocument();
  });

  test('renders cash back section', () => {
    renderWithProviders(<HomePage />);
    expect(screen.getByText('★ CASH BACK ★')).toBeInTheDocument();
  });

  test('renders deals section', () => {
    renderWithProviders(<HomePage />);
    expect(screen.getByText('Top Deals')).toBeInTheDocument();
  });

  test('renders newsletter subscription', () => {
    renderWithProviders(<HomePage />);
    expect(screen.getByText('Never Miss a Deal!')).toBeInTheDocument();
  });
});
