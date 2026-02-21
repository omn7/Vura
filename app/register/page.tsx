"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, AlertCircle, ArrowRight } from "lucide-react";

export default function RegisterPage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Something went wrong.");
            }

            // Successfully registered, send them to login
            router.push("/login?registered=true");
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

                <h1 className="text-3xl font-extrabold mb-2 text-white">Create Account</h1>
                <p className="text-[var(--color-neon-muted)] mb-8 text-sm">
                    Register a new Vura account to start generating.
                </p>

                {error && (
                    <div className="w-full mb-6 p-4 rounded-xl bg-red-900/20 border border-red-500/50 flex items-start text-red-200">
                        <AlertCircle className="w-5 h-5 mr-3 shrink-0 mt-0.5 text-red-400" />
                        <p className="text-sm text-left">{error}</p>
                    </div>
                )}

                <form onSubmit={handleRegister} className="w-full flex flex-col gap-4">
                    <div className="text-left">
                        <label className="text-xs text-[var(--color-neon-muted)] ml-1">Full Name</label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className="w-full mt-1 bg-[var(--color-neon-bg)] border border-[var(--color-neon-border)] rounded-xl py-3 px-4 focus:ring-2 focus:ring-[var(--color-neon-primary)] outline-none"
                            placeholder="John Doe"
                        />
                    </div>

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
                            minLength={6}
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="w-full mt-1 bg-[var(--color-neon-bg)] border border-[var(--color-neon-border)] rounded-xl py-3 px-4 focus:ring-2 focus:ring-[var(--color-neon-primary)] outline-none"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full btn-primary py-4 mt-2 text-lg disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin text-black" /> : "Sign Up"}
                    </button>
                </form>

                <div className="mt-8 text-sm text-[var(--color-neon-muted)]">
                    Already have an account? <Link href="/login" className="text-[var(--color-neon-primary)] hover:underline">Log in</Link>
                </div>
            </div>
        </main>
    );
}
