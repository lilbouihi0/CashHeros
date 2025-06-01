import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the LOGO in Navbar', () => {
  render(<App />);
  const headerElement = screen.getByText(/LOGO/i);
  expect(headerElement).toBeInTheDocument();
});
