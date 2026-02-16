import { describe, it, expect } from 'vitest';
import { formatCurrency, formatPrice, formatNumber } from '../components/FormatNumber';

describe('formatCurrency', () => {
  it('formats trillions', () => {
    expect(formatCurrency(1_500_000_000_000)).toBe('$1.50T');
  });

  it('formats billions', () => {
    expect(formatCurrency(2_300_000_000)).toBe('$2.30B');
  });

  it('formats millions', () => {
    expect(formatCurrency(45_600_000)).toBe('$45.60M');
  });

  it('formats thousands', () => {
    expect(formatCurrency(12_345)).toBe('$12.35K');
  });

  it('formats regular numbers', () => {
    expect(formatCurrency(99.99)).toBe('$99.99');
  });

  it('formats small numbers with precision', () => {
    expect(formatCurrency(0.005432)).toBe('$0.005432');
  });
});

describe('formatPrice', () => {
  it('formats prices >= 1 with 2 decimals', () => {
    expect(formatPrice(42567.89)).toBe('$42,567.89');
  });

  it('formats small prices with precision', () => {
    expect(formatPrice(0.00345)).toBe('$0.003450');
  });
});

describe('formatNumber', () => {
  it('formats with commas', () => {
    expect(formatNumber(1234567)).toBe('1,234,567');
  });

  it('formats zero', () => {
    expect(formatNumber(0)).toBe('0');
  });
});
