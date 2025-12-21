import NextAuth, { DefaultSession } from "next-auth"
import { JWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string; 
      role: string;
      deptId: string;
      division: string; // Made required as your dashboard relies on it
      batch?: string;
      academicYear: string; // Added to resolve targeting errors
    } & DefaultSession["user"]
  }

  interface User {
    id: string;
    username: string;
    role: string;
    deptId: string;
    programId?: string; // Added to match your authorize return object
    division?: string;
    batch?: string;
    academicYear?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    username: string;
    role: string;
    deptId: string;
    division?: string;
    batch?: string;
    academicYear?: string; // Added to persist data between login and session
  }
}