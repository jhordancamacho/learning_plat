import { cache } from 'react';
import { QueryClient } from '@tanstack/react-query';
import { authAxiosInstance, axiosInstance } from './axios';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth';

// Create a QueryClient for server components
export const getQueryClient = cache(() => new QueryClient());

// Helper to fetch courses from the server 
export const fetchCourses = cache(async () => {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.accessToken) {
      throw new Error('Not authenticated');
    }
    
    const response = await authAxiosInstance.get('/courses', {
      headers: {
        Authorization: `Bearer ${session.accessToken}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching courses from server:', error);
    throw error;
  }
});

// Add type for Course
export interface Course {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  duration?: string;
  level?: string;
  price?: number;
}