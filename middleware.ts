import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { TokenDataType } from "./types/token.type";
import { getToken } from "next-auth/jwt";


export async function middleware(req: NextRequest) {
  const token = await getToken({ req });

  const tokenData = token as TokenDataType | null;
  const userObj = tokenData?.user?.data;
  const is_terms_accepted =
      userObj && typeof userObj === "object" && userObj.is_terms_accepted;

  // if (req.nextUrl.pathname === "/" && is_terms_accepted) {
  //     if (token) {
  //         return NextResponse.redirect(new URL("/home", req.url));
  //     }
  // } else if (req.nextUrl.pathname !== "/" && token && !is_terms_accepted) {
  //     let url = new URL("/?terms=true", req.url);
  //     return NextResponse.redirect(url);
  // }

  // if (
  //     !req.nextUrl.pathname.startsWith("/api") &&
  //     !req.nextUrl.pathname.startsWith("/_next") &&
  //     !req.nextUrl.pathname.startsWith("/static") &&
  //     req.nextUrl.pathname !== "/"
  // ) {
  //     if (!token) {
  //         const url = new URL("/", req.url);
  //         url.searchParams.set("callbackUrl", req.nextUrl.pathname);
  //         return NextResponse.redirect(url);
  //     }
  // }

  return NextResponse.next();
}


// This function can be marked `async` if using `await` inside
export default withAuth(
  // `withAuth` augments your Request with the user's token
  {
    // callbacks: {
    //   authorized: ({ token }) => !!token, // If there is a token, the user is authorized
    // },
    pages: {
      signIn: "/login",
    },
  }
);

// Apply middleware to routes that require authentication
export const config = {
  matcher: [
    "/courses/:path*", 
    "/dashboard/:path*",
    "/api/protected/:path*"
  ],
};