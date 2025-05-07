import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import CourseList from "@/components/course-list";
import { authAxiosInstance } from "@/lib/axios";

// Mock axios
jest.mock("@/lib/axios", () => ({
  authAxiosInstance: {
    get: jest.fn(),
  },
}));

// Mock toast hook
jest.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

const mockCourses = [
  {
    id: "1",
    title: "React Fundamentals",
    description: "Learn the basics of React",
    level: "Beginner",
    duration: "2 hours",
    price: 0,
  },
  {
    id: "2",
    title: "Advanced TypeScript",
    description: "Master TypeScript for large applications",
    level: "Advanced",
    duration: "5 hours",
    price: 49.99,
  },
];

describe("CourseList Component", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    jest.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
  });

  it("renders loading state initially", async () => {
    (authAxiosInstance.get as jest.Mock).mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve({ data: mockCourses }), 100)
        )
    );

    render(
      <QueryClientProvider client={queryClient}>
        <CourseList />
      </QueryClientProvider>
    );

    expect(screen.getByText(/loading courses/i)).toBeInTheDocument();
  });

  it("renders courses when data is loaded", async () => {
    (authAxiosInstance.get as jest.Mock).mockResolvedValue({
      data: mockCourses,
    });

    render(
      <QueryClientProvider client={queryClient}>
        <CourseList />
      </QueryClientProvider>
    );

    // Wait for courses to load
    await waitFor(() => {
      expect(screen.getByTestId("course-list")).toBeInTheDocument();
    });

    // Check if course titles are displayed
    expect(screen.getByText("React Fundamentals")).toBeInTheDocument();
    expect(screen.getByText("Advanced TypeScript")).toBeInTheDocument();
  });

  it("displays error message when fetching fails", async () => {
    (authAxiosInstance.get as jest.Mock).mockRejectedValue(
      new Error("Failed to fetch courses")
    );

    render(
      <QueryClientProvider client={queryClient}>
        <CourseList />
      </QueryClientProvider>
    );

    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText("Failed to fetch courses")).toBeInTheDocument();
    });

    // Check if retry button is present
    expect(screen.getByTestId("retry-button")).toBeInTheDocument();
  });

  it("retries fetching when retry button is clicked", async () => {
    (authAxiosInstance.get as jest.Mock).mockRejectedValueOnce(
      new Error("Failed to fetch courses")
    );

    render(
      <QueryClientProvider client={queryClient}>
        <CourseList />
      </QueryClientProvider>
    );

    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText("Failed to fetch courses")).toBeInTheDocument();
    });

    // Setup user event
    const user = userEvent.setup();

    // Mock successful response for retry
    (authAxiosInstance.get as jest.Mock).mockResolvedValueOnce({
      data: mockCourses,
    });

    // Click retry button
    await user.click(screen.getByTestId("retry-button"));

    // Verify the refetch was triggered
    expect(authAxiosInstance.get).toHaveBeenCalledTimes(2);

    // Wait for courses to load after retry
    await waitFor(() => {
      expect(screen.getByTestId("course-list")).toBeInTheDocument();
    });
  });

  it("displays empty state when no courses are available", async () => {
    (authAxiosInstance.get as jest.Mock).mockResolvedValue({ data: [] });

    render(
      <QueryClientProvider client={queryClient}>
        <CourseList />
      </QueryClientProvider>
    );

    // Wait for empty state message
    await waitFor(() => {
      expect(screen.getByText(/no courses available/i)).toBeInTheDocument();
    });
  });
});
