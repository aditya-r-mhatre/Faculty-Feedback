import NextAuth, { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string;
      rollNo?: string; // 🔥 ADD
      role: "ADMIN" | "HOD" | "FACULTY" | "STUDENT";
      deptId?: string;
      division?: string;
      batch?: string;
      academicYear?: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    username: string;
    rollNo?: string; // 🔥 ADD
    role: "ADMIN" | "HOD" | "FACULTY" | "STUDENT";
    deptId?: string;
    programId?: string;
    division?: string;
    batch?: string;
    academicYear?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    username: string;
    rollNo?: string; // 🔥 ADD
    role: "ADMIN" | "HOD" | "FACULTY" | "STUDENT";
    deptId?: string;
    division?: string;
    batch?: string;
    academicYear?: string;
  }
}
