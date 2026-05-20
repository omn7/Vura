import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { loginSchema } from "@/lib/validations";

import {
    clearFailedAttempts,
    getRateLimitKey,
    isBlocked,
    recordFailedAttempt,
    AUTH_RATE_LIMIT_MESSAGE,
} from "@/lib/rate-limit";

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma) as any,
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
        signIn: "/login",
        error: "/login",
    },

    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        }),

        CredentialsProvider({
            name: "Credentials",

            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },

            authorize: async (credentials, req) => {
                if (!credentials || !credentials.email || !credentials.password) {
                    return null;
                }

                const forwardedFor = req?.headers?.["x-forwarded-for"];
                const ip = Array.isArray(forwardedFor)
                    ? forwardedFor[0]
                    : forwardedFor?.split(",")[0] || "unknown";

                const rateLimitKey = `${ip}:${credentials.email}`;

                const blockStatus = isBlocked(rateLimitKey);
                if (blockStatus.blocked) {
                    throw new Error("Too many failed login attempts. Please try again later.");
                }
                if (blockStatus.blocked) return null;

                // Validate input shape
                const parsed = loginSchema.safeParse(credentials);

                if (!user) {
                if (!parsed.success) {
                    recordFailedAttempt(rateLimitKey);
                    throw new Error(
                        parsed.error.issues[0].message
                    );
                }

                const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
                if (!user || !user.password) {
                    recordFailedAttempt(rateLimitKey);
                    throw new Error("User not found");
                }

                if (!user.password) {
                    recordFailedAttempt(rateLimitKey);
                    throw new Error("This account uses Google sign-in. Please continue with Google.");
                }

                const isPasswordValid = await bcrypt.compare(parsed.data.password, user.password);
                if (!isPasswordValid) {
                    recordFailedAttempt(rateLimitKey);
                    throw new Error("Invalid password");
                }

                clearFailedAttempts(rateLimitKey);

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                return user as any;
            },
        }),
    ],

    session: {
        strategy: "jwt",
    },

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
};
