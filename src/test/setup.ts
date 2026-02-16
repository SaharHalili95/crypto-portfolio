import '@testing-library/jest-dom/vitest';

// Polyfill localStorage for jsdom environments where it's not available
if (typeof globalThis.localStorage === 'undefined' || typeof globalThis.localStorage.getItem !== 'function') {
  const store = new Map<string, string>();
  const localStorageMock = {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => store.set(key, String(value)),
    removeItem: (key: string) => store.delete(key),
    clear: () => store.clear(),
    get length() { return store.size; },
    key: (index: number) => [...store.keys()][index] ?? null,
  };
  Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock, writable: true });
}
