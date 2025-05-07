import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import axiosInstance from "@/lib/axios";

export async function GET(req: NextRequest) {
  try {
    // Get the current token
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    
    if (!token || !token.refreshToken) {
      return NextResponse.json(
        { error: "No refresh token found" },
        { status: 401 }
      );
    }
    
    // Call the backend to get a new access token
    const response = await axiosInstance.post('/refresh-token', {
      refreshToken: token.refreshToken,
    });
    
    if (!response.data || !response.data.accessToken) {
      return NextResponse.json(
        { error: "Failed to refresh token" },
        { status: 401 }
      );
    }
    
    // We need to manually update the session/cookie here
    // This is a simplified approach - in a real app, you'd update the session securely
    
    return NextResponse.json({
      success: true,
      accessToken: response.data.accessToken,
    });
  } catch (error) {
    console.error("Token refresh error:", error);
    return NextResponse.json(
      { error: "Server error during token refresh" },
      { status: 500 }
    );
  }
}