import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ThemeToggle from './ThemeToggle';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    removeItem: jest.fn(key => {
      delete store[key];
    })
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock document.documentElement
const documentElementMock = {
  classList: {
    add: jest.fn(),
    remove: jest.fn(),
    contains: jest.fn()
  }
};

const originalDocumentElement = document.documentElement;

describe('ThemeToggle Component', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    localStorageMock.clear();
    
    // Mock document.documentElement
    Object.defineProperty(document, 'documentElement', {
      value: documentElementMock,
      writable: true
    });
  });

  afterEach(() => {
    // Restore document.documentElement
    Object.defineProperty(document, 'documentElement', {
      value: originalDocumentElement,
      writable: true
    });
  });

  it('renders the theme toggle button', () => {
    render(<ThemeToggle />);
    
    // Check if the toggle button is rendered
    const toggleButton = screen.getByRole('button');
    expect(toggleButton).toBeInTheDocument();
  });

  it('initializes with dark theme if saved in localStorage', () => {
    // Set localStorage to have dark theme
    localStorageMock.getItem.mockReturnValueOnce('dark');
    documentElementMock.classList.contains.mockReturnValueOnce(false);
    
    render(<ThemeToggle />);
    
    // Check if dark theme was applied
    expect(documentElementMock.classList.add).toHaveBeenCalledWith('dark-theme');
  });

  it('initializes with light theme if saved in localStorage', () => {
    // Set localStorage to have light theme
    localStorageMock.getItem.mockReturnValueOnce('light');
    documentElementMock.classList.contains.mockReturnValueOnce(true);
    
    render(<ThemeToggle />);
    
    // Check if dark theme was removed
    expect(documentElementMock.classList.remove).toHaveBeenCalledWith('dark-theme');
  });

  it('toggles from light to dark theme when clicked', () => {
    // Start with light theme
    documentElementMock.classList.contains.mockReturnValueOnce(false);
    
    render(<ThemeToggle />);
    
    // Click the toggle button
    const toggleButton = screen.getByRole('button');
    fireEvent.click(toggleButton);
    
    // Check if dark theme was applied and saved
    expect(documentElementMock.classList.add).toHaveBeenCalledWith('dark-theme');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'dark');
  });

  it('toggles from dark to light theme when clicked', () => {
    // Start with dark theme
    documentElementMock.classList.contains.mockReturnValueOnce(true);
    
    render(<ThemeToggle />);
    
    // Click the toggle button
    const toggleButton = screen.getByRole('button');
    fireEvent.click(toggleButton);
    
    // Check if dark theme was removed and light theme saved
    expect(documentElementMock.classList.remove).toHaveBeenCalledWith('dark-theme');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'light');
  });

  it('uses system preference if no theme is saved', () => {
    // Mock window.matchMedia
    const originalMatchMedia = window.matchMedia;
    window.matchMedia = jest.fn().mockImplementation(query => ({
      matches: query === '(prefers-color-scheme: dark)',
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));

    // No theme in localStorage
    localStorageMock.getItem.mockReturnValueOnce(null);
    
    // System prefers dark theme
    window.matchMedia.mockReturnValueOnce({ matches: true });
    
    render(<ThemeToggle />);
    
    // Check if dark theme was applied based on system preference
    expect(documentElementMock.classList.add).toHaveBeenCalledWith('dark-theme');
    
    // Restore window.matchMedia
    window.matchMedia = originalMatchMedia;
  });
});