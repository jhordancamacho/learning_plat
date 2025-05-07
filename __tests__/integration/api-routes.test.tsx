import { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import axiosInstance from '@/lib/axios';
import { GET } from '@/app/api/courses/route';
import { GET as refreshTokenHandler } from '@/app/api/auth/refresh/route';

// Mock dependencies
jest.mock('next-auth/jwt', () => ({
  getToken: jest.fn(),
}));

jest.mock('@/lib/axios', () => ({
  default: {
    post: jest.fn(),
  },
  authAxiosInstance: {
    get: jest.fn(),
  },
}));

describe('API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('/api/courses route', () => {
    it('returns 401 when not authenticated', async () => {
      // Mock no session by not mocking getServerSession
      
      const mockRequest = new NextRequest('http://localhost:3000/api/courses');
      const response = await GET(mockRequest);
      
      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBe('Not authenticated');
    });

    it('fetches courses when authenticated', async () => {
      // Mock authentication
      const mockSession = {
        accessToken: 'mock-token',
      };
      
      // Mock fetch session instead of getServerSession
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSession),
      } as unknown as Response);
      
      // Mock successful API response
      const mockCourses = [
        { id: '1', title: 'Course 1' },
        { id: '2', title: 'Course 2' },
      ];
      
      // Mocking authAxiosInstance.get to return mock courses
      require('@/lib/axios').authAxiosInstance.get.mockResolvedValueOnce({
        data: mockCourses,
      });
      
      const mockRequest = new NextRequest('http://localhost:3000/api/courses');
      const response = await GET(mockRequest);
      
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual(mockCourses);
    });
  });

  describe('/api/auth/refresh route', () => {
    it('returns 401 when no refresh token found', async () => {
      // Mock no token
      (getToken as jest.Mock).mockResolvedValueOnce(null);
      
      const mockRequest = new NextRequest('http://localhost:3000/api/auth/refresh');
      const response = await refreshTokenHandler(mockRequest);
      
      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBe('No refresh token found');
    });

    it('successfully refreshes token', async () => {
      // Mock token with refresh token
      (getToken as jest.Mock).mockResolvedValueOnce({
        refreshToken: 'mock-refresh-token',
      });
      
      // Mock successful token refresh
      (axiosInstance.post as jest.Mock).mockResolvedValueOnce({
        data: {
          accessToken: 'new-access-token',
        },
      });
      
      const mockRequest = new NextRequest('http://localhost:3000/api/auth/refresh');
      const response = await refreshTokenHandler(mockRequest);
      
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.accessToken).toBe('new-access-token');
    });

    it('handles token refresh failure', async () => {
      // Mock token with refresh token
      (getToken as jest.Mock).mockResolvedValueOnce({
        refreshToken: 'mock-refresh-token',
      });
      
      // Mock failed token refresh
      (axiosInstance.post as jest.Mock).mockRejectedValueOnce(
        new Error('Failed to refresh token')
      );
      
      const mockRequest = new NextRequest('http://localhost:3000/api/auth/refresh');
      const response = await refreshTokenHandler(mockRequest);
      
      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error).toBe('Server error during token refresh');
    });
  });
});