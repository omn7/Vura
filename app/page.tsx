import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import LandingContent from "@/components/LandingContent";

export default async function LandingPage() {
  let session = null;
  try {
    session = await getServerSession(authOptions);
  } catch (error) {
    console.warn("Session decryption error, treating as unauthenticated:", error);
  }

  return <LandingContent session={session} />;
}
