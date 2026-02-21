"use client";

import { signIn } from "next-auth/react";
import { LogIn, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function LoginContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const registered = searchParams.get("registered");
    const authError = searchParams.get("error"); // next-auth appends this on failure

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(authError === "CredentialsSignin" ? "Invalid email or password" : "");

    const handleCredentialsLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const res = await signIn("credentials", {
            redirect: false,
            email,
            password,
        });

        if (res?.error) {
            setError("Invalid email or password");
            setLoading(false);
        } else {
            router.push("/app");
            router.refresh();
        }
    };

    return (
        <main className="flex-1 flex flex-col items-center justify-center min-h-screen p-6 relative z-10 pt-20 pb-20">
            <div className="glow-bg" style={{ top: "10%" }}></div>

            <div className="w-full max-w-md glass-card p-10 flex flex-col items-center text-center relative z-10 shadow-2xl">
                <Link href="/" className="text-[var(--color-neon-primary)] font-bold text-2xl mb-8 tracking-widest uppercase flex items-center gap-2 hover:opacity-80 transition-opacity">
                    <div className="w-8 h-8 rounded-lg bg-[var(--color-neon-primary)] flex items-center justify-center">
                        <div className="w-3 h-3 bg-black rounded-sm rotate-45 transform"></div>
                    </div>
                    Vura
                </Link>

                <h1 className="text-3xl font-extrabold mb-2 text-white">Welcome Back</h1>
                <p className="text-[var(--color-neon-muted)] mb-8 text-sm">
                    Sign in to manage and view your generated certificates.
                </p>

                {registered && (
                    <div className="w-full mb-6 p-4 rounded-xl bg-[#00e599]/10 border border-[#00e599]/30 flex items-start text-[#00e599]">
                        <p className="text-sm font-semibold">Account created! Please log in below.</p>
                    </div>
                )}

                {error && (
                    <div className="w-full mb-6 p-4 rounded-xl bg-red-900/20 border border-red-500/50 flex items-start text-red-200">
                        <AlertCircle className="w-5 h-5 mr-3 shrink-0 mt-0.5 text-red-400" />
                        <p className="text-sm text-left">{error}</p>
                    </div>
                )}

                <form onSubmit={handleCredentialsLogin} className="w-full flex flex-col gap-4 mb-6">
                    <div className="text-left">
                        <label className="text-xs text-[var(--color-neon-muted)] ml-1">Email Address</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="w-full mt-1 bg-[var(--color-neon-bg)] border border-[var(--color-neon-border)] rounded-xl py-3 px-4 focus:ring-2 focus:ring-[var(--color-neon-primary)] outline-none"
                            placeholder="john@example.com"
                        />
                    </div>
                    <div className="text-left">
                        <label className="text-xs text-[var(--color-neon-muted)] ml-1">Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="w-full mt-1 bg-[var(--color-neon-bg)] border border-[var(--color-neon-border)] rounded-xl py-3 px-4 focus:ring-2 focus:ring-[var(--color-neon-primary)] outline-none"
                            placeholder="••••••••"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full btn-secondary py-3 text-white disabled:opacity-50 flex items-center justify-center mt-2 border-[var(--color-neon-border)] hover:border-[var(--color-neon-primary)]"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In with Email"}
                    </button>
                </form>

                <div className="w-full flex items-center gap-4 mb-6">
                    <div className="flex-1 h-px bg-[var(--color-neon-border)]"></div>
                    <span className="text-xs text-[var(--color-neon-muted)] uppercase tracking-wider">Or</span>
                    <div className="flex-1 h-px bg-[var(--color-neon-border)]"></div>
                </div>

                <button
                    onClick={() => signIn("google", { callbackUrl: "/app" })}
                    className="w-full flex items-center justify-center gap-3 bg-white text-black py-3 px-6 rounded-xl font-semibold hover:bg-gray-200 transition-colors shadow-lg"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Continue with Google
                </button>

                <div className="mt-8 text-sm text-[var(--color-neon-muted)]">
                    Don't have an account? <Link href="/register" className="text-[var(--color-neon-primary)] hover:underline">Sign up</Link>
                </div>
            </div>
        </main>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center glow-bg"><Loader2 className="w-8 h-8 animate-spin text-[var(--color-neon-primary)]" /></div>}>
            <LoginContent />
        </Suspense>
    )
}
