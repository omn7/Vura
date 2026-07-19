import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest } from "next/server";

if (process.env.NODE_ENV === "production") {
  process.env.NEXTAUTH_URL = "https://vurakit.in";
}

const handler = NextAuth(authOptions);

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, context: any) {
  return (handler as any)(request, context);
}

export async function POST(request: NextRequest, context: any) {
  return (handler as any)(request, context);
}
