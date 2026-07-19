"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { requestAdminOtp, verifyAdminOtp } from "@/app/admin/actions";
import { Lock, Loader2, AlertCircle, Mail, ArrowLeft, ShieldCheck } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

type Step = "credentials" | "otp";

export default function AdminLoginPage() {
    const router = useRouter();
    
    // Step state
    const [step, setStep] = useState<Step>("credentials");
    
    // Inputs state
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    
    // UI state
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    // Step 1: Submit Email
    const handleCredentialsSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await requestAdminOtp(email);
            if (res.success) {
                setStep("otp");
                setSuccessMessage("Verification code sent to " + email);
            } else {
                setError(res.error || "Authentication failed.");
            }
        } catch (err) {
            console.error("Credentials submit error:", err);
            setError("An unexpected error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Submit OTP
    const handleOtpSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await verifyAdminOtp(otp);
            if (res.success) {
                router.push("/admin");
                router.refresh();
            } else {
                setError(res.error || "Verification failed.");
            }
        } catch (err) {
            console.error("OTP submit error:", err);
            setError("An unexpected error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="flex-1 flex flex-col items-center justify-center min-h-screen p-6 relative z-10 bg-[var(--color-neon-bg)]">
            {/* Decorative glows */}
            <div className="glow-bg" style={{ top: "10%" }}></div>
            <div className="absolute top-[30%] left-[20%] w-[300px] h-[300px] bg-red-500/5 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[30%] right-[20%] w-[300px] h-[300px] bg-[var(--color-neon-primary)]/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="w-full max-w-md glass-card p-10 flex flex-col items-center text-center relative z-10 shadow-2xl border-red-500/10 hover:border-red-500/20 transition-all duration-300">
                <Link href="/" className="text-[var(--color-neon-primary)] font-bold text-2xl mb-8 tracking-widest uppercase flex items-center gap-2 hover:opacity-80 transition-opacity">
                    <Image src="/vuralogo.png" alt="Vura Logo" width={32} height={32} className="rounded-lg object-contain" />
                    Vura
                </Link>

                {step === "credentials" ? (
                    /* STEP 1: CREDENTIALS VIEW */
                    <>
                        <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
                            <Lock className="w-5 h-5" />
                        </div>

                        <h1 className="text-2xl font-extrabold mb-2 text-white">Admin Console</h1>
                        <p className="text-[var(--color-neon-muted)] mb-8 text-xs leading-relaxed max-w-[280px]">
                            Access is restricted. Enter your administrator email to receive an OTP code.
                        </p>

                        {error && (
                            <div className="w-full mb-6 p-4 rounded-xl bg-red-950/20 border border-red-500/30 flex items-start text-red-200">
                                <AlertCircle className="w-5 h-5 mr-3 shrink-0 mt-0.5 text-red-400" />
                                <p className="text-xs text-left">{error}</p>
                            </div>
                        )}

                        <form onSubmit={handleCredentialsSubmit} className="w-full flex flex-col gap-4 mb-4">
                            <div className="text-left">
                                <label className="text-xs text-[var(--color-neon-muted)] ml-1">Admin Email ID</label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    className="w-full mt-1.5 bg-[var(--color-neon-surface)] border border-[var(--color-neon-border)] rounded-xl py-3 px-4 focus:ring-2 focus:ring-red-500/30 focus:border-red-500 outline-none text-sm placeholder-[var(--color-neon-muted)]"
                                    placeholder="admin@example.com"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full inline-flex items-center justify-center px-6 py-3 font-semibold text-white bg-red-600 rounded-full transition-all duration-300 shadow-[0_0_15px_rgba(239,68,68,0.2)] hover:bg-red-700 hover:shadow-[0_0_20px_rgba(239,68,68,0.4)] disabled:opacity-50 mt-2"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send Verification Code"}
                            </button>
                        </form>
                    </>
                ) : (
                    /* STEP 2: OTP VERIFICATION VIEW */
                    <>
                        <div className="w-12 h-12 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center mb-6 text-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.1)]">
                            <Mail className="w-5 h-5" />
                        </div>

                        <h1 className="text-2xl font-extrabold mb-2 text-white">Enter OTP Code</h1>
                        <p className="text-[var(--color-neon-muted)] mb-8 text-xs leading-relaxed max-w-[280px]">
                            A 6-digit One-Time Password (OTP) has been sent to your administrator email address.
                        </p>

                        {successMessage && !error && (
                            <div className="w-full mb-6 p-4 rounded-xl bg-[var(--color-neon-primary)]/10 border border-[var(--color-neon-primary)]/30 flex items-start text-[var(--color-neon-primary)]">
                                <p className="text-xs text-left font-semibold">{successMessage}</p>
                            </div>
                        )}

                        {error && (
                            <div className="w-full mb-6 p-4 rounded-xl bg-red-950/20 border border-red-500/30 flex items-start text-red-200">
                                <AlertCircle className="w-5 h-5 mr-3 shrink-0 mt-0.5 text-red-400" />
                                <p className="text-xs text-left">{error}</p>
                            </div>
                        )}

                        <form onSubmit={handleOtpSubmit} className="w-full flex flex-col gap-4 mb-4">
                            <div className="text-left">
                                <label className="text-xs text-[var(--color-neon-muted)] ml-1">Verification Code (6 Digits)</label>
                                <input
                                    type="text"
                                    required
                                    maxLength={6}
                                    pattern="\d{6}"
                                    value={otp}
                                    onChange={e => setOtp(e.target.value.replace(/\D/g, ""))}
                                    className="w-full mt-1.5 bg-[var(--color-neon-surface)] border border-[var(--color-neon-border)] rounded-xl py-3 px-4 focus:ring-2 focus:ring-yellow-500/30 focus:border-yellow-500 outline-none text-center text-lg font-bold tracking-[8px] placeholder-gray-600"
                                    placeholder="000000"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full inline-flex items-center justify-center px-6 py-3 font-semibold text-white bg-yellow-600 rounded-full transition-all duration-300 shadow-[0_0_15px_rgba(202,138,4,0.2)] hover:bg-yellow-700 hover:shadow-[0_0_20px_rgba(202,138,4,0.4)] disabled:opacity-50 mt-2"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify and Login"}
                            </button>
                        </form>

                        <button
                            onClick={() => {
                                setStep("credentials");
                                setError("");
                                setOtp("");
                            }}
                            className="inline-flex items-center gap-1.5 text-xs text-[var(--color-neon-muted)] hover:text-white mt-4"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" /> Back to email login
                        </button>
                    </>
                )}

                <p className="text-[var(--color-neon-muted)] text-[10px] mt-6">
                    Return to <Link href="/" className="text-[var(--color-neon-primary)] hover:underline">Vura Home</Link>
                </p>
            </div>
        </main>
    );
}
