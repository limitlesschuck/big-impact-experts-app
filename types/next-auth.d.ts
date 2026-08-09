import { DefaultSession, DefaultUser } from "next-auth";
import { DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      userType: "admin" | "member";
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role: string;
    userType: "admin" | "member";
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    role: string;
    userType: "admin" | "member";
  }
}
