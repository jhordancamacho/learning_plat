import Image from 'next/image';
import Link from 'next/link';
import { Course } from '@/lib/server-query';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Clock, BookOpen } from 'lucide-react';

interface CourseCardProps {
  course: Course;
}

export default function CourseCard({ course }: CourseCardProps) {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg" data-testid={`course-${course.id}`}>
      <div className="aspect-video relative overflow-hidden">
        {course.imageUrl ? (
          <Image
            src={course.imageUrl}
            alt={course.title}
            fill
            className="object-cover transition-transform hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <BookOpen className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
      </div>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="line-clamp-1">{course.title}</CardTitle>
          {course.level && (
            <Badge variant="outline" className="ml-2">
              {course.level}
            </Badge>
          )}
        </div>
        <CardDescription className="line-clamp-2">{course.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center text-sm text-muted-foreground">
          {course.duration && (
            <div className="flex items-center mr-4">
              <Clock className="mr-1 h-4 w-4" />
              <span>{course.duration}</span>
            </div>
          )}
          {course.price !== undefined && (
            <div className="font-medium text-primary ml-auto">
              {course.price === 0 ? 'Free' : `$${course.price.toFixed(2)}`}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link href={`/courses/${course.id}`}>View Course</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}