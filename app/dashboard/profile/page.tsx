import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { User, Mail, Calendar } from "lucide-react";
import Image from "next/image";
import { redirect } from "next/navigation";
import { Session } from "next-auth";

// Extend the Session type to include the user.id
interface CustomSession {
    user?: {
        id?: string | null;
        name?: string | null;
        email?: string | null;
        image?: string | null;
    };
}

export default async function ProfilePage() {
    const session = (await getServerSession(authOptions)) as CustomSession;

    // Explicitly check for session and user before proceeding
    if (!session || !session.user) {
        redirect("/login"); // Redirect to login if session or user is missing
    }

    const user = session.user;

    return (
        <div className="space-y-8 max-w-xl">
            <div>
                <h1 className="text-2xl font-bold text-white">Profile</h1>
                <p className="text-sm text-[var(--color-neon-muted)] mt-1">Your Vura account information.</p>
            </div>

            <div className="glass-card p-6 space-y-6">
                {/* Avatar */}
                <div className="flex items-center gap-5">
                    {user.image ? (
                        <Image src={user.image} alt="Avatar" width={72} height={72} className="rounded-full border-2 border-[var(--color-neon-primary)]/50" />
                    ) : (
                        <div className="w-18 h-18 w-[72px] h-[72px] rounded-full bg-[var(--color-neon-primary)]/20 border-2 border-[var(--color-neon-primary)]/30 flex items-center justify-center">
                            <User className="w-8 h-8 text-[var(--color-neon-primary)]" />
                        </div>
                    )}
                    <div>
                        <p className="text-xl font-bold text-white">{user.name ?? "Unnamed User"}</p>
                        <p className="text-sm text-[var(--color-neon-muted)]">Vura Member</p>
                    </div>
                </div>

                <div className="divide-y divide-[var(--color-neon-border)]">
                    {[ 
                        { icon: <User className="w-4 h-4" />, label: "Name", value: user.name ?? "—" },
                        { icon: <Mail className="w-4 h-4" />, label: "Email", value: user.email ?? "—" },
                        { icon: <Calendar className="w-4 h-4" />, label: "Auth Method", value: user.image ? "Google OAuth" : "Email & Password" },
                    ].map(row => (
                        <div key={row.label} className="flex items-center gap-4 py-4">
                            <span className="text-[var(--color-neon-muted)]">{row.icon}</span>
                            <span className="text-sm text-[var(--color-neon-muted)] w-28 shrink-0">{row.label}</span>
                            <span className="text-sm text-white font-medium truncate">{row.value}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="glass-card p-5 border-amber-400/20 bg-amber-400/5">
                <p className="text-sm text-amber-400 font-medium mb-1">Want to change your password?</p>
                <p className="text-xs text-[var(--color-neon-muted)]">Password changes are not yet available in the dashboard. Contact support at <a href="mailto:dev.om@outlook.com" className="text-white hover:underline">dev.om@outlook.com</a>.</p>
            </div>
        </div>
    );
}
