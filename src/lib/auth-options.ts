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
          deptId: user.deptId?.toString(),
          division: user.division, // For Student filtering
          batch: user.batch,       // For Student filtering
          academicYear: user.academicYear, // include academicYear so it persists
        };
      },
    }),
  ],
  callbacks: {
    // Transfers user data from authorize() to the JWT token
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.deptId = user.deptId;
        token.division = user.division;
        token.batch = user.batch;
        token.academicYear = user.academicYear; // persist academicYear into token
      }
      return token;
    },
    // Makes the JWT data available in the client-side/server-side session
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.deptId = token.deptId as string;
        session.user.division = token.division as string;
        session.user.batch = token.batch as string;
        session.user.academicYear = token.academicYear as string; // expose academicYear on session.user
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  },
};