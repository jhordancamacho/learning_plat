import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SessionProvider } from 'next-auth/react';
import LoginForm from '@/components/login-form';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

// Mock next-auth
jest.mock('next-auth/react', () => ({
  signIn: jest.fn(),
  useSession: jest.fn(() => ({ data: null, status: 'unauthenticated' })),
  SessionProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  redirect: jest.fn(),
}));

// Mock toast
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

describe('Authentication Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup router mock
    const mockRouter = {
      push: jest.fn(),
      refresh: jest.fn(),
    };
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  it('completes the login flow successfully', async () => {
    // Mock successful authentication
    (signIn as jest.Mock).mockResolvedValue({ error: null });
    
    render(
      <SessionProvider>
        <LoginForm />
      </SessionProvider>
    );
    
    const user = userEvent.setup();
    
    // Fill in login form
    await user.type(screen.getByTestId('email-input'), 'user@example.com');
    await user.type(screen.getByTestId('password-input'), 'password123');
    
    // Submit form
    await user.click(screen.getByTestId('login-button'));
    
    // Verify authentication was attempted
    await waitFor(() => {
      expect(signIn).toHaveBeenCalledWith('credentials', {
        email: 'user@example.com',
        password: 'password123',
        redirect: false,
      });
    });
    
    // Verify redirect to courses page
    const router = useRouter();
    await waitFor(() => {
      expect(router.push).toHaveBeenCalledWith('/courses');
      expect(router.refresh).toHaveBeenCalled();
    });
  });

  it('shows error for failed login attempt', async () => {
    // Mock failed authentication
    (signIn as jest.Mock).mockResolvedValue({ error: 'Invalid credentials' });
    
    render(
      <SessionProvider>
        <LoginForm />
      </SessionProvider>
    );
    
    const user = userEvent.setup();
    
    // Fill in login form with invalid credentials
    await user.type(screen.getByTestId('email-input'), 'invalid@example.com');
    await user.type(screen.getByTestId('password-input'), 'wrongpassword');
    
    // Submit form
    await user.click(screen.getByTestId('login-button'));
    
    // Verify authentication was attempted
    await waitFor(() => {
      expect(signIn).toHaveBeenCalledWith('credentials', {
        email: 'invalid@example.com',
        password: 'wrongpassword',
        redirect: false,
      });
    });
    
    // Verify no redirect occurred
    const router = useRouter();
    await waitFor(() => {
      expect(router.push).not.toHaveBeenCalled();
    });
  });

  it('validates form inputs before submission', async () => {
    render(
      <SessionProvider>
        <LoginForm />
      </SessionProvider>
    );
    
    const user = userEvent.setup();
    
    // Try to submit without entering anything
    await user.click(screen.getByTestId('login-button'));
    
    // Check for validation messages
    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
    });
    
    // Verify sign in was not called
    expect(signIn).not.toHaveBeenCalled();
  });
});