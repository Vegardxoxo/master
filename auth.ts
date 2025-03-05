import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "@/auth.config";
import { z } from "zod";
import { User } from "@/app/lib/definitions";

const mockUser: User = {
  id: "1",
  email: "coolboy@gmail.com",
  name: "Cool McBoy",
  password: "password123",
};

export async function getUser(email: string): Promise<User | undefined> {
  if (email === mockUser.email) return mockUser;
  return undefined;
}

export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
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
          const passwordsMatch = password === user.password;
          if (passwordsMatch) return user;
        }
        console.log("Invalid credentials");
        return null;
      },
    }),
  ],
});
