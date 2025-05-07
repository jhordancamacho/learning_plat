import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginForm from '@/components/login-form';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

// Mock dependencies
jest.mock('next-auth/react', () => ({
  signIn: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock toast hook
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

describe('LoginForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup router mock
    const mockRouter = {
      push: jest.fn(),
      refresh: jest.fn(),
    };
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  it('renders the login form correctly', () => {
    render(<LoginForm />);
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('validates form inputs', async () => {
    render(<LoginForm />);
    const user = userEvent.setup();
    
    // Submit form without entering any data
    await user.click(screen.getByRole('button', { name: /login/i }));
    
    // Check for validation errors
    expect(await screen.findByText(/please enter a valid email address/i)).toBeInTheDocument();
    expect(await screen.findByText(/password must be at least 6 characters/i)).toBeInTheDocument();
  });

  it('submits the form with valid data', async () => {
    (signIn as jest.Mock).mockResolvedValue({ error: null });
    
    render(<LoginForm />);
    const user = userEvent.setup();
    
    // Fill form
    await user.type(screen.getByTestId('email-input'), 'test@example.com');
    await user.type(screen.getByTestId('password-input'), 'password123');
    
    // Submit form
    await user.click(screen.getByTestId('login-button'));
    
    // Check if signIn was called with correct params
    await waitFor(() => {
      expect(signIn).toHaveBeenCalledWith('credentials', {
        email: 'test@example.com',
        password: 'password123',
        redirect: false,
      });
    });
    
    // Check navigation
    const router = useRouter();
    await waitFor(() => {
      expect(router.push).toHaveBeenCalledWith('/courses');
      expect(router.refresh).toHaveBeenCalled();
    });
  });

  it('handles login error correctly', async () => {
    (signIn as jest.Mock).mockResolvedValue({ error: 'Invalid credentials' });
    
    render(<LoginForm />);
    const user = userEvent.setup();
    
    // Fill form
    await user.type(screen.getByTestId('email-input'), 'test@example.com');
    await user.type(screen.getByTestId('password-input'), 'password123');
    
    // Submit form
    await user.click(screen.getByTestId('login-button'));
    
    // Check that router was not called when error occurred
    const router = useRouter();
    await waitFor(() => {
      expect(router.push).not.toHaveBeenCalled();
    });
  });
});