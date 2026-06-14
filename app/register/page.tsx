"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Loader2, AlertCircle } from "lucide-react";
import { signIn } from "next-auth/react";

function validate(name: string, email: string, password: string) {
    const errors: { name?: string; email?: string; password?: string } = {};

    if (!name.trim()) errors.name = "Full name is required.";

    if (!email.trim()) {
        errors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.email = "Enter a valid email address.";
    }

    if (!password) {
        errors.password = "Password is required.";
    } else if (password.length < 8) {
        errors.password = "Password must be at least 8 characters.";
    } else if (!/[A-Z]/.test(password)) {
        errors.password = "Password must contain at least one uppercase letter.";
    } else if (!/[a-z]/.test(password)) {
        errors.password = "Password must contain at least one lowercase letter.";
    } else if (!/[0-9]/.test(password)) {
        errors.password = "Password must contain at least one number.";
    } else if (!/[^A-Za-z0-9]/.test(password)) {
        errors.password = "Password must contain at least one special character.";
    }

    return errors;
}

export default function RegisterPage() {
    const router = useRouter();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [fieldErrors, setFieldErrors] = useState<{
        name?: string;
        email?: string;
        password?: string;
    }>({});

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const getAppCallbackUrl = () => {
        if (typeof window === "undefined") return "/app";
        return new URL("/app", window.location.origin).toString();
    };

    const handleGoogleLogin = async () => {
        setError("");
        try {
            await signIn("google", { callbackUrl: getAppCallbackUrl() });
        } catch (err) {
            setError("Google sign-in failed. Check the provider configuration.");
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        const errors = validate(name, email, password);
        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            return;
        }

        setFieldErrors({});
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await res.json();

            // ✅ RESOLVED CONFLICT HERE (correct priority order)
            const errorMessage =
                data.message ||
                data.error ||
                "Something went wrong. Please try again.";

            if (!res.ok) {
                console.error("Registration failed:", {
                    status: res.status,
                    data,
                });
                throw new Error(errorMessage);
            }

            router.push("/login?registered=true");
        } catch (err: any) {
            console.error("Registration request failed:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fieldClass = (hasError: boolean) =>
        `w-full mt-1 bg-[var(--color-neon-bg)] border rounded-xl py-3 px-4 focus:ring-2 focus:ring-[var(--color-neon-primary)] outline-none ${
            hasError
                ? "border-red-500"
                : "border-[var(--color-neon-border)]"
        }`;

    return (
        <main className="flex-1 flex flex-col items-center justify-center min-h-screen p-6 relative z-10">
            <div className="glow-bg" style={{ top: "10%" }}></div>

            <div className="w-full max-w-md glass-card p-10 flex flex-col items-center text-center relative z-10 shadow-2xl">
                <Link
                    href="/"
                    className="text-[var(--color-neon-primary)] font-bold text-2xl mb-8 tracking-widest uppercase flex items-center gap-2 hover:opacity-80 transition-opacity"
                >
                    <Image
                        src="/vuralogo.png"
                        alt="Vura Logo"
                        width={32}
                        height={32}
                        className="rounded-lg object-contain"
                    />
                    Vura
                </Link>

                <h1 className="text-3xl font-extrabold mb-2 text-white">
                    Create Account
                </h1>

                <p className="text-[var(--color-neon-muted)] mb-8 text-sm">
                    Register a new Vura account to start generating.
                </p>

                {error && (
                    <div className="w-full mb-6 p-4 rounded-xl bg-red-900/20 border border-red-500/50 flex items-start text-red-200">
                        <AlertCircle className="w-5 h-5 mr-3 shrink-0 mt-0.5 text-red-400" />
                        <p className="text-sm text-left">{error}</p>
                    </div>
                )}

                <form
                    onSubmit={handleRegister}
                    className="w-full flex flex-col gap-4"
                    noValidate
                >
                    <div className="text-left">
                        <label className="text-xs text-[var(--color-neon-muted)] ml-1">
                            Full Name
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => {
                                setName(e.target.value);
                                setFieldErrors((p) => ({
                                    ...p,
                                    name: undefined,
                                }));
                            }}
                            className={fieldClass(!!fieldErrors.name)}
                            placeholder="Your Name"
                        />
                        {fieldErrors.name && (
                            <p className="text-xs text-red-400 mt-1 ml-1">
                                {fieldErrors.name}
                            </p>
                        )}
                    </div>

                    <div className="text-left">
                        <label className="text-xs text-[var(--color-neon-muted)] ml-1">
                            Email Address
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                setFieldErrors((p) => ({
                                    ...p,
                                    email: undefined,
                                }));
                            }}
                            className={fieldClass(!!fieldErrors.email)}
                            placeholder="name@example.com"
                        />
                        {fieldErrors.email && (
                            <p className="text-xs text-red-400 mt-1 ml-1">
                                {fieldErrors.email}
                            </p>
                        )}
                    </div>

                    <div className="text-left">
                        <label className="text-xs text-[var(--color-neon-muted)] ml-1">
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                setFieldErrors((p) => ({
                                    ...p,
                                    password: undefined,
                                }));
                            }}
                            className={fieldClass(!!fieldErrors.password)}
                            placeholder="••••••••"
                        />
                        {fieldErrors.password ? (
                            <p className="text-xs text-red-400 mt-1 ml-1">
                                {fieldErrors.password}
                            </p>
                        ) : (
                            <p className="text-xs text-[var(--color-neon-muted)] mt-1 ml-1">
                                Min 8 chars, uppercase, lowercase, number &
                                special character.
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full btn-primary py-4 mt-2 text-lg disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
                    >
                        {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin text-black" />
                        ) : (
                            "Sign Up"
                        )}
                    </button>
                </form>

                <div className="w-full flex items-center gap-4 mt-8 mb-6">
                    <div className="flex-1 h-px bg-[var(--color-neon-border)]"></div>
                    <span className="text-xs text-[var(--color-neon-muted)] uppercase tracking-wider">
                        Or
                    </span>
                    <div className="flex-1 h-px bg-[var(--color-neon-border)]"></div>
                </div>

                <button
                    type="button"
                    onClick={handleGoogleLogin}
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

                <p className="mt-4 text-sm text-[var(--color-neon-muted)]">
                    Already have an account?{" "}
                    <Link
                        href="/login"
                        className="text-[var(--color-neon-primary)] hover:underline"
                    >
                        Log in
                    </Link>
                </p>
            </div>
        </main>
    );
}