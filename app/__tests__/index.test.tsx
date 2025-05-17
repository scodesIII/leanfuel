import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { useCounterStore } from '../../store';
import Home from '../index';


// Mock the expo-router module
jest.mock('expo-router', () => ({
  useRouter: () => ({
    navigate: jest.fn(),
  }),
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
}));

describe('Home Screen', () => {
  beforeEach(() => {
    // Reset the counter state before each test
    const resetStore = useCounterStore.getState().reset;
    resetStore();
  });

  test('renders the welcome text', () => {
    const { getByText } = render(<Home />);
    expect(getByText('Welcome to Your App')).toBeTruthy();
  });

  test('increment button increases the count', () => {
    const { getByText } = render(<Home />);
    
    // Initial count should be 0
    expect(getByText('Count: 0')).toBeTruthy();
    
    // Press the increment button
    const incrementButton = getByText('Increment (+)');
    fireEvent.press(incrementButton);
    
    // Count should now be 1
    expect(getByText('Count: 1')).toBeTruthy();
  });

  test('decrement button decreases the count', () => {
    const { getByText } = render(<Home />);
    
    // First, increment to 1
    const incrementButton = getByText('Increment (+)');
    fireEvent.press(incrementButton);
    expect(getByText('Count: 1')).toBeTruthy();
    
    // Now test decrement
    const decrementButton = getByText('Decrement (-)');
    fireEvent.press(decrementButton);
    
    // Count should be back to 0
    expect(getByText('Count: 0')).toBeTruthy();
  });

  test('alert is visible on the page', () => {
    const { getByText } = render(<Home />);
    
    // Check if the alert text is visible
    expect(getByText('This is an alert!')).toBeTruthy();
  });
});