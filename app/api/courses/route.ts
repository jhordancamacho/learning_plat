import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { authAxiosInstance } from "@/lib/axios";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.accessToken) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }
    
    const response = await authAxiosInstance.get('/courses', {
      headers: {
        Authorization: `Bearer ${session.accessToken}`
      }
    });
    
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("Courses API error:", error);
    
    return NextResponse.json(
      { error: error.message || "Failed to fetch courses" },
      { status: error.response?.status || 500 }
    );
  }
}