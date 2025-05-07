'use client';

import { useQuery } from '@tanstack/react-query';
import { Course } from '@/lib/server-query';
import { authAxiosInstance } from '@/lib/axios';
import CourseCard from './course-card';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function CourseList() {
  const { toast } = useToast();
  
  const { data: courses, isLoading, isError, error, refetch } = useQuery<Course[]>({
    queryKey: ['courses'],
    queryFn: async () => {
      try {
        const response = await authAxiosInstance.get('/courses');
        return response.data;
      } catch (error: any) {
        console.error('Error fetching courses:', error);
        throw new Error(error.message || 'Failed to fetch courses');
      }
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading courses...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <p className="text-destructive mb-4">
          {error instanceof Error ? error.message : 'Failed to load courses'}
        </p>
        <Button 
          onClick={() => refetch()} 
          variant="outline"
          data-testid="retry-button"
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (!courses || courses.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">No courses available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="course-list">
      {courses.map((course) => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  );
}