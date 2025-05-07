// Import necessary setup files
import '@testing-library/jest-dom';
import { TextDecoder, TextEncoder } from 'util';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
  }),
  usePathname: () => '/current-path',
  useSearchParams: () => new URLSearchParams(),
  redirect: jest.fn(),
}));

// Mock next-auth
jest.mock('next-auth/react', () => ({
  signIn: jest.fn(),
  signOut: jest.fn(),
  useSession: jest.fn(() => ({ 
    data: null, 
    status: 'unauthenticated' 
  })),
}));

// Mock the theme provider
jest.mock('next-themes', () => ({
  useTheme: () => ({
    theme: 'light',
    setTheme: jest.fn(),
  }),
}));

// Add globals that Next.js requires
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Suppress React 18 console errors for act warnings
const originalError = console.error;
console.error = (...args) => {
  if (/Warning: ReactDOM.render is no longer supported/.test(args[0])) {
    return;
  }
  if (/Warning: An update to Components/.test(args[0])) {
    return;
  }
  originalError.call(console, ...args);
};