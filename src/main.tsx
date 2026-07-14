import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';

// Mock localStorage and sessionStorage to prevent SecurityError in restricted iframes (like AI Studio preview)
try {
  const x = window.localStorage;
  x.getItem('test');
  const y = window.sessionStorage;
  y.getItem('test');
} catch (e) {
  console.warn("Storage is blocked. Using in-memory fallback.");
  const createMockStorage = () => {
    const memoryStorage = new Map<string, string>();
    return {
      getItem: (key: string) => memoryStorage.get(key) || null,
      setItem: (key: string, value: string) => memoryStorage.set(key, value.toString()),
      removeItem: (key: string) => memoryStorage.delete(key),
      clear: () => memoryStorage.clear(),
      length: 0,
      key: (index: number) => Array.from(memoryStorage.keys())[index] || null
    };
  };
  
  Object.defineProperty(window, 'localStorage', {
    value: createMockStorage(),
    writable: true,
    configurable: true,
    enumerable: true
  });
  
  Object.defineProperty(window, 'sessionStorage', {
    value: createMockStorage(),
    writable: true,
    configurable: true,
    enumerable: true
  });
}

import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
