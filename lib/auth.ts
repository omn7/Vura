import { NextAuthOptions, Session, User as NextAuthUser } from "next-auth";
import { JWT } from "next-auth/jwt";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { loginSchema } from "@/lib/validations";

if (process.env.NODE_ENV === "production") {
    process.env.NEXTAUTH_URL = "https://vurakit.in";
}

import {
    clearFailedAttempts,
    // getRateLimitKey, // Not directly used in this file for IP extraction
    isBlocked,
    recordFailedAttempt,
    AUTH_RATE_LIMIT_MESSAGE,
} from "@/lib/rate-limit";

// Extend NextAuth's User type to include 'id' explicitly for session/jwt callbacks
declare module "next-auth" {
    interface User {
        id: string;
    }
    interface Session {
        user: User & { id: string };
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id?: string;
    }
}

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma) as any, // This cast is often necessary due to adapter types, ensure Prisma models match

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

            authorize: async (credentials: Record<string, string> | undefined, req: any) => {
                // Always return null or generic error to prevent user enumeration
                const failAuth = () => {
                    // recordFailedAttempt is called before returning null to ensure rate limiting works
                    recordFailedAttempt(rateLimitKey); 
                    return null; // Return null for generic NextAuth error message
                }

                if (!credentials || !credentials.email || !credentials.password) {
                    // No explicit rate limiting here, as email is not fully trusted yet
                    return null; 
                }

                // --- Robust IP extraction for Rate Limiting ---
                // Be aware that `x-forwarded-for` can be spoofed. For production, 
                // use a trusted proxy to set specific headers or retrieve client IP more reliably.
                const forwardedFor = req?.headers?.["x-forwarded-for"];
                let ip = "unknown";

                if (typeof forwardedFor === 'string') {
                    ip = forwardedFor.split(',')[0].trim();
                } else if (Array.isArray(forwardedFor)) {
                    ip = forwardedFor[0]?.trim() || "unknown";
                }
                // Combine IP with email for a more specific rate limit key
                const rateLimitKey = `${ip}:${credentials.email.toLowerCase()}`;

                const blockStatus = isBlocked(rateLimitKey);
                if (blockStatus.blocked) {
                    // Optionally, log this attempt for monitoring
                    console.warn(`Rate limit blocked for ${credentials.email} (IP: ${ip})`);
                    // Returning null prevents further processing and NextAuth will show a generic error
                    throw new Error(AUTH_RATE_LIMIT_MESSAGE); // Throwing for explicit error message to user
                }

                // Validate input shape using Zod (server-side validation)
                const parsed = loginSchema.safeParse(credentials);

                if (!parsed.success) {
                    // Log the validation error internally but return a generic error to the client
                    console.warn(`Invalid credentials schema for ${credentials.email}:`, parsed.error.issues);
                    // Throw a generic error or return null to avoid leaking validation specifics
                    throw new Error("Invalid email or password."); 
                }

                const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
                if (!user || !user.password) {
                    return failAuth(); // User not found or no password set (e.g., OAuth user without credential password)
                }

                const isPasswordValid = await bcrypt.compare(parsed.data.password, user.password);
                if (!isPasswordValid) {
                    return failAuth(); // Incorrect password
                }

                // If login is successful, clear any failed attempt records for this key
                clearFailedAttempts(rateLimitKey);

                // Return the user object, ensuring it has an 'id' property
                return { id: user.id, name: user.name, email: user.email }; // Explicitly return only necessary user data
            },
        }),
    ],

    session: {
        strategy: "jwt",
    },

    callbacks: {
        async session({ session, token }: any) {
            if (session.user && token.sub) {
                session.user.id = token.sub; // Ensure user.id is set in session
            }
            return session;
        },

        async jwt({ token, user }: any) {
            if (user) {
                token.id = user.id; // Store user.id in JWT token
            }
            return token;
        },

        // Custom redirect for errors to ensure generic messages
        async redirect({ url, baseUrl }: any) {
            if (url.startsWith(baseUrl)) return url;
            // Allows relative callback URLs
            else if (url.startsWith('/')) return `${baseUrl}${url}`;
            // Handle other external URLs or malicious attempts. Consider redirecting to a generic error page or login.
            return baseUrl; 
        }
    },
    pages: {
        signIn: '/login',
        error: '/login', // Redirect all errors back to the login page
    }
};
