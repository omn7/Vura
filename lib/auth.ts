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

    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        }),

        CredentialsProvider({
            name: "Credentials",

            credentials: {
                email: {
                    label: "Email",
                    type: "email",
                },

                password: {
                    label: "Password",
                    type: "password",
                },
            },

            async authorize(credentials, req) {
                const email =
                    typeof credentials?.email === "string"
                        ? credentials.email
                        : "anonymous";
                const rateLimitKey = getRateLimitKey(
                    "login",
                    email,
                    req?.headers
                );

                const blockStatus = isBlocked(rateLimitKey);
                if (blockStatus.blocked) {
                    throw new Error(AUTH_RATE_LIMIT_MESSAGE);
                }

                const parsed = loginSchema.safeParse(credentials);

                if (!parsed.success) {
                    recordFailedAttempt(rateLimitKey);
                    throw new Error(
                        parsed.error.issues[0].message
                    );
                }

                const user = await prisma.user.findUnique({
                    where: {
                        email: parsed.data.email.toLowerCase(),
                    },
                });

                if (!user || !user.password) {
                    recordFailedAttempt(rateLimitKey);
                    return null;
                }

                const isPasswordValid =
                    await bcrypt.compare(
                        parsed.data.password,
                        user.password
                    );

                if (!isPasswordValid) {
                    recordFailedAttempt(rateLimitKey);
                    return null;
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
