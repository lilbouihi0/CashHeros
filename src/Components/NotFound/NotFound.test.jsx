import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import NotFound from './NotFound';

// Mock any assets
jest.mock('../assets/404-illustration.png', () => 'mock-404-illustration.png');

describe('NotFound Component', () => {
  const renderWithRouter = (ui) => {
    return render(
      <BrowserRouter>
        {ui}
      </BrowserRouter>
    );
  };

  it('renders the 404 page with correct heading', () => {
    renderWithRouter(<NotFound />);
    
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent(/page not found/i);
  });

  it('displays a descriptive message', () => {
    renderWithRouter(<NotFound />);
    
    const message = screen.getByText(/the page you are looking for doesn't exist/i);
    expect(message).toBeInTheDocument();
  });

  it('renders a back to home button', () => {
    renderWithRouter(<NotFound />);
    
    const homeButton = screen.getByRole('link', { name: /back to home/i });
    expect(homeButton).toBeInTheDocument();
    expect(homeButton).toHaveAttribute('href', '/');
  });

  it('displays the 404 illustration', () => {
    renderWithRouter(<NotFound />);
    
    const illustration = screen.getByAltText(/404 illustration/i);
    expect(illustration).toBeInTheDocument();
  });

  it('handles image loading error', () => {
    renderWithRouter(<NotFound />);
    
    const illustration = screen.getByAltText(/404 illustration/i);
    
    // Simulate image loading error
    fireEvent.error(illustration);
    
    // Check if the fallback src is set
    expect(illustration.src).toContain('https://via.placeholder.com/400?text=404+Not+Found');
  });
});