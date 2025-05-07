import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import axiosInstance from "./axios";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        console.log("🚀 ~ authorize ~ credentials:", credentials)
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        try {
          const response = await axiosInstance.post('auth/login/', {
            username: credentials.username,
            password: credentials.password,
          });
          console.log("🚀 ~ authorize ~ response:", response)

          if (response.data) {
            return {
              id: response.data.id || "user-id",
              email: credentials.username,
              name: response.data.name || credentials.username,
              accessToken: response.data.accessToken,
              refreshToken: response.data.refreshToken,
            };
          }
          
          return null;
        } catch (error) {
          console.error("Authentication error:", error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Initial sign in
      if (user) {
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.email = user.email;
      }
      
      // Return previous token if the access token has not expired yet
      // Note: In a real implementation, you would check the expiry time
      return token;
    },
    async session({ session, token }) {
      // Send properties to the client
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      session.user = {
        name: token.name,
        email: token.email,
      };
      
      return session;
    }
  },
  pages: {
    signIn: "/login",
    error: "/login", // Error code passed in query string as ?error=
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};

// Add type augmentation for NextAuth session
declare module "next-auth" {
  interface User {
    accessToken?: string;
    refreshToken?: string;
  }
  
  interface Session {
    accessToken?: string;
    refreshToken?: string;
    user: {
      name?: string | null;
      email?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
  }
}