import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "@/auth.config";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function getUser(email: string) {
  try {
    return await prisma.user.findUnique({
      where: { email },
    });
  } catch (e) {
    console.log(e);
    throw new Error("Failed to get user");
  }
}

export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
  },

  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          const user = await getUser(email);
          if (!user) return null;
          const passwordsMatch = await bcrypt.compare(password, user.password);

          if (passwordsMatch) {
            console.log(user);
            return user;
          }
        }
        console.log("Invalid credentials");
        return null;
      },
    }),
  ],
});
