import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import connectDB from "./db";
import User from "@/models/User";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        await connectDB();

        const user = await User.findOne({ username: credentials.username });

        if (!user || !user.password) {
          throw new Error("User not found");
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);

        if (!isValid) {
          throw new Error("Invalid password");
        }

        // Return user data to be stored in the JWT
        return {
          id: user._id.toString(),
          username: user.username,
          role: user.role,
          rollNo: user.rollNo,          // 🔥 ADD THIS
          deptId: user.deptId?.toString(),
          division: user.division, // For Student filtering
          batch: user.batch,       // For Student filtering
          academicYear: user.academicYear, // include academicYear so it persists
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      await connectDB();

      // Initial login
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.rollNo = user.rollNo;
        token.role = user.role;
        token.deptId = user.deptId;
        token.division = user.division;
        token.batch = user.batch;
        token.academicYear = user.academicYear;
        return token;
      }

      // 🔥 IMPORTANT: Refresh token data from DB on every session update
      if (token?.id) {
        const dbUser = await User.findById(token.id).lean();

        if (dbUser) {
          token.username = dbUser.username;
          token.rollNo = dbUser.rollNo;
          token.role = dbUser.role;
          token.deptId = dbUser.deptId?.toString();
          token.division = dbUser.division;
          token.batch = dbUser.batch;
          token.academicYear = dbUser.academicYear;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
        session.user.rollNo = token.rollNo as string;
        session.user.role = token.role as string;
        session.user.deptId = token.deptId as string;
        session.user.division = token.division as string;
        session.user.batch = token.batch as string;
        session.user.academicYear = token.academicYear as string;
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  },
};