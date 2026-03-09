"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

export default function ResetPasswordPage({ params }: { params: Promise<{ token: string }> }) {
    const router = useRouter();
    // React 19 uses 'use' hook for unboxing params
    const resolvedParams = use(params);
    const token = resolvedParams.token;

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            setLoading(false);
            return;
        }

        try {
            const res = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Something went wrong.");
            }

            setSuccess("Password reset successfully. Redirecting to login...");

            setTimeout(() => {
                router.push("/login");
            }, 3000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="flex-1 flex flex-col items-center justify-center min-h-screen p-6 relative z-10">
            <div className="glow-bg" style={{ top: "10%" }}></div>

            <div className="w-full max-w-md glass-card p-10 flex flex-col items-center text-center relative z-10 shadow-2xl">
                <Link href="/" className="text-[var(--color-neon-primary)] font-bold text-2xl mb-8 tracking-widest uppercase flex items-center gap-2 hover:opacity-80 transition-opacity">
                    <div className="w-8 h-8 rounded-lg bg-[var(--color-neon-primary)] flex items-center justify-center">
                        <div className="w-3 h-3 bg-black rounded-sm rotate-45 transform"></div>
                    </div>
                    Vura
                </Link>

                <h1 className="text-3xl font-extrabold mb-2 text-white">Set New Password</h1>
                <p className="text-[var(--color-neon-muted)] mb-8 text-sm">
                    Enter your new password below.
                </p>

                {error && (
                    <div className="w-full mb-6 p-4 rounded-xl bg-red-900/20 border border-red-500/50 flex items-start text-red-200">
                        <AlertCircle className="w-5 h-5 mr-3 shrink-0 mt-0.5 text-red-400" />
                        <p className="text-sm text-left">{error}</p>
                    </div>
                )}

                {success && (
                    <div className="w-full mb-6 p-4 rounded-xl bg-green-900/20 border border-green-500/50 flex items-start text-green-200">
                        <CheckCircle2 className="w-5 h-5 mr-3 shrink-0 mt-0.5 text-green-400" />
                        <p className="text-sm text-left">{success}</p>
                    </div>
                )}

                <form onSubmit={handleResetPassword} className="w-full flex flex-col gap-4">
                    <div className="text-left">
                        <label className="text-xs text-[var(--color-neon-muted)] ml-1">New Password</label>
                        <input
                            type="password"
                            required
                            minLength={6}
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="w-full mt-1 bg-[var(--color-neon-bg)] border border-[var(--color-neon-border)] rounded-xl py-3 px-4 focus:ring-2 focus:ring-[var(--color-neon-primary)] outline-none"
                            placeholder="••••••••"
                        />
                    </div>

                    <div className="text-left">
                        <label className="text-xs text-[var(--color-neon-muted)] ml-1">Confirm New Password</label>
                        <input
                            type="password"
                            required
                            minLength={6}
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            className="w-full mt-1 bg-[var(--color-neon-bg)] border border-[var(--color-neon-border)] rounded-xl py-3 px-4 focus:ring-2 focus:ring-[var(--color-neon-primary)] outline-none"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full btn-primary py-4 mt-2 text-lg disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin text-black" /> : "Reset Password"}
                    </button>
                </form>

                <div className="mt-8 text-sm text-[var(--color-neon-muted)]">
                    <Link href="/login" className="text-[var(--color-neon-primary)] hover:underline">Back to Login</Link>
                </div>
            </div>
        </main>
    );
}
