import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as NextAuthOptions["adapter"],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/admin/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log("[DEBUG-LOGIN] missing email or password in submitted credentials");
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        console.log(
          "[DEBUG-LOGIN] lookup for email:",
          JSON.stringify(credentials.email),
          "-> user found:",
          !!user,
          user ? `(role: ${user.role}, has password hash: ${!!user.password}, hash length: ${user.password?.length ?? 0})` : ""
        );

        if (!user || !user.password) {
          console.log("[DEBUG-LOGIN] no user or no stored password hash, returning null");
          return null;
        }

        const passwordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        console.log("[DEBUG-LOGIN] bcrypt.compare result:", passwordValid);

        if (!passwordValid) {
          console.log("[DEBUG-LOGIN] password did not match stored hash, returning null");
          return null;
        }

        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.email = token.email ?? session.user.email;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.role = (user as { role?: string }).role ?? "viewer";
      }
      return token;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
