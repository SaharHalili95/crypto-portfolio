import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, useTheme } from '../context/ThemeContext';

function TestConsumer() {
  const { dark, toggle } = useTheme();
  return (
    <div>
      <span data-testid="mode">{dark ? 'dark' : 'light'}</span>
      <button data-testid="toggle" onClick={toggle}>Toggle</button>
    </div>
  );
}

beforeEach(() => {
  localStorage.clear();
  document.documentElement.classList.remove('dark');
});

describe('ThemeContext', () => {
  it('defaults to dark mode', () => {
    render(<ThemeProvider><TestConsumer /></ThemeProvider>);
    expect(screen.getByTestId('mode').textContent).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('toggles to light mode', () => {
    render(<ThemeProvider><TestConsumer /></ThemeProvider>);
    fireEvent.click(screen.getByTestId('toggle'));

    expect(screen.getByTestId('mode').textContent).toBe('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('toggles back to dark mode', () => {
    render(<ThemeProvider><TestConsumer /></ThemeProvider>);
    fireEvent.click(screen.getByTestId('toggle'));
    fireEvent.click(screen.getByTestId('toggle'));

    expect(screen.getByTestId('mode').textContent).toBe('dark');
  });

  it('persists theme to localStorage', () => {
    render(<ThemeProvider><TestConsumer /></ThemeProvider>);
    expect(localStorage.getItem('crypto-theme')).toBe('dark');

    fireEvent.click(screen.getByTestId('toggle'));
    expect(localStorage.getItem('crypto-theme')).toBe('light');
  });

  it('restores theme from localStorage', () => {
    localStorage.setItem('crypto-theme', 'light');
    render(<ThemeProvider><TestConsumer /></ThemeProvider>);
    expect(screen.getByTestId('mode').textContent).toBe('light');
  });
});
