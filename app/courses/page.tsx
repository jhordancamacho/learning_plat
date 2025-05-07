import { Metadata } from "next";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import CourseList from "@/components/course-list";
import { dehydrate } from "@tanstack/react-query";
import { getQueryClient, fetchCourses } from "@/lib/server-query";
import { Suspense } from "react";
import { CourseListSkeleton } from "@/components/course-list-skeleton";
import { HydrationBoundary } from "@tanstack/react-query";

export const metadata: Metadata = {
  title: "Courses | Course Platform",
  description: "Browse available courses",
};

export default async function CoursesPage() {
  // Pre-fetch courses data on the server
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: ["courses"],
    queryFn: () => fetchCourses(),
  });

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">Available Courses</h1>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<CourseListSkeleton />}>
          <CourseList />
        </Suspense>
      </HydrationBoundary>
    </div>
  );
}
